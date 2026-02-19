import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
      {/* Stamp sheet layer */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          gridStamps.length ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="w-full h-full grid grid-cols-4 md:grid-cols-6">
          {gridStamps.map((stamp) => (
            <div
              key={stamp.gridKey}
              className="flex items-center justify-center p-1"
            >
              <img
                src={stamp.stamp_image_url!}
                alt=""
                className="w-full h-full object-contain opacity-50 blur-[0.5px]"
                loading="eager"
                fetchPriority="high"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dark overlay for text readability */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      />
    </div>
  );
};

export default StampGridBackground;
