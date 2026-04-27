import { useEffect, useState } from "react";
import JSZip from "jszip";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Download, ImageOff, VolumeX } from "lucide-react";
import { toast } from "sonner";

interface MilestoneAsset {
  id: string;
  order_index: number;
  title: string;
  miles_required: number;
  stamp_title: string | null;
  stamp_mileage_display: string | null;
  stamp_image_url: string | null;
  audio_url: string | null;
}

interface Props {
  challengeId: string;
  challengeSlug: string | null;
  challengeTitle: string;
}

function safeFile(s: string | null | undefined, fallback: string) {
  const base = (s ?? fallback).toString().trim() || fallback;
  return base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || fallback;
}

export function ChallengeAssetCard({ challengeId, challengeSlug, challengeTitle }: Props) {
  const [milestones, setMilestones] = useState<MilestoneAsset[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("milestones")
        .select("id, order_index, title, miles_required, stamp_title, stamp_mileage_display, stamp_image_url, audio_url")
        .eq("challenge_id", challengeId)
        .order("order_index", { ascending: true });
      if (cancelled) return;
      if (error) {
        toast.error(`Failed to load milestones: ${error.message}`);
        setMilestones([]);
      } else {
        setMilestones((data ?? []) as MilestoneAsset[]);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [challengeId]);

  const downloadAll = async () => {
    if (!milestones?.length) return;
    setDownloading(true);
    try {
      const zip = new JSZip();
      const slug = challengeSlug || challengeId.slice(0, 8);
      const folder = zip.folder(slug)!;
      const stamps = folder.folder("stamps")!;
      const audio = folder.folder("audio")!;
      const manifest: any[] = [];
      const skipped: string[] = [];

      for (const m of milestones) {
        const idx = String(m.order_index).padStart(2, "0");
        const entry: any = {
          order_index: m.order_index,
          title: m.title,
          miles_required: m.miles_required,
          stamp_title: m.stamp_title,
          stamp_mileage_display: m.stamp_mileage_display,
          stamp_image_url: m.stamp_image_url,
          audio_url: m.audio_url,
        };

        if (m.stamp_image_url) {
          try {
            const res = await fetch(m.stamp_image_url);
            if (res.ok) {
              const blob = await res.blob();
              const ext = (m.stamp_image_url.split(".").pop() || "png").split("?")[0].slice(0, 5);
              stamps.file(`${idx}-${safeFile(m.stamp_title, m.title)}.${ext}`, blob);
            } else {
              skipped.push(`stamp ${idx} (HTTP ${res.status})`);
            }
          } catch (e) {
            skipped.push(`stamp ${idx} (fetch failed)`);
          }
        } else {
          skipped.push(`stamp ${idx} (missing)`);
        }

        if (m.audio_url) {
          try {
            const res = await fetch(m.audio_url);
            if (res.ok) {
              const blob = await res.blob();
              audio.file(`${idx}-${safeFile(m.title, "milestone")}.mp3`, blob);
            } else {
              skipped.push(`audio ${idx} (HTTP ${res.status})`);
            }
          } catch (e) {
            skipped.push(`audio ${idx} (fetch failed)`);
          }
        } else {
          skipped.push(`audio ${idx} (missing)`);
        }

        manifest.push(entry);
      }

      folder.file("manifest.json", JSON.stringify({
        challenge: { id: challengeId, slug, title: challengeTitle },
        generated_at: new Date().toISOString(),
        milestones: manifest,
        skipped,
      }, null, 2));

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}-assets.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success(`Downloaded ${slug}-assets.zip${skipped.length ? ` (${skipped.length} skipped)` : ""}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-xs py-4">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading assets…
      </div>
    );
  }

  if (!milestones || milestones.length === 0) {
    return <p className="text-xs text-muted-foreground py-2">No milestones found.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
          {milestones.length} milestone{milestones.length === 1 ? "" : "s"}
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={downloadAll}
          disabled={downloading}
          className="h-7 gap-1.5 text-xs"
        >
          {downloading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
          {downloading ? "Zipping…" : "Download all assets"}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {milestones.map((m) => (
          <div key={m.id} className="bg-background border border-border rounded-md p-3 space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-16 h-16 rounded-md bg-secondary/40 border border-border flex-shrink-0 overflow-hidden flex items-center justify-center">
                {m.stamp_image_url ? (
                  <a href={m.stamp_image_url} target="_blank" rel="noopener noreferrer" title="Open full size">
                    <img
                      src={m.stamp_image_url}
                      alt={m.stamp_title ?? m.title}
                      className="w-16 h-16 object-cover hover:opacity-80 transition-opacity"
                      loading="lazy"
                    />
                  </a>
                ) : (
                  <ImageOff className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider text-primary font-bold">
                  {m.stamp_mileage_display || `${m.miles_required} MI`}
                </p>
                <p className="text-xs font-semibold text-foreground truncate" title={m.title}>
                  {m.title}
                </p>
                {m.stamp_title && (
                  <p className="text-[10px] text-muted-foreground truncate" title={m.stamp_title}>
                    {m.stamp_title}
                  </p>
                )}
                <div className="flex gap-1 mt-1">
                  {!m.stamp_image_url && (
                    <span className="text-[9px] uppercase bg-destructive/15 text-destructive px-1.5 py-0.5 rounded-sm font-semibold">
                      No stamp
                    </span>
                  )}
                  {!m.audio_url && (
                    <span className="text-[9px] uppercase bg-destructive/15 text-destructive px-1.5 py-0.5 rounded-sm font-semibold">
                      No audio
                    </span>
                  )}
                </div>
              </div>
            </div>

            {m.audio_url ? (
              <audio controls preload="none" src={m.audio_url} className="w-full h-8" />
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground py-1">
                <VolumeX className="w-3 h-3" /> No narration
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}