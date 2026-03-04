import React, { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

export default function ResultsView({
  data,
  dataset,
  loading,
  onSelectNewDataset,
  onResetDataset,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const summaryReady = Boolean(data?.summary?.trim());
  const datasetName = dataset?.name || "Current dataset";

  const handleSend = async (e) => {
    e?.preventDefault?.();
    const text = input.trim();
    if (!text || sending) return;

    const userMsg = { role: "user", content: text, ts: Date.now() };
    setMessages((current) => [...current, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch(`${API_BASE}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      const payload = await res.json();
      const content = payload?.answer || payload?.error || "No answer yet.";
      const assistantMsg = { role: "assistant", content, ts: Date.now() + 1 };
      setMessages((current) => [...current, assistantMsg]);
    } catch {
      const assistantMsg = {
        role: "assistant",
        content: "Error contacting AI.",
        ts: Date.now() + 1,
      };
      setMessages((current) => [...current, assistantMsg]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="workspace">
      <aside className="card workspace-sidebar">
        <div className="sidebar-section">
          <div className="sidebar-kicker">Dataset Session</div>
          <div className="sidebar-title">{datasetName}</div>
          <div className="tabs" style={{ marginTop: 12 }}>
            <div className="tab active">Chat Ready</div>
            {summaryReady && <div className="tab">Summary Cached</div>}
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-heading">Details</div>
          <div className="meta-list">
            <div className="meta-row">
              <span>Format</span>
              <strong>{dataset?.format || "Dataset"}</strong>
            </div>
            <div className="meta-row">
              <span>Size</span>
              <strong>{dataset?.size || "Unknown"}</strong>
            </div>
            <div className="meta-row">
              <span>Focus</span>
              <strong>Chat only</strong>
            </div>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-heading">Notes</div>
          <div className="sidebar-note">
            Summary, key points, and other analysis views are hidden for now.
            If a summary was generated, it stays in the session for later use.
          </div>
          <div className="sidebar-note" style={{ marginTop: 10 }}>
            Supported uploads: PDF, TXT, CSV, and Markdown.
          </div>
        </div>

        <div className="sidebar-actions">
          <button
            className="button"
            type="button"
            onClick={onSelectNewDataset}
            disabled={loading}
          >
            Choose Another Dataset
          </button>
          <button
            className="button secondary"
            type="button"
            onClick={onResetDataset}
            disabled={loading}
          >
            Back to Upload
          </button>
        </div>
      </aside>

      <section className="card workspace-main">
        <div className="panel-header">
          <div>
            <div className="badge">Chat Interface</div>
            <h2 className="panel-title">Chat with your dataset</h2>
            <div className="panel-subtitle">
              Load a dataset first, then keep the conversation centered on the
              content you selected. The chat stays front and center once the
              dataset is active.
            </div>
          </div>
        </div>

        <div className="messages">
          {messages.length === 0 && !sending && (
            <div className="empty-state">
              Ask a question about <kbd>{datasetName}</kbd> to begin.
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.ts}
              className={`message-row ${message.role}`}
            >
              <div className={`message-bubble ${message.role}`}>
                {message.content}
              </div>
            </div>
          ))}

          {sending && (
            <div className="message-row assistant">
              <div className="message-bubble assistant">Thinking...</div>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="chat-input-row">
          <input
            className="text-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${datasetName}...`}
            disabled={loading || sending}
          />
          <button
            className="button"
            type="submit"
            disabled={loading || sending || !input.trim()}
          >
            {sending ? "Thinking..." : "Send"}
          </button>
        </form>
      </section>
    </div>
  );
}
