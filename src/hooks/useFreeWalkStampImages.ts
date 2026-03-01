import sojournerImg from "@/assets/stamps/free-walk/sojourner-truth.png";
import idaImg from "@/assets/stamps/free-walk/ida-wells.png";
import eleanorImg from "@/assets/stamps/free-walk/eleanor-roosevelt.png";
import wilmaImg from "@/assets/stamps/free-walk/wilma-rudolph.png";
import fannieImg from "@/assets/stamps/free-walk/fannie-lou-hamer.png";
import mayaImg from "@/assets/stamps/free-walk/maya-angelou.png";
import katherineImg from "@/assets/stamps/free-walk/katherine-johnson.png";
import ruthImg from "@/assets/stamps/free-walk/ruth-bader-ginsburg.png";
import malalaImg from "@/assets/stamps/free-walk/malala-yousafzai.png";
import toniImg from "@/assets/stamps/free-walk/toni-morrison.png";
import janeImg from "@/assets/stamps/free-walk/jane-goodall.png";

/**
 * Maps each ROUTE_STOP title to its unique Walk With Queens stamp image.
 * These are purpose-built assets distinct from the Women's History Edition stamps.
 */
export const FREE_WALK_STAMP_IMAGES: Record<string, string> = {
  "Sojourner Truth": sojournerImg,
  "Ida B. Wells": idaImg,
  "Eleanor Roosevelt": eleanorImg,
  "Wilma Rudolph": wilmaImg,
  "Fannie Lou Hamer": fannieImg,
  "Maya Angelou": mayaImg,
  "Katherine Johnson": katherineImg,
  "Ruth Bader Ginsburg": ruthImg,
  "Malala Yousafzai": malalaImg,
  "Toni Morrison": toniImg,
  "Jane Goodall": janeImg,
};

/**
 * Returns a Map<title, stampImageUrl> for Free Walk stamp lookup.
 * Uses locally bundled unique artwork — no database query needed.
 */
export function useFreeWalkStampImages() {
  const data = new Map<string, string>(
    Object.entries(FREE_WALK_STAMP_IMAGES)
  );
  return { data, isLoading: false, error: null };
}
