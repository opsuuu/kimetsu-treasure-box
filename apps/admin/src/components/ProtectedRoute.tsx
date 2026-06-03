import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { supabase } from "@/lib/supabase";

type AuthState = "loading" | "authorized" | "unauthorized";

export function ProtectedRoute() {
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setAuthState("unauthorized");
        return;
      }

      const { data: adminProfile } = await supabase
        .from("admin_profiles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (!adminProfile) {
        await supabase.auth.signOut();
        setAuthState("unauthorized");
        return;
      }

      setAuthState("authorized");
    }

    checkAuth();
  }, []);

  if (authState === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

  if (authState === "unauthorized") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
