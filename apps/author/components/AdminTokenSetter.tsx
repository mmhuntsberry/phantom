"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function AdminTokenSetter() {
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("admin");
    if (!token) return;
    document.cookie = `admin_token=${token}; path=/; SameSite=Lax`;
  }, [params]);

  return null;
}
