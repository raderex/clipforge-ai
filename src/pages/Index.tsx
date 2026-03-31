import { useState, useCallback } from "react";
import Header from "@/components/Header";
import URLInput from "@/components/URLInput";
import PipelineStatus, { type PipelineStage } from "@/components/PipelineStatus";
import ClipResults from "@/components/ClipResults";
import StackInfo from "@/components/StackInfo";
import Settings from "@/components/Settings";
import WhopRules from "@/components/WhopRules";
import DashboardSidebar, { type DashboardTab } from "@/components/DashboardSidebar";
import MobileNav from "@/components/MobileNav";
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
  const [activeTab, setActiveTab] = useState<DashboardTab>("clipper");
  const [whopRules, setWhopRules] = useState("");

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
    console.log("Whop rules applied:", whopRules || "(none)");
    simulatePipeline();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container max-w-7xl py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <DashboardSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            clipCount={clips.length}
          />

          {/* Main content */}
          <main className="min-w-0 flex-1 space-y-6">
            {activeTab === "clipper" && (
              <>
                <URLInput onSubmit={handleSubmit} isProcessing={isProcessing} />
                <PipelineStatus stage={stage} />
                <ClipResults clips={clips} />

                {clips.length === 0 && stage === "idle" && (
                  <div className="glass rounded-xl p-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                      <span className="text-3xl">🎬</span>
                    </div>
                    <h3 className="mb-2 font-mono text-sm font-semibold text-foreground">
                      Ready to Forge
                    </h3>
                    <p className="mx-auto max-w-md font-mono text-xs text-muted-foreground">
                      Paste a video URL above to start. ClipForge will download, transcribe, 
                      analyze, and extract the best clips using your Whop rules.
                    </p>
                    {whopRules && (
                      <p className="mt-3 font-mono text-[10px] text-accent">
                        ✓ Whop rules active — {whopRules.split("\n").filter((l) => l.trim()).length} rules loaded
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === "rules" && (
              <WhopRules rules={whopRules} onRulesChange={setWhopRules} />
            )}

            {activeTab === "stack" && <StackInfo />}

            {activeTab === "settings" && <Settings />}
          </main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />

      <footer className="pb-20 pt-4 text-center font-mono text-[11px] text-muted-foreground lg:pb-8">
        CLIPFORGE · Built with open-source tools · No data leaves your machine
      </footer>
    </div>
  );
};

export default Index;
