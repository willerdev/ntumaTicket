import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const ProtectedRoute = () => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuth(!!user);
    });
  }, []);

  if (isAuth === null) return null;
  return isAuth ? <Outlet /> : <Navigate to="/signin" />;
};

export default ProtectedRoute; 