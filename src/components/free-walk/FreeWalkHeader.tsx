import { Link } from "react-router-dom";
import legacyFitLogo from "@/assets/legacyfit-logo.png";

export function FreeWalkHeader() {
  return (
    <div className="flex justify-between items-center px-6 md:px-[clamp(24px,6vw,72px)] pt-6 pb-4">
      <Link to="/" className="shrink-0">
        <img src={legacyFitLogo} alt="LegacyFit" className="h-16 md:h-24 w-auto" />
      </Link>
      <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-primary border border-primary/30 bg-primary/10 px-3.5 py-1.5">
        Free Track
      </span>
    </div>
  );
}
