import { useMemo, useState, useRef, useEffect } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { fetchData } from "./services/api";
import { parseLines } from "./utils";

import Header from "./components/Header";
import TextareaCard from "./components/TextareaCard";
import Controls from "./components/Controls";
import PreviewTable from "./components/PreviewTable";
import ResultsTable from "./components/ResultsTable";

export default function App() {
  const fileInputRef = useRef(null);

  const [linhasText, setLinhasText] = useState("");
  const [cmdsText, setCmdsText] = useState("");
  const [sender, setSender] = useState("");
  const [limite, setLimite] = useState(50);

  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [apiStatus, setApiStatus] = useState("loading"); // "loading", "ok", "error"

  /* ======================
     API
  ====================== */
  useEffect(() => {
    const testApi = async () => {
      try {
        await fetchData("/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: "oi" }),
        });
        setApiStatus("ok");
      } catch (error) {
        setApiStatus("error");
        console.error("API connection test failed:", error);
      }
    };

    testApi();
  }, []);

  /* ======================
     THEME
  ====================== */
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }

  /* ======================
     DATA
  ====================== */
  const linhas = useMemo(() => parseLines(linhasText), [linhasText]);
  const comandos = useMemo(() => parseLines(cmdsText), [cmdsText]);

  const totalLinhas = linhas.length;
  const totalCmds = comandos.length;
  const match = totalLinhas > 0 && totalLinhas === totalCmds;
  const diff = totalLinhas - totalCmds;

  const items = useMemo(() => {
    const total = Math.min(totalLinhas, totalCmds, limite);
    return Array.from({ length: total }, (_, i) => ({
      to: linhas[i],
      message: comandos[i],
      index: i,
    }));
  }, [linhas, comandos, totalLinhas, totalCmds, limite]);

  const preview = useMemo(() => items.slice(0, 5), [items]);

  const badge = useMemo(() => {
    if (totalLinhas === 0 && totalCmds === 0)
      return { tone: "neutral", icon: "ℹ️", text: "Cole ou importe os dados" };

    if (!match) {
      return {
        tone: "danger",
        icon: "⚠️",
        text:
          diff > 0
            ? `Faltam ${Math.abs(diff)} comandos`
            : `Faltam ${Math.abs(diff)} linhas`,
      };
    }

    return { tone: "success", icon: "✅", text: "Pronto para enviar (1:1)" };
  }, [totalLinhas, totalCmds, match, diff]);

  async function enviar() {
    setSending(true);
    setResult(null);

    try {
      const res = await fetch("/api/send-1-1", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sender: sender || undefined,
          items: items.map(({ to, message }) => ({ to, message })),
        }),
      });

      setResult(await res.json());
    } finally {
      setSending(false);
    }
  }

  function limpar() {
    setLinhasText("");
    setCmdsText("");
    setResult(null);
  }

  const okCount = result?.resultados?.filter((r) => r.ok).length ?? 0;
  const failCount = result?.resultados?.filter((r) => !r.ok).length ?? 0;

  return (
    <div className="page">
      <Header
        badge={badge}
        theme={theme}
        toggleTheme={toggleTheme}
        apiStatus={apiStatus}
      />

      <section className="grid2">
        <TextareaCard
          title="Linhas"
          count={totalLinhas}
          value={linhasText}
          onChange={(e) => setLinhasText(e.target.value)}
        />
        <TextareaCard
          title="Comandos"
          count={totalCmds}
          value={cmdsText}
          onChange={(e) => setCmdsText(e.target.value)}
        />
      </section>

      <Controls
        sender={sender}
        setSender={setSender}
        limite={limite}
        setLimite={setLimite}
        sending={sending}
        result={result}
        match={match}
        items={items}
        limpar={limpar}
        enviar={enviar}
        fileInputRef={fileInputRef}
      />

      <PreviewTable
        preview={preview}
        match={match}
        totalLinhas={totalLinhas}
        totalCmds={totalCmds}
      />

      <ResultsTable
        result={result}
        okCount={okCount}
        failCount={failCount}
        items={items}
      />
    </div>
  );
}
