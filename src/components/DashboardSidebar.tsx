import { motion } from "framer-motion";
import { Zap, Scissors, BookOpen, Settings as SettingsIcon, Layers, BarChart3 } from "lucide-react";

export type DashboardTab = "clipper" | "rules" | "stack" | "settings";

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  clipCount: number;
}

const tabs = [
  { id: "clipper" as const, label: "Clipper", icon: Scissors, desc: "Process videos" },
  { id: "rules" as const, label: "Whop Rules", icon: BookOpen, desc: "Content rules" },
  { id: "stack" as const, label: "Stack", icon: Layers, desc: "AI pipeline" },
  { id: "settings" as const, label: "Config", icon: SettingsIcon, desc: "Settings" },
];

const DashboardSidebar = ({ activeTab, onTabChange, clipCount }: DashboardSidebarProps) => {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="hidden w-64 shrink-0 lg:block"
    >
      <div className="glass sticky top-20 rounded-xl p-4">
        {/* Logo */}
        <div className="mb-6 flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 glow-primary">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-mono text-sm font-bold">
              <span className="text-gradient-primary">CLIP</span>
              <span className="text-foreground">FORGE</span>
            </h1>
            <p className="font-mono text-[10px] text-muted-foreground">AI Video Clipper</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <div className="flex-1">
                  <p className="font-mono text-xs font-medium">{tab.label}</p>
                  <p className="font-mono text-[10px] opacity-60">{tab.desc}</p>
                </div>
                {tab.id === "clipper" && clipCount > 0 && (
                  <span className="rounded-full bg-primary/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">
                    {clipCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Stats */}
        <div className="mt-6 border-t border-border/30 pt-4">
          <div className="flex items-center gap-2 px-2">
            <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="font-mono text-[10px] text-muted-foreground">
              {clipCount} clips forged
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 rounded-lg border border-border/30 bg-secondary/20 p-3">
          <p className="font-mono text-[10px] text-muted-foreground">
            🔒 100% Local Processing
          </p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground/60">
            No data leaves your machine
          </p>
        </div>
      </div>
    </motion.aside>
  );
};

export default DashboardSidebar;
