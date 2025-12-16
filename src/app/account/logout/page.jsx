"use client";

import { useEffect } from "react";
import useAuth from "@/utils/useAuth";

export default function Logout() {
  const { signOut } = useAuth();

  useEffect(() => {
    const logout = async () => {
      try {
        await signOut({
          callbackUrl: "/account/signin",
          redirect: true,
        });
      } catch (error) {
        console.error("Logout error:", error);
        if (typeof window !== "undefined") {
          window.location.href = "/account/signin";
        }
      }
    };

    logout();
  }, [signOut]);

  return (
    <div className="min-h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A] flex items-center justify-center">
      <p className="text-[#6F6F6F] dark:text-[#AAAAAA] font-inter">
        Signing out...
      </p>
    </div>
  );
}
