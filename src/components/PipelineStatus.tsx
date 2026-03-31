import { motion } from "framer-motion";
import { Download, FileAudio, Eye, Brain, Film, Check, Loader2 } from "lucide-react";

export type PipelineStage = "idle" | "downloading" | "transcribing" | "analyzing" | "clipping" | "done";

interface PipelineStatusProps {
  stage: PipelineStage;
}

const stages = [
  { id: "downloading", label: "Download", detail: "yt-dlp", icon: Download },
  { id: "transcribing", label: "Transcribe", detail: "Whisper Small", icon: FileAudio },
  { id: "analyzing", label: "Vision", detail: "Qwen 3.5 2B", icon: Eye },
  { id: "clipping", label: "Brain", detail: "Gemini 2.5", icon: Brain },
  { id: "done", label: "Export", detail: "FFmpeg", icon: Film },
] as const;

const stageOrder = ["idle", "downloading", "transcribing", "analyzing", "clipping", "done"];

const PipelineStatus = ({ stage }: PipelineStatusProps) => {
  if (stage === "idle") return null;

  const currentIndex = stageOrder.indexOf(stage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="glass rounded-xl p-6">
        <h2 className="mb-5 font-mono text-sm font-semibold uppercase tracking-wider text-foreground">
          Pipeline
        </h2>
        <div className="flex items-center justify-between gap-2">
          {stages.map((s, i) => {
            const stageIdx = stageOrder.indexOf(s.id);
            const isActive = stageIdx === currentIndex;
            const isDone = stageIdx < currentIndex;
            const Icon = s.icon;

            return (
              <div key={s.id} className="flex flex-1 flex-col items-center gap-2">
                <motion.div
                  animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-all ${
                    isDone
                      ? "border-success/50 bg-success/10 text-success"
                      : isActive
                      ? "border-primary/50 bg-primary/10 text-primary glow-primary"
                      : "border-border/30 bg-secondary/30 text-muted-foreground"
                  }`}
                >
                  {isDone ? (
                    <Check className="h-5 w-5" />
                  ) : isActive ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </motion.div>
                <div className="text-center">
                  <p className={`font-mono text-xs font-medium ${isActive ? "text-primary" : isDone ? "text-success" : "text-muted-foreground"}`}>
                    {s.label}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground/60">{s.detail}</p>
                </div>
                {i < stages.length - 1 && (
                  <div className="absolute" />
                )}
              </div>
            );
          })}
        </div>
        {/* Connector lines */}
        <div className="mt-[-52px] flex items-center px-[48px]">
          {stages.slice(0, -1).map((_, i) => {
            const stageIdx = i + 1;
            const isDone = stageOrder.indexOf(stages[i].id) < currentIndex;
            return (
              <div
                key={i}
                className={`mx-1 h-[2px] flex-1 rounded-full transition-colors ${
                  isDone ? "bg-success/50" : "bg-border/30"
                }`}
              />
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default PipelineStatus;
