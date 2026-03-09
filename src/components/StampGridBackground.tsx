import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const COLS_MOBILE = 6;
const COLS_DESKTOP = 8;
const ROWS = 10;
const GRID_COUNT = COLS_DESKTOP * ROWS; // 80 cells — enough for largest breakpoint

const StampGridBackground = () => {
  const { data: stamps } = useQuery({
    queryKey: ["hero-stamps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("milestones")
        .select("id, stamp_image_url")
        .not("stamp_image_url", "is", null)
        .order("order_index")
        .limit(80);
      if (error) throw error;
      return data?.filter((m) => m.stamp_image_url) ?? [];
    },
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });

  if (!stamps?.length) return null;

  // Repeat stamps to fill all cells
  const gridStamps = Array.from({ length: GRID_COUNT }, (_, i) => ({
    ...stamps[i % stamps.length],
    gridKey: `${stamps[i % stamps.length].id}-${i}`,
  }));

  return (
    <div
      className="absolute inset-0 overflow-hidden stamp-grid-bg"
      style={{ willChange: "auto" }}
    >
      {/* Static stamp grid — no transitions, no animations */}
      <div
        className="absolute inset-0"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS_MOBILE}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {gridStamps.map((stamp) => (
          <div
            key={stamp.gridKey}
            style={{
              backgroundColor: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <img
              src={stamp.stamp_image_url!}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                opacity: 0.45,
                filter: "blur(0.4px)",
                display: "block",
                flexShrink: 0,
              }}
              loading="eager"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Wider desktop grid overlay using CSS media query approach */}
      <style>{`
        @media (min-width: 768px) {
          .stamp-grid-inner {
            grid-template-columns: repeat(${COLS_DESKTOP}, 1fr) !important;
          }
        }
      `}</style>
      <div
        className="stamp-grid-inner absolute inset-0"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS_MOBILE}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {gridStamps.map((stamp) => (
          <div
            key={`d-${stamp.gridKey}`}
            style={{
              backgroundColor: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <img
              src={stamp.stamp_image_url!}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                opacity: 0.45,
                filter: "blur(0.4px)",
                display: "block",
              }}
              loading="eager"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Dark overlay for text readability */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0,0,0,0.45)", pointerEvents: "none" }}
      />
    </div>
  );
};

export default StampGridBackground;
