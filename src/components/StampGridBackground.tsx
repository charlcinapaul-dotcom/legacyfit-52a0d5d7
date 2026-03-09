import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// 8 cols × 10 rows = 80 cells on desktop; 6 cols × 10 rows on mobile
const GRID_COUNT = 80;

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

  const gridStamps = Array.from({ length: GRID_COUNT }, (_, i) => ({
    url: stamps[i % stamps.length].stamp_image_url!,
    key: `${stamps[i % stamps.length].id}-${i}`,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden stamp-grid-bg">
      {/* Fully static stamp grid — no transitions, no animations, no transforms */}
      <div className="absolute inset-0 grid grid-cols-6 md:grid-cols-8 grid-rows-10 bg-black">
        {gridStamps.map(({ url, key }) => (
          <div key={key} className="bg-black overflow-hidden">
            <img
              src={url}
              alt=""
              className="w-full h-full object-contain opacity-45"
              loading="eager"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Dark overlay for text readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      />
    </div>
  );
};

export default StampGridBackground;
