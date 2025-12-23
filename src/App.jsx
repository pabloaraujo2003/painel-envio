import { useMemo, useState, useRef, useEffect } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
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

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

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

  function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileContent = e.target.result;
        let data = [];
        if (file.name.endsWith(".csv")) {
          const parsed = Papa.parse(fileContent, { skipEmptyLines: true });
          if (parsed.errors.length) {
            throw new Error(parsed.errors.map(err => err.message).join(', '));
          }
          data = parsed.data;
        } else if (file.name.endsWith(".xlsx")) {
          const workbook = XLSX.read(fileContent, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        } else {
          alert("Formato de arquivo não suportado. Use .csv ou .xlsx.");
          return;
        }

        if (data.length === 0) {
          alert("O arquivo está vazio ou em um formato não reconhecido.");
          return;
        }

        const toLines = data.map((row) => row[0] || "").join("\n");
        const messageLines = data.map((row) => row[1] || "").join("\n");

        setLinhasText(toLines);
        setCmdsText(messageLines);

      } catch (error) {
        console.error("Erro ao processar arquivo:", error);
        alert(`Ocorreu um erro ao processar o arquivo: ${error.message}`);
      } finally {
        event.target.value = null;
      }
    };

    reader.onerror = (error) => {
      console.error("Erro ao ler o arquivo:", error);
      alert("Ocorreu um erro ao ler o arquivo.");
    };

    if (file.name.endsWith(".csv")) {
      reader.readAsText(file);
    } else if (file.name.endsWith(".xlsx")) {
      reader.readAsBinaryString(file);
    } else {
        alert("Formato de arquivo não suportado. Use .csv ou .xlsx.");
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
      <Header badge={badge} theme={theme} toggleTheme={toggleTheme} />

      <section className="grid2">
        <TextareaCard
          title="Linhas"
          count={totalLinhas}
          value={linhasText}
          onChange={(e) => setLinhasText(e.target.value)}
          placeholder={"Ex:\n5511999999999\n5511988888888"}
          hint="Dica: cole direto da coluna “LINHA” do Sheets."
        />
        <TextareaCard
          title="Comandos"
          count={totalCmds}
          value={cmdsText}
          onChange={(e) => setCmdsText(e.target.value)}
          placeholder={"Ex:\nSET,APN,internet\nSET,SERVER,1.2.3.4,9000"}
          hint="Dica: cole direto da coluna “CMD” do Sheets."
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
        handleFileImport={handleFileImport}
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

      <footer className="footer">
        Segurança: a chave da Comtele fica só no backend (server/index.js via .env).
      </footer>
    </div>
  );
}
