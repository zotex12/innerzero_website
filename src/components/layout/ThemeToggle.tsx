"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Deliberate hydration guard: the server cannot know the visitor's
    // theme, so the first render is a fixed placeholder and this mount
    // effect swaps in the real value set by the layout's inline script.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const stored = document.documentElement.getAttribute("data-theme");
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    }
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  }

  if (!mounted) {
    return (
      <button
        className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary"
        aria-label="Toggle theme"
      >
        <Moon className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors duration-150 hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:outline-none cursor-pointer"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 theme-icon-rotate" />
      ) : (
        <Moon className="h-5 w-5 theme-icon-rotate" />
      )}
    </button>
  );
}
