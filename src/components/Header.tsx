import { motion } from "framer-motion";
import { Github, Zap } from "lucide-react";

const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass sticky top-0 z-50 border-b border-border/30"
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 glow-primary">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <h1 className="font-mono text-xl font-bold tracking-tight">
            <span className="text-gradient-primary">CLIP</span>
            <span className="text-foreground">FORGE</span>
          </h1>
          <span className="rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 font-mono text-[10px] text-primary">
            v0.1.0
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden font-mono text-xs text-muted-foreground sm:block">
            100% LOCAL · OPEN SOURCE
          </span>
          <a
            href="#"
            className="flex items-center gap-1.5 rounded-md border border-border/50 bg-secondary px-3 py-1.5 font-mono text-xs text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            <Github className="h-3.5 w-3.5" />
            GitHub
          </a>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
