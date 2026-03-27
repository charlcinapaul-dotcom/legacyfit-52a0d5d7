import { useState, useRef, useEffect } from "react";
import { Share2, Facebook, Twitter, Instagram, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareMenuProps {
  stampName: string;
  stampImageUrl?: string | null;
  shareUrl?: string;
}

// TikTok icon (not in lucide)
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.53V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
    </svg>
  );
}

const BASE_URL = "https://legacyfitvirtual.com";

export function ShareMenu({ stampName, stampImageUrl, shareUrl }: ShareMenuProps) {
  const resolvedUrl = shareUrl || BASE_URL;
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const caption = `I just earned the ${stampName} stamp on LegacyFit! Every Mile Unlocks History. 👟 ${BASE_URL}`;

  const handleNativeShare = async () => {
    try {
      const shareData: ShareData = {
        title: "LegacyFit",
        text: caption,
        url: BASE_URL,
      };
      // Attach image file if available and the API supports it
      if (stampImageUrl && navigator.canShare) {
        try {
          const response = await fetch(stampImageUrl);
          const blob = await response.blob();
          const file = new File([blob], `legacyfit-${stampName.replace(/\s+/g, "-").toLowerCase()}-stamp.png`, { type: blob.type });
          if (navigator.canShare({ files: [file] })) {
            shareData.files = [file];
          }
        } catch {
          // image attachment best-effort
        }
      }
      await navigator.share(shareData);
    } catch {
      // user cancelled or share failed — silent
    }
  };

  const handleFacebook = () => {
    const quote = encodeURIComponent(`I just earned the ${stampName} stamp on LegacyFit! Every Mile Unlocks History.`);
    const url = encodeURIComponent(BASE_URL);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(`I just earned the ${stampName} stamp on LegacyFit! Every Mile Unlocks History. ${BASE_URL}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const handleInstagramTikTok = async () => {
    if (stampImageUrl) {
      try {
        const response = await fetch(stampImageUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `legacyfit-${stampName.replace(/\s+/g, "-").toLowerCase()}-stamp.png`;
        a.click();
        URL.revokeObjectURL(blobUrl);
      } catch {
        // silent — image download best-effort
      }
    }
    try {
      await navigator.clipboard.writeText(caption);
    } catch {
      // fallback for older browsers
    }
    toast.success("Image saved & caption copied — paste in Instagram/TikTok!");
    setOpen(false);
  };

  // On mobile with Web Share API available, skip the popover entirely
  const handleShareButtonClick = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      handleNativeShare();
    } else {
      setOpen((v) => !v);
    }
  };

  return (
    <div className="relative w-full" ref={menuRef}>
      <Button
        variant="outline"
        className="w-full border-primary/40 text-primary hover:bg-primary/10 gap-2"
        onClick={handleShareButtonClick}
      >
        <Share2 className="w-4 h-4" />
        Share
      </Button>

      {open && (
        <div className="absolute bottom-full mb-2 left-0 right-0 z-50 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
          <button
            onClick={handleFacebook}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-primary/10 transition-colors text-foreground border-b border-border/50"
          >
            <Facebook className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span>Share on Facebook</span>
          </button>
          <button
            onClick={handleTwitter}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-primary/10 transition-colors text-foreground border-b border-border/50"
          >
            <Twitter className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <span>Share on X (Twitter)</span>
          </button>
          <button
            onClick={handleInstagramTikTok}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-primary/10 transition-colors text-foreground border-b border-border/50"
          >
            <Instagram className="w-4 h-4 text-pink-500 flex-shrink-0" />
            <span>Share on Instagram</span>
          </button>
          <button
            onClick={handleInstagramTikTok}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-primary/10 transition-colors text-foreground"
          >
            <TikTokIcon className="w-4 h-4 flex-shrink-0" />
            <span>Share on TikTok</span>
          </button>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(resolvedUrl);
                toast.success("Link copied to clipboard!");
              } catch {
                toast.error("Could not copy link");
              }
              setOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-primary/10 transition-colors text-foreground"
          >
            <Link className="w-4 h-4 flex-shrink-0 text-primary" />
            <span>Copy Link</span>
          </button>
        </div>
      )}
    </div>
  );
}
