import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ROTATIONS = [-4, 2, -2, 5, -3, 1, -5, 3, -1, 4, -2, 3, -3, 2, -1, 4, -5, 3, -2, 1, -4, 5, -3, 2];
const GRID_COUNT = 24; // enough to fill the section without gaps

const StampGridBackground = () => {
  const { data: stamps } = useQuery({
    queryKey: ["hero-stamps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("milestones")
        .select("id, stamp_image_url")
        .not("stamp_image_url", "is", null)
        .order("order_index")
        .limit(24);
      if (error) throw error;
      return data?.filter((m) => m.stamp_image_url) ?? [];
    },
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });

  // Repeat stamps to fill GRID_COUNT cells if we have fewer unique stamps
  const gridStamps = stamps?.length
    ? Array.from({ length: GRID_COUNT }, (_, i) => ({
        ...stamps[i % stamps.length],
        gridKey: `${stamps[i % stamps.length].id}-${i}`,
      }))
    : [];

  return (
    <div className="absolute inset-0 overflow-hidden stamp-grid-bg">
      {/* Stamp grid layer */}
      <div
        className={`absolute inset-0 grid grid-cols-4 md:grid-cols-6 gap-1 p-1 transition-opacity duration-700 ${
          gridStamps.length ? "opacity-[0.27]" : "opacity-0"
        }`}
      >
        {gridStamps.map((stamp, i) => (
          <div
            key={stamp.gridKey}
            className="flex items-center justify-center p-0.5"
            style={{ transform: `rotate(${ROTATIONS[i % ROTATIONS.length]}deg)` }}
          >
            <img
              src={stamp.stamp_image_url!}
              alt=""
              className="w-full h-full object-contain"
              loading="eager"
              fetchPriority="high"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Dark overlay for text readability */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      />
    </div>
  );
};

export default StampGridBackground;
