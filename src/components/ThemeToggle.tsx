import { useTheme } from "../hooks/useTheme";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <button
            className="btn btn--ghost"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
            {theme === "dark" ? "☀️ Claro" : "🌙 Escuro"}
        </button>
    );
}
