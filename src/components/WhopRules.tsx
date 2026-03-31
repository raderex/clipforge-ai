import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface WhopRulesProps {
  onRulesChange: (rules: string) => void;
  rules: string;
}

const WhopRules = ({ onRulesChange, rules }: WhopRulesProps) => {
  const [localRules, setLocalRules] = useState(rules);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onRulesChange(localRules);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="glass rounded-xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-accent" />
            <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-foreground">
              Whop Rules
            </h2>
          </div>
          <span className="rounded-full border border-accent/30 bg-accent/5 px-2 py-0.5 font-mono text-[10px] text-accent">
            → Gemini Brain
          </span>
        </div>

        <p className="mb-3 font-mono text-[11px] text-muted-foreground">
          Paste your Whop community rules below. These are injected into the Gemini 2.5 prompt 
          to ensure clips comply with your content guidelines before FFmpeg renders them.
        </p>

        <Textarea
          value={localRules}
          onChange={(e) => {
            setLocalRules(e.target.value);
            setSaved(false);
          }}
          placeholder={`Example Whop rules:\n\n- No profanity in clips\n- Must include a hook in the first 3 seconds\n- Keep clips under 60 seconds\n- Include branding overlay\n- Avoid copyrighted music segments\n- Focus on educational/value content\n- Vertical format preferred (9:16)`}
          className="min-h-[180px] border-border/50 bg-background/50 font-mono text-xs placeholder:text-muted-foreground/40"
        />

        <div className="mt-3 flex items-center justify-between">
          <p className="font-mono text-[10px] text-muted-foreground">
            {localRules.length > 0
              ? `${localRules.split("\n").filter((l) => l.trim()).length} rules detected`
              : "No rules set — Gemini will use defaults"}
          </p>
          <Button
            onClick={handleSave}
            size="sm"
            className="gap-2 font-mono text-xs"
            variant={saved ? "outline" : "default"}
          >
            {saved ? (
              <>
                <Check className="h-3.5 w-3.5 text-success" />
                <span className="text-success">Saved</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Save Rules
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default WhopRules;
