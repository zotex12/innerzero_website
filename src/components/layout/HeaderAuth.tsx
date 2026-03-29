"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export function HeaderAuth() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoaded(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!loaded) {
    // Placeholder to avoid layout shift
    return <div className="hidden md:block w-[130px]" />;
  }

  if (user) {
    return (
      <Link
        href="/account"
        className="hidden md:flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
      >
        <User className="h-4 w-4" />
        Account
      </Link>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-3">
      <Link
        href="/login"
        className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
      >
        Log In
      </Link>
      <Button href="/waitlist" className="text-sm px-4 py-2">
        Join the Waitlist
      </Button>
    </div>
  );
}
