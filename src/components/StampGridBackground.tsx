import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const GRID_COUNT = 24;

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
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {/* 6 cols × 4 rows = 24 stamps, fully static */}
      <div className="grid grid-cols-6 grid-rows-4 h-full w-full">
        {Array.from({ length: GRID_COUNT }, (_, i) => {
          const stamp = stamps?.[i % (stamps.length || 1)];
          return (
            <div key={i} className="aspect-square bg-black overflow-hidden">
              {stamp?.stamp_image_url && (
                <img
                  src={stamp.stamp_image_url}
                  alt=""
                  className="w-full h-full object-contain opacity-45"
                  loading="eager"
                  // @ts-ignore
                  fetchpriority="high"
                  draggable={false}
                />
              )}
            </div>
          );
        })}
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
