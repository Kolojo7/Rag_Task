import React, { useEffect, useRef, useState } from "react";
import ResultsView from "./ResultsView";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";
const ACCEPTED_DATASET_TYPES = ".pdf,.txt,.text,.csv,.md,.markdown";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const uploadRef = useRef(null);
  const swapRef = useRef(null);

  useEffect(() => {
    document.title = "Dataset Chat";
  }, []);

  const loadDataset = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/dataset`, {
        method: "POST",
        body: formData,
      });
      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload?.error || `HTTP ${res.status}`);
      }

      setSession({
        data: payload,
        dataset: {
          name: file.name,
          format: describeDatasetType(file.name),
          size: formatFileSize(file.size),
        },
      });
    } catch (err) {
      console.error(err);
      alert("Error: Could not load dataset.");
    } finally {
      if (uploadRef.current) uploadRef.current.value = "";
      if (swapRef.current) swapRef.current.value = "";
      setLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const file = uploadRef.current?.files?.[0];
    if (!file) {
      alert("Select a dataset file first.");
      return;
    }

    await loadDataset(file);
  };

  const handleSwapDataset = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await loadDataset(file);
  };

  const openDatasetPicker = () => {
    swapRef.current?.click();
  };

  const resetSession = () => {
    setSession(null);
    if (uploadRef.current) uploadRef.current.value = "";
    if (swapRef.current) swapRef.current.value = "";
  };

  return (
    <div className="page">
      <style>{`
        :root { --bg:#0b1020; --card:rgba(15,23,42,.55); --ink:#e5e7eb; --muted:#94a3b8; --accent:#3b82f6; --border:rgba(31,41,55,.65); --radius:16px; }

        *{box-sizing:border-box}
        html,body,#root{height:100%; width:100%}
        body{ margin:0; display:block !important; }
        #root{ display:block !important; width:100% !important; }

        body{
          font-family:'Inter', system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;
          background: radial-gradient(1200px 700px at 20% -20%, #0d1330 0%, #0b1020 60%) fixed;
          color:var(--ink);
          -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;
        }

        .page{
          width:100%;
          min-height:100vh;
          padding:96px 20px 48px;
          position:relative;
          z-index:1;
          display:flex;
          justify-content:center;
        }

        .content{
          width:min(960px, 100%);
          margin:0 auto;
        }

        .content-chat{
          width:min(1200px, 100%);
        }

        .hero{
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:flex-start;
          gap:18px;
          margin:0 0 20px;
          text-align:center;
        }

        .title{margin:0; font-weight:800; letter-spacing:-.02em; font-size: clamp(36px, 6vw, 56px);}
        .badge{display:inline-block;margin-top:6px;font-size:12px;padding:6px 10px;border-radius:999px;border:1px solid var(--border);
               background:linear-gradient(180deg, rgba(17,24,39,.65), rgba(17,24,39,.35)); color:var(--muted);}
        .subtitle{color:var(--muted); margin-top:6px; max-width:720px;}
        .beam{margin:14px auto 0; height:2px; width:220px; background:#0f172a; border-radius:999px; overflow:hidden; position:relative; border:1px solid var(--border)}
        .beam::after{content:"";position:absolute;inset:0;transform:translateX(-100%);
                     background:linear-gradient(90deg,transparent, rgba(59,130,246,.95), transparent);
                     animation:sweep 1.8s ease-in-out infinite}
        @keyframes sweep{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}

        .card{background: var(--card); border:1px solid var(--border); border-radius: var(--radius);
              backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); box-shadow: 0 8px 30px rgba(0,0,0,.25);}
        .uploader{margin:18px 0; display:flex; gap:12px; align-items:center; flex-wrap:wrap; justify-content:center;}
        .button{background: var(--accent); color:#fff; border:none; border-radius:12px; padding:10px 16px; cursor:pointer; font-weight:600;
                transition: transform .12s ease, box-shadow .2s ease; box-shadow: 0 8px 18px rgba(59,130,246,.2);}
        .button:hover{ transform: translateY(-1px); box-shadow: 0 10px 22px rgba(59,130,246,.28); }
        .button:disabled{opacity:.6; cursor:not-allowed; transform:none; box-shadow:none;}
        .button.secondary{background:rgba(15,23,42,.65); border:1px solid var(--border); box-shadow:none;}
        .tip{ max-width:760px; margin:10px auto 0; padding:18px; border:1.5px dashed var(--border); background: rgba(2,6,23,.35); }

        .loadingbar{position:relative;height:3px;background:#0f172a;border-radius:999px;overflow:hidden;margin:12px auto;border:1px solid var(--border); width:min(640px, 100%)}
        .loadingbar::after{content:"";position:absolute;inset:0;transform:translateX(-100%);
          background:linear-gradient(90deg,transparent, rgba(59,130,246,.9), transparent);animation:sweep 1.2s ease-in-out infinite}

        .tabs{display:flex;gap:10px;align-items:center; flex-wrap:wrap;}
        .tab{padding:8px 14px; border-radius:999px; border:1px solid var(--border); background: rgba(15,23,42,.6); color:var(--muted); user-select:none; white-space:nowrap}
        .tab.active{color:#fff;background:#111b33;border-color:#23324e}
        kbd{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;padding:1px 6px;border:1px solid var(--border);border-bottom-width:2px;border-radius:6px;background:#0e162c;color:#cbd5e1}

        .workspace{
          display:grid;
          grid-template-columns: minmax(260px, 300px) minmax(0, 1fr);
          gap:20px;
          align-items:start;
          margin-top:8px;
        }

        .workspace-sidebar{
          padding:20px;
          position:sticky;
          top:24px;
        }

        .sidebar-section + .sidebar-section{
          margin-top:18px;
          padding-top:18px;
          border-top:1px solid rgba(148,163,184,.16);
        }

        .sidebar-kicker{
          font-size:11px;
          letter-spacing:.14em;
          text-transform:uppercase;
          color:var(--muted);
        }

        .sidebar-title{
          margin-top:8px;
          font-size:22px;
          line-height:1.25;
          font-weight:700;
          word-break:break-word;
        }

        .sidebar-heading{
          font-size:13px;
          font-weight:700;
          color:#dbe4f3;
          margin-bottom:10px;
        }

        .sidebar-note{
          color:var(--muted);
          font-size:14px;
          line-height:1.5;
        }

        .meta-list{
          display:grid;
          gap:10px;
        }

        .meta-row{
          display:flex;
          justify-content:space-between;
          gap:12px;
          font-size:14px;
          color:var(--muted);
        }

        .meta-row strong{
          color:#f8fafc;
          text-align:right;
          font-weight:600;
        }

        .sidebar-actions{
          display:grid;
          gap:10px;
          margin-top:20px;
        }

        .workspace-main{
          min-height:70vh;
          padding:22px;
          display:flex;
          flex-direction:column;
          gap:18px;
        }

        .panel-header{
          display:flex;
          justify-content:space-between;
          align-items:flex-start;
          gap:16px;
          flex-wrap:wrap;
        }

        .panel-title{
          margin:10px 0 8px;
          font-size: clamp(28px, 4vw, 40px);
          line-height:1.05;
          letter-spacing:-.02em;
        }

        .panel-subtitle{
          color:var(--muted);
          max-width:680px;
        }

        .messages{
          border:1px solid rgba(31,41,55,.65);
          border-radius:14px;
          padding:16px;
          min-height:440px;
          max-height:calc(100vh - 280px);
          overflow-y:auto;
          background: rgba(2,6,23,.28);
        }

        .empty-state{
          color:var(--muted);
          min-height:100%;
          display:flex;
          align-items:center;
          justify-content:center;
          text-align:center;
          padding:24px;
        }

        .message-row{
          display:flex;
          margin-bottom:12px;
        }

        .message-row.user{
          justify-content:flex-end;
        }

        .message-row.assistant{
          justify-content:flex-start;
        }

        .message-bubble{
          max-width:min(84%, 760px);
          padding:10px 14px;
          border-radius:14px;
          border:1px solid rgba(31,41,55,.65);
          white-space:pre-wrap;
          line-height:1.55;
        }

        .message-bubble.user{
          background:rgba(59,130,246,.22);
        }

        .message-bubble.assistant{
          background:rgba(15,23,42,.68);
        }

        .chat-input-row{
          display:flex;
          gap:10px;
          align-items:stretch;
        }

        .text-input{
          flex:1;
          padding:12px 14px;
          border-radius:12px;
          border:1px solid rgba(31,41,55,.65);
          background:rgba(2,6,23,.45);
          color:var(--ink);
          font:inherit;
        }

        .text-input::placeholder{
          color:var(--muted);
        }

        .text-input:focus{
          outline:1px solid rgba(59,130,246,.45);
          border-color:rgba(59,130,246,.55);
        }

        .aurora{position:fixed; inset:0; z-index:0; pointer-events:none; filter:blur(96px); opacity:.9; mix-blend-mode:screen}
        .aurora > div{position:absolute; width: 60vw; height: 60vw; border-radius:50%; animation:float 32s linear infinite;}
        .a1{top:-8%; left:-12%; background:radial-gradient(closest-side, rgba(59,130,246,.55), transparent 70%); animation-duration:28s;}
        .a2{top:10%; right:-10%; background:radial-gradient(closest-side, rgba(34,211,238,.48), transparent 70%); animation-duration:34s;}
        .a3{bottom:-12%; left:22%; background:radial-gradient(closest-side, rgba(147,51,234,.42), transparent 70%); animation-duration:38s;}
        @keyframes float{0%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-6%) rotate(180deg)} 100%{transform:translateY(0) rotate(360deg)}}

        .orb{position:relative;width:96px;height:96px;filter:drop-shadow(0 0 24px rgba(59,130,246,.45));display:inline-block;}
        .orb-core{position:absolute;inset:16px;border-radius:999px;background:
          radial-gradient(35% 35% at 35% 35%, rgba(255,255,255,.95), rgba(255,255,255,.25) 60%, transparent 61%),
          radial-gradient(circle at 65% 65%, rgba(34,211,238,.5), transparent 55%),
          radial-gradient(circle at 50% 50%, rgba(59,130,246,.85), rgba(59,130,246,.15) 55%, transparent 56%);
          box-shadow:0 0 42px rgba(59,130,246,.35), inset 0 0 26px rgba(96,165,250,.45);
          animation:orbPulse 3.2s ease-in-out infinite}
        .ring{position:absolute;inset:4px;border-radius:999px;border:2px dashed rgba(96,165,250,.65);animation:spin 14s linear infinite}
        .r2{inset:0;transform:scale(1.18);border-color:rgba(34,211,238,.6);animation-duration:22s}
        .r3{inset:-6px;transform:scale(1.34);border-color:rgba(59,130,246,.55);animation-duration:30s;filter:blur(.2px)}
        .sat{position:absolute;inset:0}
        .sat span{position:absolute;top:50%;left:50%;width:9px;height:9px;border-radius:999px;background:#fff;
                  box-shadow:0 0 12px rgba(255,255,255,.95),0 0 26px rgba(59,130,246,1);transform:translate(-50%,-50%) translateX(44px)}
        .s1{animation:spin 7.5s linear infinite}
        .s2{animation:spin 11s linear infinite reverse}
        .s2 span{transform:translate(-50%,-50%) translateX(28px);background:#22d3ee}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes orbPulse{0%,100%{box-shadow:0 0 42px rgba(59,130,246,.35), inset 0 0 26px rgba(96,165,250,.45)}
          50%{box-shadow:0 0 54px rgba(59,130,246,.5), inset 0 0 32px rgba(96,165,250,.6)}}

        @media (max-width: 980px){
          .page{padding:72px 16px 32px;}
          .workspace{grid-template-columns:1fr;}
          .workspace-sidebar{position:static;}
          .messages{max-height:none; min-height:320px;}
        }

        @media (max-width: 640px){
          .uploader{align-items:stretch;}
          .uploader input,
          .uploader .button,
          .chat-input-row,
          .chat-input-row .button{
            width:100%;
          }
          .chat-input-row{
            flex-direction:column;
          }
          .message-bubble{
            max-width:100%;
          }
        }
      `}</style>

      <div className="aurora"><div className="a1" /><div className="a2" /><div className="a3" /></div>

      <div className={`content ${session ? "content-chat" : ""}`}>
        {!session && (
          <>
            <header className="hero">
              <div className="orb" aria-hidden="true">
                <div className="orb-core" />
                <div className="ring r1" />
                <div className="ring r2" />
                <div className="ring r3" />
                <div className="sat s1"><span /></div>
                <div className="sat s2"><span /></div>
              </div>
              <div>
                <h1 className="title">Dataset Chat Workspace</h1>
                <div className="badge">RAG-ready UI</div>
                <div className="subtitle">
                  Upload or select a dataset, then move into a dedicated chat view.
                  The summary pipeline can stay behind the scenes, but the interface
                  is focused on conversation for now.
                </div>
                <div className="beam" />
              </div>
            </header>

            {loading && <div className="loadingbar" aria-label="Loading" />}

            <form onSubmit={submit} className="uploader">
              <input ref={uploadRef} type="file" accept={ACCEPTED_DATASET_TYPES} />
              <button className="button" type="submit" disabled={loading}>
                {loading ? "Loading..." : "Load Dataset"}
              </button>
            </form>

            <div className="card tip">
              <strong>Formats:</strong> PDF, TXT, CSV, and Markdown files are
              supported right now. Once a dataset is loaded, the chat becomes the
              main workspace.
            </div>
          </>
        )}

        {session && (
          <>
            {loading && <div className="loadingbar" aria-label="Loading" />}
            <input
              ref={swapRef}
              type="file"
              accept={ACCEPTED_DATASET_TYPES}
              onChange={handleSwapDataset}
              style={{ display: "none" }}
            />
            <ResultsView
              data={session.data}
              dataset={session.dataset}
              loading={loading}
              onSelectNewDataset={openDatasetPicker}
              onResetDataset={resetSession}
            />
          </>
        )}
      </div>
    </div>
  );
}

function describeDatasetType(filename) {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (!ext) return "Dataset";

  const labels = {
    pdf: "PDF",
    txt: "Text",
    text: "Text",
    csv: "CSV",
    md: "Markdown",
    markdown: "Markdown",
  };

  return labels[ext] || ext.toUpperCase();
}

function formatFileSize(bytes) {
  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const rounded = value >= 100 || unitIndex === 0 ? Math.round(value) : value.toFixed(1);
  return `${rounded} ${units[unitIndex]}`;
}
