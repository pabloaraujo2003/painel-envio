import { useMemo, useState, useRef, useEffect } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { parseLines } from "./utils";
import { testApiConnection, sendMessages } from "./services/api"; // Import API functions

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
     API STATUS CHECK
  ====================== */
  useEffect(() => {
    const checkApi = async () => {
      try {
        await testApiConnection();
        setApiStatus("ok");
      } catch (error) {
        setApiStatus("error");
      }
    };
    checkApi();
  }, []);

  /* ======================
     THEME
  ====================== */
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

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
        text: diff > 0 ? `Faltam ${Math.abs(diff)} comandos` : `Faltam ${Math.abs(diff)} linhas`,
      };
    }

    return { tone: "success", icon: "✅", text: "Pronto para enviar (1:1)" };
  }, [totalLinhas, totalCmds, match, diff]);

  /* ======================
     FUNÇÃO DE IMPORTAR ARQUIVO
  ====================== */
  function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        if (file.name.endsWith(".csv")) {
          const parsed = Papa.parse(data, { header: false });
          const columns = parsed.data;
          if (columns.length > 0) {
            setLinhasText(columns.map((row) => row[0] || "").join("\n"));
          }
          if (columns.length > 0 && columns[0].length > 1) {
            setCmdsText(columns.map((row) => row[1] || "").join("\n"));
          }
        } else if (file.name.endsWith(".xlsx")) {
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (json.length > 0) {
            setLinhasText(json.map((row) => row[0] || "").join("\n"));
          }
          if (json.length > 0 && json[0].length > 1) {
            setCmdsText(json.map((row) => row[1] || "").join("\n"));
          }
        }
      } catch (error) {
        console.error("Erro ao processar o arquivo:", error);
        alert("Erro ao processar o arquivo. Verifique o formato.");
      }
    };

    if (file.name.endsWith(".csv")) {
      reader.readAsText(file);
    } else if (file.name.endsWith(".xlsx")) {
      reader.readAsBinaryString(file);
    }
  }


  /* ======================
     FUNÇÃO DE ENVIO
  ====================== */
  async function enviar() {
    setSending(true);
    setResult(null);

    try {
      const response = await sendMessages(items, sender);
      setResult(response);
    } catch (err) {
      console.error("Erro ao enviar:", err);
      alert(`Erro ao enviar: ${err.message}`);
    } finally {
      setSending(false);
    }
  }

  /* ======================
     FUNÇÃO LIMPAR
  ====================== */
  function limpar() {
    setLinhasText("");
    setCmdsText("");
    setResult(null);
  }

  const okCount = result?.resultados?.filter((r) => r.ok).length ?? 0;
  const failCount = result?.resultados?.filter((r) => !r.ok).length ?? 0;

  return (
    <div className="page">
      <Header badge={badge} theme={theme} toggleTheme={toggleTheme} apiStatus={apiStatus} />

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
        handleFileImport={handleFileImport}
      />

      <PreviewTable preview={preview} match={match} totalLinhas={totalLinhas} totalCmds={totalCmds} />

      <ResultsTable result={result} okCount={okCount} failCount={failCount} items={items} />
    </div>
  );
}
