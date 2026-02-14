import { useEffect, useRef } from "react";
import heroCollage from "@/assets/hero-stamp-collage.jpg";

export function HeroBackground() {
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (bgRef.current) {
        const scrollY = window.scrollY;
        bgRef.current.style.transform = `translateY(${scrollY * 0.3}px)`;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Stamp collage layer — blurred, low opacity */}
      <div
        ref={bgRef}
        className="absolute -inset-20"
        style={{
          backgroundImage: `url(${heroCollage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(8px)",
          opacity: 0.18,
        }}
      />

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(11, 11, 11, 0.82)" }}
      />

      {/* Radial gradient for center darkening / text readability */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
