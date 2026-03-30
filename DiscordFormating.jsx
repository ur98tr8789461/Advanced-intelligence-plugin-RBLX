import { useState, useCallback } from "react";

const DISCORD_FORMATS = [
  { label: "# Big Title", syntax: (t) => `# ${t}`, icon: "H1", desc: "Heading 1" },
  { label: "## Title", syntax: (t) => `## ${t}`, icon: "H2", desc: "Heading 2" },
  { label: "### Subtitle", syntax: (t) => `### ${t}`, icon: "H3", desc: "Heading 3" },
  { label: "**Bold**", syntax: (t) => `**${t}**`, icon: "B", desc: "Bold" },
  { label: "*Italic*", syntax: (t) => `*${t}*`, icon: "I", desc: "Italic" },
  { label: "__Underline__", syntax: (t) => `__${t}__`, icon: "U", desc: "Underline" },
  { label: "~~Strike~~", syntax: (t) => `~~${t}~~`, icon: "S", desc: "Strikethrough" },
  { label: "> Quote", syntax: (t) => `> ${t}`, icon: "❝", desc: "Block Quote" },
  { label: ">>> Multi-Quote", syntax: (t) => `>>> ${t}`, icon: "❞", desc: "Multi-line Quote" },
  { label: "`Code`", syntax: (t) => `\`${t}\``, icon: "<>", desc: "Inline Code" },
  { label: "```Block```", syntax: (t) => "```\n" + t + "\n```", icon: "{}", desc: "Code Block" },
  { label: "- List", syntax: (t) => `- ${t}`, icon: "•", desc: "Bullet List" },
  { label: "||Spoiler||", syntax: (t) => `||${t}||`, icon: "👁", desc: "Spoiler" },
  { label: "---", syntax: () => `---`, icon: "─", desc: "Divider" },
  { label: "-# Small", syntax: (t) => `-# ${t}`, icon: "xs", desc: "Small Text" },
];

const TEMPLATES = [
  {
    name: "📣 Announcement",
    content: `# 📣 Announcement\n\n**Hey @everyone!**\n\nWe have some exciting news to share.\n\n> Insert your main message here.\n\n- Point one\n- Point two\n- Point three\n\n---\n\n-# Questions? Open a ticket.`,
  },
  {
    name: "🎉 Event",
    content: `# 🎉 Event Announcement\n\n**What:** Event name\n**When:** Date & Time\n**Where:** Channel or location\n\n> Describe the event here.\n\n---\n\n**React with ✅ to sign up!**`,
  },
  {
    name: "🔔 Update",
    content: `## 🔔 Update v1.0\n\n### What's New\n- Feature one\n- Feature two\n\n### Bug Fixes\n- Fixed an issue with...\n\n---\n\n-# Thanks for your patience!`,
  },
  {
    name: "⚠️ Notice",
    content: `## ⚠️ Important Notice\n\n> Please read this carefully.\n\n**Summary:** Describe the notice here.\n\n---\n\n||Additional details hidden here.||`,
  },
];

function renderDiscordPreview(text) {
  const lines = text.split("\n");
  const result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Multi-line blockquote
    if (line.startsWith(">>> ")) {
      const content = line.slice(4);
      result.push(
        <div key={i} className="discord-blockquote multi">
          <div className="quote-bar" />
          <span>{renderInline(content)}</span>
        </div>
      );
    }
    // Code block
    else if (line.startsWith("```")) {
      let code = "";
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        code += lines[i] + "\n";
        i++;
      }
      result.push(
        <pre key={i} className="discord-code-block">
          <code>{code.trimEnd()}</code>
        </pre>
      );
    }
    // H1
    else if (line.startsWith("# ")) {
      result.push(<h1 key={i} className="discord-h1">{renderInline(line.slice(2))}</h1>);
    }
    // H2
    else if (line.startsWith("## ")) {
      result.push(<h2 key={i} className="discord-h2">{renderInline(line.slice(3))}</h2>);
    }
    // H3
    else if (line.startsWith("### ")) {
      result.push(<h3 key={i} className="discord-h3">{renderInline(line.slice(4))}</h3>);
    }
    // Small text
    else if (line.startsWith("-# ")) {
      result.push(<p key={i} className="discord-small">{renderInline(line.slice(3))}</p>);
    }
    // Blockquote
    else if (line.startsWith("> ")) {
      result.push(
        <div key={i} className="discord-blockquote">
          <div className="quote-bar" />
          <span>{renderInline(line.slice(2))}</span>
        </div>
      );
    }
    // Divider
    else if (line.trim() === "---") {
      result.push(<hr key={i} className="discord-divider" />);
    }
    // Bullet
    else if (line.startsWith("- ")) {
      result.push(
        <div key={i} className="discord-bullet">
          <span className="bullet-dot">•</span>
          <span>{renderInline(line.slice(2))}</span>
        </div>
      );
    }
    // Empty line
    else if (line.trim() === "") {
      result.push(<div key={i} className="discord-spacer" />);
    }
    // Normal paragraph
    else {
      result.push(<p key={i} className="discord-p">{renderInline(line)}</p>);
    }

    i++;
  }

  return result;
}

function renderInline(text) {
  const parts = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|__(.+?)__|~~(.+?)~~|`(.+?)`|\|\|(.+?)\|\|)/g;
  let last = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));

    if (match[2]) parts.push(<strong key={match.index}>{match[2]}</strong>);
    else if (match[3]) parts.push(<em key={match.index}>{match[3]}</em>);
    else if (match[4]) parts.push(<u key={match.index}>{match[4]}</u>);
    else if (match[5]) parts.push(<s key={match.index}>{match[5]}</s>);
    else if (match[6]) parts.push(<code key={match.index} className="discord-inline-code">{match[6]}</code>);
    else if (match[7]) parts.push(<span key={match.index} className="discord-spoiler">{match[7]}</span>);

    last = match.index + match[0].length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts.length > 0 ? parts : text;
}

export default function App() {
  const [rawText, setRawText] = useState(TEMPLATES[0].content);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState("write");
  const [selectedText, setSelectedText] = useState("");
  const [selStart, setSelStart] = useState(0);
  const [selEnd, setSelEnd] = useState(0);

  const handleSelect = (e) => {
    setSelectedText(e.target.value.substring(e.target.selectionStart, e.target.selectionEnd));
    setSelStart(e.target.selectionStart);
    setSelEnd(e.target.selectionEnd);
  };

  const applyFormat = useCallback((fmt) => {
    const selected = selectedText || "text";
    const formatted = fmt.syntax(selected);
    const newText = rawText.slice(0, selStart) + formatted + rawText.slice(selEnd);
    setRawText(newText);
  }, [rawText, selectedText, selStart, selEnd]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(rawText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0e0f13;
          --surface: #16181f;
          --surface2: #1e2029;
          --surface3: #262837;
          --border: #2e3044;
          --accent: #5865f2;
          --accent-glow: rgba(88,101,242,0.25);
          --text: #e8eaf0;
          --muted: #7b7f96;
          --green: #57f287;
          --yellow: #fee75c;
          --red: #ed4245;
          --discord-text: #dbdee1;
          --font: 'Syne', sans-serif;
          --mono: 'IBM Plex Mono', monospace;
        }

        body { background: var(--bg); color: var(--text); font-family: var(--font); }

        .app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          max-width: 1100px;
          margin: 0 auto;
          padding: 24px 20px;
          gap: 20px;
        }

        .header {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .logo {
          width: 42px; height: 42px;
          background: var(--accent);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
          box-shadow: 0 0 20px var(--accent-glow);
          flex-shrink: 0;
        }

        .header-text h1 {
          font-size: 20px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.5px;
        }

        .header-text p {
          font-size: 12px;
          color: var(--muted);
          font-family: var(--mono);
        }

        .templates {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .template-btn {
          background: var(--surface2);
          border: 1px solid var(--border);
          color: var(--muted);
          font-family: var(--font);
          font-size: 12px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .template-btn:hover {
          background: var(--surface3);
          color: var(--text);
          border-color: var(--accent);
        }

        .toolbar {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 10px;
        }

        .fmt-btn {
          background: var(--surface2);
          border: 1px solid var(--border);
          color: var(--muted);
          font-family: var(--mono);
          font-size: 11px;
          font-weight: 500;
          padding: 5px 9px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1px;
          min-width: 38px;
          line-height: 1;
        }

        .fmt-btn:hover {
          background: var(--accent);
          color: #fff;
          border-color: var(--accent);
          box-shadow: 0 0 12px var(--accent-glow);
        }

        .fmt-btn .fmt-icon { font-size: 13px; font-weight: 700; }
        .fmt-btn .fmt-desc { font-size: 9px; color: inherit; opacity: 0.7; }

        .main-area {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          flex: 1;
        }

        @media (max-width: 680px) {
          .main-area { grid-template-columns: 1fr; }
        }

        .panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          background: var(--surface2);
        }

        .panel-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--muted);
          font-family: var(--mono);
        }

        .char-count {
          font-size: 11px;
          color: var(--muted);
          font-family: var(--mono);
        }

        .char-count.warn { color: var(--yellow); }
        .char-count.danger { color: var(--red); }

        textarea {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text);
          font-family: var(--mono);
          font-size: 13px;
          line-height: 1.7;
          padding: 16px;
          resize: none;
          min-height: 380px;
        }

        textarea::placeholder { color: var(--muted); opacity: 0.5; }

        .preview-body {
          flex: 1;
          padding: 16px 20px;
          overflow-y: auto;
          min-height: 380px;
        }

        /* Discord render styles */
        .discord-h1 {
          font-size: 24px; font-weight: 700;
          color: #f2f3f5;
          margin-bottom: 8px;
          border-bottom: 1px solid #3c3f45;
          padding-bottom: 6px;
          font-family: var(--font);
        }
        .discord-h2 {
          font-size: 20px; font-weight: 700;
          color: #f2f3f5;
          margin-bottom: 6px;
          font-family: var(--font);
        }
        .discord-h3 {
          font-size: 16px; font-weight: 700;
          color: #f2f3f5;
          margin-bottom: 4px;
          font-family: var(--font);
        }
        .discord-p {
          color: var(--discord-text);
          font-family: 'gg sans', 'Noto Sans', sans-serif;
          font-size: 15px;
          line-height: 1.375;
          margin-bottom: 2px;
        }
        .discord-spacer { height: 10px; }
        .discord-blockquote {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          padding: 2px 0;
          margin: 4px 0;
        }
        .quote-bar {
          width: 4px;
          min-height: 20px;
          background: #4e5058;
          border-radius: 4px;
          flex-shrink: 0;
          align-self: stretch;
        }
        .discord-blockquote span {
          color: var(--discord-text);
          font-size: 15px;
          line-height: 1.375;
        }
        .discord-divider {
          border: none;
          border-top: 1px solid #3c3f45;
          margin: 12px 0;
        }
        .discord-bullet {
          display: flex;
          gap: 8px;
          color: var(--discord-text);
          font-size: 15px;
          line-height: 1.375;
          margin: 2px 0;
          padding-left: 8px;
        }
        .bullet-dot { color: var(--discord-text); }
        .discord-small {
          font-size: 11px;
          color: #80848e;
          margin-top: 4px;
        }
        .discord-inline-code {
          font-family: var(--mono);
          font-size: 13px;
          background: #2b2d31;
          color: #e9edef;
          padding: 1px 5px;
          border-radius: 3px;
        }
        .discord-code-block {
          background: #2b2d31;
          border: 1px solid #1e1f22;
          border-radius: 6px;
          padding: 10px 14px;
          font-family: var(--mono);
          font-size: 13px;
          color: #e9edef;
          overflow-x: auto;
          margin: 6px 0;
          white-space: pre;
        }
        .discord-spoiler {
          background: #202225;
          color: #202225;
          border-radius: 3px;
          padding: 0 2px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .discord-spoiler:hover { color: var(--discord-text); }

        .bottom-bar {
          display: flex;
          gap: 10px;
          align-items: center;
          justify-content: flex-end;
        }

        .copy-btn {
          background: var(--accent);
          color: #fff;
          border: none;
          font-family: var(--font);
          font-size: 14px;
          font-weight: 700;
          padding: 10px 24px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 0 20px var(--accent-glow);
          letter-spacing: 0.3px;
        }

        .copy-btn:hover {
          background: #4752c4;
          transform: translateY(-1px);
          box-shadow: 0 4px 24px var(--accent-glow);
        }

        .copy-btn.success {
          background: var(--green);
          color: #000;
          box-shadow: 0 0 20px rgba(87,242,135,0.3);
        }

        .clear-btn {
          background: transparent;
          color: var(--muted);
          border: 1px solid var(--border);
          font-family: var(--font);
          font-size: 13px;
          font-weight: 600;
          padding: 9px 16px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .clear-btn:hover { color: var(--red); border-color: var(--red); }

        .hint {
          font-size: 11px;
          color: var(--muted);
          font-family: var(--mono);
          flex: 1;
        }
      `}</style>

      <div className="header">
        <div className="logo">📣</div>
        <div className="header-text">
          <h1>Discord Announcement Maker</h1>
          <p>Write ideas → format → copy to Discord</p>
        </div>
      </div>

      <div className="templates">
        {TEMPLATES.map((t) => (
          <button key={t.name} className="template-btn" onClick={() => setRawText(t.content)}>
            {t.name}
          </button>
        ))}
      </div>

      <div className="toolbar">
        {DISCORD_FORMATS.map((fmt) => (
          <button key={fmt.icon} className="fmt-btn" title={fmt.label} onClick={() => applyFormat(fmt)}>
            <span className="fmt-icon">{fmt.icon}</span>
            <span className="fmt-desc">{fmt.desc}</span>
          </button>
        ))}
      </div>

      <div className="main-area">
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">✏️ Write</span>
            <span className={`char-count ${rawText.length > 3800 ? "danger" : rawText.length > 3000 ? "warn" : ""}`}>
              {rawText.length} / 4000
            </span>
          </div>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            onSelect={handleSelect}
            onMouseUp={handleSelect}
            onKeyUp={handleSelect}
            placeholder="Write your ideas, notes, or announcement here..."
            spellCheck={false}
          />
        </div>

        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">👁 Preview</span>
            <span className="panel-title" style={{ color: "var(--accent)" }}>Discord</span>
          </div>
          <div className="preview-body">
            {renderDiscordPreview(rawText)}
          </div>
        </div>
      </div>

      <div className="bottom-bar">
        <span className="hint">Select text in editor, then click a format button to apply</span>
        <button className="clear-btn" onClick={() => setRawText("")}>Clear</button>
        <button className={`copy-btn ${copied ? "success" : ""}`} onClick={copyToClipboard}>
          {copied ? "✓ Copied!" : "Copy for Discord"}
        </button>
      </div>
    </div>
  );
}
