import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FreeWalkApp } from "@/components/free-walk/FreeWalkApp";

const FreeWalk = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth?mode=signup&redirect=/free-walk", { replace: true });
      } else {
        setAuthed(true);
      }
      setChecking(false);
    });
  }, [navigate]);

  if (checking || !authed) return null;

  return <FreeWalkApp />;
};

export default FreeWalk;
