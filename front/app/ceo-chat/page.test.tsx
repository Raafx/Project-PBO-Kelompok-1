import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CeoChatPage from "./page";

const api = vi.hoisted(() => ({
  loadStatus: vi.fn(),
  loadConversations: vi.fn(),
  loadConversation: vi.fn(),
  createConversation: vi.fn(),
  deleteConversation: vi.fn(),
  streamMessage: vi.fn(),
}));

vi.mock("../api", () => ({
  loadCeoChatStatus: api.loadStatus,
  loadCeoChatConversations: api.loadConversations,
  loadCeoChatConversation: api.loadConversation,
  createCeoChatConversation: api.createConversation,
  deleteCeoChatConversation: api.deleteConversation,
  streamCeoChatMessage: api.streamMessage,
}));

describe("halaman CEO Copilot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.loadStatus.mockResolvedValue({
      configured: true,
      model: "gemini-test",
      project_name: "projek-pbo",
      project_number: "69198748984",
      context_source: "Database operasional MYMARKET",
    });
    api.loadConversations.mockResolvedValue([]);
    api.loadConversation.mockResolvedValue({
      id: "conversation-markdown",
      title: "Transaksi hari ini",
      updated_at: "2026-10-08T10:00:00Z",
      messages: [],
    });
    api.createConversation.mockResolvedValue({
      id: "conversation-1",
      title: "Percakapan baru",
      updated_at: "2026-10-08T10:00:00Z",
      messages: [],
    });
    api.streamMessage.mockImplementation(async (_id, _message, onEvent) => {
      onEvent({
        type: "user_message",
        title: "Bagaimana performa penjualan hari ini?",
        message: {
          id: "user-1",
          role: "user",
          content: "Bagaimana performa penjualan hari ini?",
          created_at: "2026-10-08T10:01:00Z",
        },
      });
      onEvent({ type: "delta", text: "Omzet aktual " });
      onEvent({ type: "delta", text: "sudah dianalisis." });
      onEvent({
        type: "done",
        updated_at: "2026-10-08T10:01:01Z",
        message: {
          id: "assistant-1",
          role: "assistant",
          content: "Omzet aktual sudah dianalisis.",
          created_at: "2026-10-08T10:01:01Z",
        },
      });
    });
  });

  it("membuat percakapan dan menampilkan jawaban streaming", async () => {
    const user = userEvent.setup();
    render(<CeoChatPage />);

    expect(screen.getByRole("complementary", { name: /riwayat percakapan/i })).toBeInTheDocument();
    const quickPrompt = await screen.findByRole("button", { name: /performa hari ini/i });
    await user.click(quickPrompt);

    expect(api.createConversation).toHaveBeenCalledOnce();
    expect(api.streamMessage).toHaveBeenCalledWith(
      "conversation-1",
      "Bagaimana performa penjualan hari ini?",
      expect.any(Function),
    );
    expect(await screen.findByText("Omzet aktual sudah dianalisis.")).toBeInTheDocument();
  });

  it("merender jawaban lama dengan format rapi tanpa avatar foto", async () => {
    api.loadConversations.mockResolvedValue([{
      id: "conversation-markdown",
      title: "Transaksi hari ini",
      updated_at: "2026-10-08T10:00:00Z",
    }]);
    api.loadConversation.mockResolvedValue({
      id: "conversation-markdown",
      title: "Transaksi hari ini",
      updated_at: "2026-10-08T10:00:00Z",
      messages: [{
        id: "assistant-markdown",
        role: "assistant",
        content: "**Hari ini** belum ada transaksi.\n* Omzet Rp0\n* Transaksi 0",
        created_at: "2026-10-08T10:00:00Z",
      }],
    });

    render(<CeoChatPage />);

    const matchingText = await screen.findAllByText("Hari ini");
    expect(matchingText.some((element) => element.tagName === "STRONG")).toBe(true);
    expect(screen.getByText("Omzet Rp0").closest("li")).toBeInTheDocument();
    expect(screen.queryByText("Terhubung ke data MYMARKET")).not.toBeInTheDocument();
    expect(screen.queryByText("Analisis saja")).not.toBeInTheDocument();
    expect(screen.queryByText("Akses eksekutif")).not.toBeInTheDocument();
    expect(screen.queryByText(/tidak dapat mengubah transaksi/i)).not.toBeInTheDocument();
    expect(screen.queryByAltText("CEO")).not.toBeInTheDocument();
    expect(screen.queryByText("gemini-test")).not.toBeInTheDocument();
  });

  it("menghentikan indikator mengetik dan memuat ulang riwayat saat respons terputus", async () => {
    api.streamMessage.mockImplementation(async (_id, _message, onEvent) => {
      onEvent({ type: "delta", text: "Jawaban yang terputus" });
      throw new Error("Jawaban terputus sebelum selesai. Coba lagi.");
    });
    api.loadConversation.mockResolvedValue({
      id: "conversation-1",
      title: "Performa hari ini",
      updated_at: "2026-10-08T10:01:00Z",
      messages: [{
        id: "user-1",
        role: "user",
        content: "Bagaimana performa penjualan hari ini?",
        created_at: "2026-10-08T10:01:00Z",
      }],
    });

    const user = userEvent.setup();
    render(<CeoChatPage />);
    await user.click(await screen.findByRole("button", { name: /performa hari ini/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Jawaban terputus");
    expect(screen.queryByText("Jawaban yang terputus")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Asisten sedang menjawab")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Pesan untuk asisten" })).toBeEnabled();
  });
});
