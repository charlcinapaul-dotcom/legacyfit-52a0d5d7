import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ROTATIONS = [-4, 2, -2, 5, -3, 1, -5, 3, -1, 4, -2, 3];

const StampGridBackground = () => {
  const { data: stamps } = useQuery({
    queryKey: ["hero-stamps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("milestones")
        .select("id, stamp_image_url")
        .not("stamp_image_url", "is", null)
        .order("order_index")
        .limit(12);
      if (error) throw error;
      return data?.filter((m) => m.stamp_image_url) ?? [];
    },
    staleTime: 1000 * 60 * 30,
  });

  return (
    <div className="absolute inset-0 overflow-hidden stamp-grid-bg">
      {/* Stamp grid layer */}
      <div
        className={`absolute inset-0 grid grid-cols-3 md:grid-cols-4 gap-2 p-2 transition-opacity duration-700 ${
          stamps?.length ? "opacity-40" : "opacity-0"
        }`}
      >
        {stamps?.map((stamp, i) => (
          <div
            key={stamp.id}
            className="flex items-center justify-center p-1"
            style={{ transform: `rotate(${ROTATIONS[i % ROTATIONS.length]}deg)` }}
          >
            <img
              src={stamp.stamp_image_url!}
              alt=""
              className="w-full h-full object-contain max-h-[180px]"
              loading="lazy"
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
