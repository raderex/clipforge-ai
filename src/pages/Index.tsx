import { useState, useCallback } from "react";
import Header from "@/components/Header";
import URLInput from "@/components/URLInput";
import PipelineStatus, { type PipelineStage } from "@/components/PipelineStatus";
import ClipResults from "@/components/ClipResults";
import StackInfo from "@/components/StackInfo";
import Settings from "@/components/Settings";
import type { Clip } from "@/components/ClipCard";

const MOCK_CLIPS: Clip[] = [
  {
    id: "1",
    title: "The key insight about AI agents",
    startTime: "02:14",
    endTime: "03:01",
    duration: "0:47",
    score: 94,
    tags: ["hook", "insight", "viral"],
    reason: "Strong opening hook with a surprising claim backed by data. High engagement potential.",
  },
  {
    id: "2",
    title: "Why open-source wins",
    startTime: "08:32",
    endTime: "09:45",
    duration: "1:13",
    score: 89,
    tags: ["opinion", "trending"],
    reason: "Passionate delivery with clear argument structure. Aligns with trending discourse.",
  },
  {
    id: "3",
    title: "Demo: real-time processing",
    startTime: "14:05",
    endTime: "15:20",
    duration: "1:15",
    score: 87,
    tags: ["demo", "technical"],
    reason: "Visual demonstration with high information density. Good for technical audience.",
  },
  {
    id: "4",
    title: "The future prediction",
    startTime: "22:10",
    endTime: "23:02",
    duration: "0:52",
    score: 82,
    tags: ["prediction", "thought-leader"],
    reason: "Bold prediction that sparks debate. Great for engagement and comments.",
  },
];

const STAGE_DURATIONS: Record<string, number> = {
  downloading: 2000,
  transcribing: 2500,
  analyzing: 3000,
  clipping: 2000,
};

const Index = () => {
  const [stage, setStage] = useState<PipelineStage>("idle");
  const [clips, setClips] = useState<Clip[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const simulatePipeline = useCallback(async () => {
    setIsProcessing(true);
    setClips([]);

    const stageSequence: PipelineStage[] = ["downloading", "transcribing", "analyzing", "clipping", "done"];

    for (const s of stageSequence) {
      setStage(s);
      if (s !== "done") {
        await new Promise((r) => setTimeout(r, STAGE_DURATIONS[s]));
      }
    }

    setClips(MOCK_CLIPS);
    setIsProcessing(false);
  }, []);

  const handleSubmit = (url: string) => {
    console.log("Processing URL:", url);
    simulatePipeline();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-5xl space-y-6 py-8">
        <URLInput onSubmit={handleSubmit} isProcessing={isProcessing} />
        <PipelineStatus stage={stage} />
        <ClipResults clips={clips} />
        <div className="grid gap-6 lg:grid-cols-2">
          <StackInfo />
          <Settings />
        </div>
        <footer className="pb-8 pt-4 text-center font-mono text-[11px] text-muted-foreground">
          CLIPFORGE · Built with open-source tools · No data leaves your machine
        </footer>
      </main>
    </div>
  );
};

export default Index;
