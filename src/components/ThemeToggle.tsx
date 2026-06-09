"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-14 h-7 rounded-full p-0.5 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
        theme === "dark"
          ? "bg-primary/20 hover:bg-primary/30"
          : "bg-border hover:bg-border/80"
      }`}
      aria-label="Toggle dark mode"
    >
      <div
        className={`w-6 h-6 rounded-full shadow-sm transition-all duration-300 flex items-center justify-center ${
          theme === "dark"
            ? "translate-x-7 bg-primary/30"
            : "translate-x-0 bg-surface"
        }`}
      >
        {theme === "dark" ? (
          <Moon className="w-3.5 h-3.5 text-primary-light" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        )}
      </div>
    </button>
  );
}
