import { motion } from "framer-motion";
import { Box, Cpu, Brain, Film, FileAudio, Eye } from "lucide-react";

const tools = [
  { name: "yt-dlp", desc: "Video downloader", icon: Box, color: "text-primary" },
  { name: "Whisper Small", desc: "Speech-to-text", icon: FileAudio, color: "text-success" },
  { name: "Qwen 3.5 2B", desc: "Vision analysis", icon: Eye, color: "text-warning" },
  { name: "Gemini 2.5", desc: "AI brain / clip selector", icon: Brain, color: "text-accent" },
  { name: "FFmpeg", desc: "Video rendering", icon: Film, color: "text-primary" },
  { name: "Local GPU", desc: "All processing on device", icon: Cpu, color: "text-foreground" },
];

const StackInfo = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="glass rounded-xl p-6">
        <h2 className="mb-4 font-mono text-sm font-semibold uppercase tracking-wider text-foreground">
          Open-Source Stack
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.name}
                className="flex items-center gap-3 rounded-lg border border-border/30 bg-secondary/20 p-3 transition-colors hover:bg-secondary/40"
              >
                <Icon className={`h-5 w-5 shrink-0 ${tool.color}`} />
                <div>
                  <p className="font-mono text-xs font-semibold text-foreground">{tool.name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{tool.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default StackInfo;
