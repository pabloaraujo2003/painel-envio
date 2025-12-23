import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem("theme") as Theme | null;
        if (saved) return saved;

        return window.matchMedia("(prefers-color-scheme: light)").matches
            ? "light"
            : "dark";
    });

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    return { theme, setTheme };
}
