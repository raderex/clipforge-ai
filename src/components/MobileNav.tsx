import { Scissors, BookOpen, Layers, Settings as SettingsIcon } from "lucide-react";
import type { DashboardTab } from "./DashboardSidebar";

interface MobileNavProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

const tabs = [
  { id: "clipper" as const, label: "Clipper", icon: Scissors },
  { id: "rules" as const, label: "Rules", icon: BookOpen },
  { id: "stack" as const, label: "Stack", icon: Layers },
  { id: "settings" as const, label: "Config", icon: SettingsIcon },
];

const MobileNav = ({ activeTab, onTabChange }: MobileNavProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/30 lg:hidden">
      <nav className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-1 flex-col items-center gap-1 py-3 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-mono text-[10px]">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileNav;
