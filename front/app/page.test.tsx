import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import PosPage from "./page";
import { shortcutRegistry } from "./shortcuts";

function dispatchScannerBurst(target: HTMLElement, value: string, startAt = 1000) {
  act(() => {
    [...value, "Enter"].forEach((key, index) => {
      const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
      Object.defineProperty(event, "timeStamp", { value: startAt + index * 10 });
      target.dispatchEvent(event);
    });
  });
}

describe("alur keyboard POS", () => {
  it("menempatkan enam tab stop utama dalam urutan transaksi", async () => {
    const user = userEvent.setup();
    render(<PosPage />);

    const scan = screen.getByRole("textbox", { name: /scan barcode/i });
    scan.focus();
    await user.tab();
    expect(screen.getByRole("grid", { name: /daftar produk/i })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("textbox", { name: /nomor hp member/i })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("radio", { name: /tunai/i })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("textbox", { name: /uang diterima/i })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: /bayar \/ selesaikan/i })).toHaveFocus();
  });

  it("memilih baris dengan panah dan mengatur qty lewat angka lalu Enter", () => {
    render(<PosPage />);
    const grid = screen.getByRole("grid", { name: /daftar produk/i });
    grid.focus();

    fireEvent.keyDown(grid, { key: "ArrowUp" });
    const sunlightRow = screen.getByRole("row", { name: /Sunlight Pencuci Piring/i });
    expect(sunlightRow).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(grid, { key: "3" });
    fireEvent.keyDown(grid, { key: "Enter" });
    expect(within(sunlightRow).getByText("3")).toBeInTheDocument();
  });

  it("menjalankan shortcut registry tanpa kombinasi browser yang dilarang", async () => {
    render(<PosPage />);
    const scan = screen.getByRole("textbox", { name: /scan barcode/i });

    fireEvent.keyDown(scan, { key: "F2" });
    expect(screen.getByRole("dialog", { name: /pilih produk/i })).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("dialog", { name: /pilih produk/i }), { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog", { name: /pilih produk/i })).not.toBeInTheDocument());

    fireEvent.keyDown(scan, { key: "F4" });
    expect(screen.getByRole("textbox", { name: /nomor hp member/i })).toHaveFocus();
    expect(Object.values(shortcutRegistry).some((shortcut) => shortcut.label.startsWith("Alt+"))).toBe(false);
  });

  it("menambahkan qty multiplier dari kolom scan", () => {
    render(<PosPage />);
    const scan = screen.getByRole("textbox", { name: /scan barcode/i });

    fireEvent.change(scan, { target: { value: "3*8998866200224" } });
    fireEvent.keyDown(scan, { key: "Enter" });

    const row = screen.getByRole("row", { name: /Indomie Goreng Original/i });
    expect(within(row).getByText("7")).toBeInTheDocument();
  });

  it("scan saat fokus di Uang diterima menambah item tanpa mengubah nominal atau membayar", () => {
    render(<PosPage />);
    const cash = screen.getByRole("textbox", { name: /uang diterima/i });
    fireEvent.change(cash, { target: { value: "200000" } });
    cash.focus();
    expect(cash).toHaveValue("200.000");

    dispatchScannerBurst(cash, "8991002101656");

    expect(screen.getByRole("row", { name: /Kopi Kapal Api Special Mix/i })).toBeInTheDocument();
    expect(cash).toHaveValue("200.000");
    expect(screen.queryByRole("dialog", { name: /transaksi berhasil/i })).not.toBeInTheDocument();
  });

  it("Enter pada Uang diterima kosong membayar pas dengan kembalian Rp0", async () => {
    render(<PosPage />);
    const cash = screen.getByRole("textbox", { name: /uang diterima/i });
    expect(cash).toHaveValue("");

    fireEvent.keyDown(cash, { key: "Enter" });
    const receipt = await screen.findByRole("dialog", { name: /transaksi berhasil/i });
    expect(within(receipt).getByText("Rp0")).toBeInTheDocument();
  });

  it("menyelesaikan QRIS tanpa mouse", async () => {
    const user = userEvent.setup();
    render(<PosPage />);
    const scan = screen.getByRole("textbox", { name: /scan barcode/i });

    fireEvent.keyDown(scan, { key: "2", ctrlKey: true, shiftKey: true });
    expect(screen.getByRole("radio", { name: /QRIS/i })).toHaveAttribute("aria-checked", "true");
    fireEvent.keyDown(document.activeElement!, { key: "F12" });
    const confirm = screen.getByRole("button", { name: /konfirmasi diterima/i });
    await waitFor(() => expect(confirm).toHaveFocus());
    await user.keyboard("{Enter}");
    await waitFor(() => expect(screen.getByRole("button", { name: /bayar \/ selesaikan/i })).toHaveFocus());
    fireEvent.keyDown(document.activeElement!, { key: "F12" });
    expect(await screen.findByRole("dialog", { name: /transaksi berhasil/i })).toBeInTheDocument();
  });

  it("menyelesaikan Debit tanpa mouse", async () => {
    render(<PosPage />);
    const scan = screen.getByRole("textbox", { name: /scan barcode/i });

    fireEvent.keyDown(scan, { key: "3", ctrlKey: true, shiftKey: true });
    fireEvent.keyDown(document.activeElement!, { key: "F12" });
    const approval = screen.getByRole("textbox", { name: /nomor approval EDC/i });
    await waitFor(() => expect(approval).toHaveFocus());
    fireEvent.change(approval, { target: { value: "A12345" } });
    fireEvent.keyDown(approval, { key: "Enter" });
    await waitFor(() => expect(screen.getByRole("button", { name: /bayar \/ selesaikan/i })).toHaveFocus());
    fireEvent.keyDown(document.activeElement!, { key: "F12" });
    expect(await screen.findByRole("dialog", { name: /transaksi berhasil/i })).toBeInTheDocument();
  });

  it("menolak nominal lebih dari 13 digit", () => {
    render(<PosPage />);
    const cash = screen.getByRole("textbox", { name: /uang diterima/i });
    fireEvent.change(cash, { target: { value: "12345678901234" } });
    expect(cash).toHaveValue("");
    expect(screen.getByText(/maksimal 13 digit/i)).toBeInTheDocument();
  });

  it("meminta konfirmasi untuk nominal lebih dari sepuluh kali total", async () => {
    render(<PosPage />);
    const cash = screen.getByRole("textbox", { name: /uang diterima/i });
    fireEvent.change(cash, { target: { value: "2000000" } });
    fireEvent.keyDown(cash, { key: "Enter" });

    expect(await screen.findByRole("dialog", { name: /konfirmasi nominal besar/i })).toBeInTheDocument();
  });
});
