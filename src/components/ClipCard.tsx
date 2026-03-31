import { motion } from "framer-motion";
import { Clock, Download, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Clip {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  duration: string;
  score: number;
  tags: string[];
  reason: string;
}

interface ClipCardProps {
  clip: Clip;
  index: number;
}

const ClipCard = ({ clip, index }: ClipCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass gradient-border group rounded-xl p-5 transition-all hover:bg-card/80"
    >
      {/* Thumbnail placeholder */}
      <div className="relative mb-4 aspect-video overflow-hidden rounded-lg bg-secondary/50">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary backdrop-blur-sm transition-transform group-hover:scale-110">
            <Play className="h-5 w-5 ml-0.5" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 rounded bg-background/80 px-1.5 py-0.5 font-mono text-[10px] text-foreground backdrop-blur-sm">
          {clip.duration}
        </div>
        <div className="absolute left-2 top-2 flex items-center gap-1 rounded bg-primary/20 px-1.5 py-0.5 backdrop-blur-sm">
          <Sparkles className="h-3 w-3 text-primary" />
          <span className="font-mono text-[10px] font-bold text-primary">{clip.score}%</span>
        </div>
      </div>

      <h3 className="mb-1 font-mono text-sm font-semibold text-foreground line-clamp-1">
        {clip.title}
      </h3>

      <div className="mb-3 flex items-center gap-1.5 text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span className="font-mono text-[11px]">
          {clip.startTime} → {clip.endTime}
        </span>
      </div>

      <p className="mb-3 text-xs text-muted-foreground line-clamp-2">
        {clip.reason}
      </p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {clip.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-accent/30 bg-accent/5 px-2 py-0.5 font-mono text-[10px] text-accent"
          >
            {tag}
          </span>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2 border-primary/30 font-mono text-xs text-primary hover:bg-primary/10 hover:text-primary"
      >
        <Download className="h-3.5 w-3.5" />
        Export Clip
      </Button>
    </motion.div>
  );
};

export default ClipCard;
