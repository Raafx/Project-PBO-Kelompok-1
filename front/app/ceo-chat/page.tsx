"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, KeyboardEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import SimpleBar from "simplebar-react";

import {
  CeoChatConversation,
  CeoChatMessage,
  CeoChatStatus,
  createCeoChatConversation,
  deleteCeoChatConversation,
  loadCeoChatConversations,
  loadCeoChatStatus,
  streamCeoChatMessage,
} from "../api";

const quickPrompts = [
  { icon: "solar:chart-2-bold-duotone", title: "Performa hari ini", prompt: "Bagaimana performa penjualan hari ini?" },
  { icon: "solar:cup-star-bold-duotone", title: "Produk terlaris", prompt: "Produk apa yang paling laris dalam 30 hari terakhir?" },
  { icon: "solar:graph-up-bold-duotone", title: "Bandingkan omzet", prompt: "Bandingkan omzet bulan ini dengan bulan lalu." },
  { icon: "solar:box-bold-duotone", title: "Risiko persediaan", prompt: "Stok apa saja yang perlu segera dibeli ulang?" },
];

function temporaryId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random()}`;
}

function historyGroup(updatedAt: string) {
  const difference = Date.now() - new Date(updatedAt).getTime();
  if (difference < 24 * 60 * 60 * 1000) return "Hari ini";
  if (difference < 2 * 24 * 60 * 60 * 1000) return "Kemarin";
  return "7 hari terakhir";
}

function formatConversationTime(value: string) {
  const date = new Date(value);
  if (historyGroup(value) === "Hari ini") return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

function formatInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={`${part}-${index}`}>{part.slice(1, -1)}</code>;
    }
    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

function MessageText({ content }: { content: string }) {
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];
  const flushBullets = () => {
    if (!bullets.length) return;
    const items = bullets;
    bullets = [];
    blocks.push(<ul key={`list-${blocks.length}`}>{items.map((item, index) => <li key={`${item}-${index}`}>{formatInline(item)}</li>)}</ul>);
  };

  content.replace(/\r/g, "").split("\n").forEach((rawLine) => {
    const line = rawLine.trim();
    const bullet = line.match(/^[*-]\s+(.+)/);
    if (bullet) {
      bullets.push(bullet[1]);
      return;
    }
    flushBullets();
    if (!line) return;
    const heading = line.replace(/^#{1,3}\s+/, "");
    blocks.push(<p key={`paragraph-${blocks.length}`}>{formatInline(heading)}</p>);
  });
  flushBullets();
  return <div className="ceo-rich-text">{blocks}</div>;
}

export default function CeoChatPage() {
  const [conversations, setConversations] = useState<CeoChatConversation[]>([]);
  const [activeId, setActiveId] = useState("");
  const [status, setStatus] = useState<CeoChatStatus | null>(null);
  const [prompt, setPrompt] = useState("");
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadCeoChatStatus(), loadCeoChatConversations()])
      .then(([chatStatus, history]) => {
        if (cancelled) return;
        setStatus(chatStatus);
        setConversations(history);
        setActiveId(history[0]?.id || "");
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Gagal memuat asisten");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const activeConversation = conversations.find((conversation) => conversation.id === activeId);
  const filteredConversations = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("id-ID");
    return conversations.filter((conversation) => !query || conversation.title.toLocaleLowerCase("id-ID").includes(query));
  }, [conversations, search]);

  const groupedHistory = useMemo(() => {
    return ["Hari ini", "Kemarin", "7 hari terakhir"].map((label) => ({
      label,
      conversations: filteredConversations.filter((conversation) => historyGroup(conversation.updated_at) === label),
    })).filter((group) => group.conversations.length);
  }, [filteredConversations]);

  function updateConversation(id: string, update: (conversation: CeoChatConversation) => CeoChatConversation) {
    setConversations((current) => current.map((conversation) => conversation.id === id ? update(conversation) : conversation));
  }

  function openConversation(id: string) {
    setActiveId(id);
    setSidebarOpen(false);
    setError("");
  }

  async function startNewChat() {
    if (typing) return;
    setError("");
    try {
      const conversation = await createCeoChatConversation();
      setConversations((current) => [conversation, ...current]);
      setActiveId(conversation.id);
      setPrompt("");
      setSidebarOpen(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Gagal membuat percakapan");
    }
  }

  async function deleteConversation(id: string) {
    if (typing) return;
    setError("");
    try {
      await deleteCeoChatConversation(id);
      setConversations((current) => {
        const remaining = current.filter((conversation) => conversation.id !== id);
        if (activeId === id) setActiveId(remaining[0]?.id || "");
        return remaining;
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Gagal menghapus percakapan");
    }
  }

  async function sendMessage(value = prompt) {
    const cleaned = value.trim();
    if (!cleaned || typing || status?.configured !== true) return;
    setError("");
    setTyping(true);
    setPrompt("");

    let target = activeConversation;
    try {
      if (!target) {
        target = await createCeoChatConversation();
        setConversations((current) => [target as CeoChatConversation, ...current]);
        setActiveId(target.id);
      }
      const targetId = target.id;
      const now = new Date().toISOString();
      const userTempId = temporaryId("user");
      const assistantTempId = temporaryId("assistant");
      const userMessage: CeoChatMessage = { id: userTempId, role: "user", content: cleaned, created_at: now };
      const assistantMessage: CeoChatMessage = { id: assistantTempId, role: "assistant", content: "", created_at: now };
      updateConversation(targetId, (conversation) => ({
        ...conversation,
        title: conversation.messages.length ? conversation.title : cleaned.slice(0, 60),
        updated_at: now,
        messages: [...conversation.messages, userMessage, assistantMessage],
      }));

      await streamCeoChatMessage(targetId, cleaned, (event) => {
        if (event.type === "user_message") {
          updateConversation(targetId, (conversation) => ({
            ...conversation,
            title: event.title,
            messages: conversation.messages.map((message) => message.id === userTempId ? event.message : message),
          }));
        } else if (event.type === "delta") {
          updateConversation(targetId, (conversation) => ({
            ...conversation,
            messages: conversation.messages.map((message) => message.id === assistantTempId ? { ...message, content: message.content + event.text } : message),
          }));
        } else if (event.type === "done") {
          updateConversation(targetId, (conversation) => ({
            ...conversation,
            updated_at: event.updated_at,
            messages: conversation.messages.map((message) => message.id === assistantTempId ? event.message : message),
          }));
        } else if (event.type === "error") {
          throw new Error(event.message);
        }
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Asisten gagal merespons");
      if (target) {
        updateConversation(target.id, (conversation) => ({
          ...conversation,
          messages: conversation.messages.filter((message) => !(message.role === "assistant" && !message.content)),
        }));
      }
    } finally {
      setTyping(false);
    }
  }

  function submitMessage(event: FormEvent) {
    event.preventDefault();
    void sendMessage();
  }

  function handlePromptKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  function copyAnswer(id: string, content: string) {
    void navigator.clipboard?.writeText(content);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId((current) => current === id ? "" : current), 1800);
  }

  const canChat = status?.configured === true && !loading;

  return (
    <div className="ceo-assistant-page">
      <aside className={`ceo-history-panel ${sidebarOpen ? "show" : ""}`} aria-label="Riwayat percakapan">
        <div className="ceo-history-brand">
          <Link href="/admin" className="d-flex align-items-center gap-2 text-reset text-decoration-none">
            <Image
              src="/logo-app.png"
              width={46}
              height={32}
              alt="MYMARKET"
              className="ceo-brand-logo"
              priority
            />
          </Link>
          <button className="btn btn-sm btn-icon btn-ghost-light d-lg-none" type="button" onClick={() => setSidebarOpen(false)} aria-label="Tutup riwayat"><Icon icon="tabler:x" className="fs-20" /></button>
        </div>

        <div className="p-3 border-bottom">
          <button className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" type="button" onClick={() => void startNewChat()} disabled={loading || typing}><Icon icon="solar:chat-round-dots-bold-duotone" className="fs-18" />Percakapan baru</button>
          <div className="app-search mt-3">
            <input className="form-control bg-light border-light" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari riwayat chat" aria-label="Cari riwayat chat" />
            <Icon icon="tabler:search" className="app-search-icon text-muted" />
          </div>
        </div>

        <SimpleBar className="ceo-history-scroll">
          <div className="px-2 py-3">
            {groupedHistory.map((group) => <div className="mb-3" key={group.label}>
              <div className="side-nav-title px-2 mb-1">{group.label}</div>
              {group.conversations.map((conversation) => <div className={`ceo-thread-row ${conversation.id === activeConversation?.id ? "active" : ""}`} key={conversation.id}>
                <button className="ceo-thread-main" type="button" onClick={() => openConversation(conversation.id)}>
                  <Icon icon="solar:chat-line-bold-duotone" className="fs-18 flex-shrink-0" />
                  <span className="text-truncate flex-grow-1 text-start">{conversation.title}</span>
                  <small>{formatConversationTime(conversation.updated_at)}</small>
                </button>
                <button className="ceo-thread-delete" type="button" onClick={() => void deleteConversation(conversation.id)} aria-label={`Hapus ${conversation.title}`}><Icon icon="tabler:trash" /></button>
              </div>)}
            </div>)}
            {!loading && !groupedHistory.length ? <div className="text-center text-muted py-5"><Icon icon="solar:chat-round-dots-linear" className="fs-32 mb-2" /><p>Belum ada riwayat chat.</p></div> : null}
          </div>
        </SimpleBar>

        <div className="ceo-history-footer">
          <span className="ceo-profile-mark"><Icon icon="solar:user-rounded-bold-duotone" /></span>
          <div className="flex-grow-1 overflow-hidden"><strong className="d-block text-truncate">CEO MYMARKET</strong></div>
          <Link href="/admin" className="btn btn-sm btn-icon btn-ghost-light" title="Kembali ke admin"><Icon icon="tabler:layout-dashboard" className="fs-19" /></Link>
        </div>
      </aside>

      {sidebarOpen ? <button className="ceo-sidebar-backdrop" type="button" onClick={() => setSidebarOpen(false)} aria-label="Tutup menu" /> : null}

      <section className="ceo-chat-workspace">
        <header className="ceo-chat-header">
          <div className="d-flex align-items-center gap-2 overflow-hidden">
            <button className="btn btn-sm btn-icon btn-soft-primary d-lg-none" type="button" onClick={() => setSidebarOpen(true)} aria-label="Buka riwayat"><Icon icon="tabler:menu-2" className="fs-20" /></button>
            <div className="overflow-hidden"><h5 className="mb-0 text-truncate">{activeConversation?.title || "Percakapan baru"}</h5></div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Link href="/admin" className="btn btn-sm btn-light d-none d-sm-inline-flex align-items-center gap-1"><Icon icon="tabler:layout-dashboard" />Admin</Link>
          </div>
        </header>

        <SimpleBar className="ceo-message-scroll">
          <main className="ceo-message-column">
            {error ? <div className="alert alert-danger d-flex align-items-center gap-2" role="alert"><Icon icon="tabler:alert-circle" className="fs-20" /><span>{error}</span></div> : null}
            {!canChat && !loading ? <div className="alert alert-warning d-flex align-items-center gap-2" role="status"><Icon icon="tabler:alert-circle" className="fs-20" /><span>Asisten sedang tidak tersedia. Hubungi administrator.</span></div> : null}
            {!activeConversation?.messages.length ? <section className="ceo-welcome">
              <div className="ceo-ai-mark"><Icon icon="solar:magic-stick-3-bold-duotone" /></div>
              <h1>Mau cek apa hari ini?</h1>
              <p>Tanyakan penjualan, produk, atau kondisi stok. Jawabannya langsung memakai data terbaru MYMARKET.</p>
              <div className="ceo-suggestion-grid">
                {quickPrompts.map((item) => <button type="button" key={item.title} onClick={() => void sendMessage(item.prompt)} disabled={!canChat || typing}><span className="avatar-sm rounded bg-primary-subtle text-primary d-flex align-items-center justify-content-center"><Icon icon={item.icon} className="fs-20" /></span><span><strong>{item.title}</strong><small>{item.prompt}</small></span><Icon icon="tabler:arrow-up-right" className="ms-auto text-muted" /></button>)}
              </div>
            </section> : <div className="ceo-chat-list">
              {activeConversation.messages.map((message) => <article className={`ceo-message ${message.role}`} key={message.id}>
                <div className="ceo-message-avatar">{message.role === "assistant" ? <Icon icon="solar:stars-minimalistic-bold-duotone" /> : <Icon icon="solar:user-rounded-bold-duotone" />}</div>
                <div className="ceo-message-content">
                  <div className="d-flex align-items-center gap-2 mb-1"><strong>{message.role === "assistant" ? "Asisten" : "Anda"}</strong><small className="text-muted">{new Date(message.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</small></div>
                  {message.content ? <MessageText content={message.content} /> : <div className="ceo-typing mt-2" aria-label="Asisten sedang menjawab"><span /><span /><span /></div>}
                  {message.role === "assistant" && message.content ? <div className="ceo-message-actions"><button type="button" onClick={() => copyAnswer(message.id, message.content)} aria-label={copiedId === message.id ? "Jawaban tersalin" : "Salin jawaban"}><Icon icon={copiedId === message.id ? "tabler:check" : "tabler:copy"} /><span>{copiedId === message.id ? "Tersalin" : "Salin"}</span></button></div> : null}
                </div>
              </article>)}
            </div>}
          </main>
        </SimpleBar>

        <footer className="ceo-composer-area">
          {activeConversation?.messages.length ? <div className="ceo-prompt-chips">{quickPrompts.slice(0, 3).map((item) => <button type="button" key={item.title} onClick={() => void sendMessage(item.prompt)} disabled={!canChat || typing}>{item.title}</button>)}</div> : null}
          <form className="ceo-composer" onSubmit={submitMessage}>
            <Icon icon="solar:stars-minimalistic-bold-duotone" className="fs-20 text-primary m-2 flex-shrink-0" />
            <textarea rows={1} value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={handlePromptKeyDown} placeholder={canChat ? "Tanyakan tentang bisnis MYMARKET..." : "Asisten sedang tidak tersedia"} aria-label="Pesan untuk asisten" disabled={!canChat || typing} />
            <button className="btn btn-primary btn-icon rounded-circle flex-shrink-0" type="submit" disabled={!prompt.trim() || typing || !canChat} aria-label="Kirim pesan"><Icon icon="tabler:arrow-up" className="fs-20" /></button>
          </form>
        </footer>
      </section>
    </div>
  );
}
