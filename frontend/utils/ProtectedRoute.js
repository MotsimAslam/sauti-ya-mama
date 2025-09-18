// frontend/utils/ProtectedRoute.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "./supabase";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Get current session
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        router.push("/auth");
      } else {
        setSession(data.session);
      }
      setLoading(false);
    };

    getSession();

    // Subscribe to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) router.push("/auth");
        else setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  if (loading) return <p className="p-6 text-center">Checking session...</p>;

  return <>{children}</>;
}
