import { useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, ChevronDown, ChevronUp } from "lucide-react";

const Settings = () => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="glass rounded-xl">
        <button
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between p-6"
        >
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4 text-primary" />
            <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-foreground">
              Configuration
            </h2>
          </div>
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="border-t border-border/30 px-6 pb-6"
          >
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <ConfigItem label="Whisper Model" value="small" options={["tiny", "base", "small", "medium", "large"]} />
              <ConfigItem label="Vision Model" value="qwen-3.5-2b" options={["qwen-3.5-2b", "qwen-3.5-7b"]} />
              <ConfigItem label="Brain Model" value="gemini-2.5" options={["gemini-2.5-flash", "gemini-2.5-pro"]} />
              <ConfigItem label="Max Clip Duration" value="60s" options={["30s", "60s", "90s", "120s"]} />
              <ConfigItem label="Output Format" value="mp4" options={["mp4", "webm", "mov"]} />
              <ConfigItem label="Resolution" value="1080p" options={["720p", "1080p", "4K"]} />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const ConfigItem = ({ label, value, options }: { label: string; value: string; options: string[] }) => {
  const [selected, setSelected] = useState(value);
  return (
    <div>
      <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full rounded-lg border border-border/50 bg-background/50 px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
};

export default Settings;
