import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link, Loader2, Scissors, Upload, X, FileVideo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface URLInputProps {
  onSubmit: (url: string, file?: File) => void;
  isProcessing: boolean;
}

const URLInput = ({ onSubmit, isProcessing }: URLInputProps) => {
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"url" | "upload">("url");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "url" && url.trim()) {
      onSubmit(url.trim());
    } else if (mode === "upload" && file) {
      onSubmit(file.name, file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (pasted) {
      setUrl(pasted);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type.startsWith("video/")) {
      setFile(dropped);
      setMode("upload");
    }
  };

  const canSubmit = mode === "url" ? url.trim().length > 0 : !!file;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="glass gradient-border rounded-xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link className="h-4 w-4 text-primary" />
            <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-foreground">
              Video Source
            </h2>
          </div>
          <div className="flex gap-1 rounded-lg border border-border/50 bg-background/30 p-0.5">
            <button
              type="button"
              onClick={() => setMode("url")}
              className={`rounded-md px-3 py-1 font-mono text-[11px] font-medium transition-all ${
                mode === "url"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              URL
            </button>
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`rounded-md px-3 py-1 font-mono text-[11px] font-medium transition-all ${
                mode === "upload"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Upload
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "url" ? (
            <div className="flex gap-3">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onPaste={handlePaste}
                placeholder="Paste video URL here..."
                type="url"
                className="flex-1 border-border/50 bg-background/50 font-mono text-sm placeholder:text-muted-foreground/50"
                disabled={isProcessing}
              />
              <Button
                type="submit"
                disabled={!canSubmit || isProcessing}
                className="gap-2 bg-primary font-mono text-sm font-semibold text-primary-foreground hover:bg-primary/90 glow-primary"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Scissors className="h-4 w-4" />
                )}
                {isProcessing ? "Processing..." : "Forge Clips"}
              </Button>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-all ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : file
                  ? "border-accent/50 bg-accent/5"
                  : "border-border/50 bg-background/30"
              }`}
            >
              {file ? (
                <div className="flex w-full items-center gap-3">
                  <FileVideo className="h-8 w-8 shrink-0 text-accent" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-sm font-medium text-foreground">
                      {file.name}
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div className="text-center">
                    <p className="font-mono text-sm text-foreground">
                      Drop a video file or{" "}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="font-semibold text-primary underline-offset-2 hover:underline"
                      >
                        browse
                      </button>
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                      MP4, MOV, MKV, WebM up to 2GB
                    </p>
                  </div>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {mode === "upload" && file && (
            <Button
              type="submit"
              disabled={isProcessing}
              className="w-full gap-2 bg-primary font-mono text-sm font-semibold text-primary-foreground hover:bg-primary/90 glow-primary"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Scissors className="h-4 w-4" />
              )}
              {isProcessing ? "Processing..." : "Forge Clips"}
            </Button>
          )}
        </form>

        <p className="mt-3 font-mono text-[11px] text-muted-foreground">
          {mode === "url"
            ? "Supports YouTube, Vimeo, Twitter/X, and 1000+ sites via yt-dlp"
            : "Local files are processed entirely on your machine — nothing uploaded"}
        </p>
      </div>
    </motion.div>
  );
};

export default URLInput;
