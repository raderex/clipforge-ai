import { useState } from "react";
import { motion } from "framer-motion";
import { Link, Loader2, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface URLInputProps {
  onSubmit: (url: string) => void;
  isProcessing: boolean;
}

const URLInput = ({ onSubmit, isProcessing }: URLInputProps) => {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) onSubmit(url.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="glass gradient-border rounded-xl p-6">
        <div className="mb-4 flex items-center gap-2">
          <Link className="h-4 w-4 text-primary" />
          <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-foreground">
            Video Source
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="flex-1 border-border/50 bg-background/50 font-mono text-sm placeholder:text-muted-foreground/50"
            disabled={isProcessing}
          />
          <Button
            type="submit"
            disabled={!url.trim() || isProcessing}
            className="gap-2 bg-primary font-mono text-sm font-semibold text-primary-foreground hover:bg-primary/90 glow-primary"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Scissors className="h-4 w-4" />
            )}
            {isProcessing ? "Processing..." : "Forge Clips"}
          </Button>
        </form>
        <p className="mt-3 font-mono text-[11px] text-muted-foreground">
          Supports YouTube, Vimeo, Twitter/X, and 1000+ sites via yt-dlp
        </p>
      </div>
    </motion.div>
  );
};

export default URLInput;
