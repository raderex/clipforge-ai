import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import ClipCard, { type Clip } from "./ClipCard";

interface ClipResultsProps {
  clips: Clip[];
}

const ClipResults = ({ clips }: ClipResultsProps) => {
  if (clips.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-foreground">
          Forged Clips
        </h2>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
          {clips.length}
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clips.map((clip, i) => (
          <ClipCard key={clip.id} clip={clip} index={i} />
        ))}
      </div>
    </motion.div>
  );
};

export default ClipResults;
