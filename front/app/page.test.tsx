import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import PosPage from "./page";
import { shortcutRegistry } from "./shortcuts";

function dispatchScannerBurst(
  target: HTMLElement,
  value: string,
  startAt = 1000,
) {
  act(() => {
    [...value, "Enter"].forEach((key, index) => {
      const event = new KeyboardEvent("keydown", {
        key,
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(event, "timeStamp", {
        value: startAt + index * 10,
      });
      target.dispatchEvent(event);
    });
  });
}

describe("alur keyboard POS", () => {
  it("menampilkan produk langsung tanpa bar kategori", () => {
    render(<PosPage />);

    expect(screen.queryByText(/lihat semua kategori/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/kategori produk/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/tersinkronisasi/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/pos v4\.2/i)).not.toBeInTheDocument();
  });

  it("hanya menyediakan metode Tunai, QRIS, dan EDC", () => {
    render(<PosPage />);
    const paymentMethods = screen.getByRole("radiogroup", {
      name: /metode pembayaran/i,
    });

    expect(within(paymentMethods).getAllByRole("radio")).toHaveLength(3);
    expect(within(paymentMethods).getByRole("radio", { name: /tunai/i })).toBeInTheDocument();
    expect(within(paymentMethods).getByRole("radio", { name: /qris/i })).toBeInTheDocument();
    expect(within(paymentMethods).getByRole("radio", { name: /edc/i })).toBeInTheDocument();
    expect(within(paymentMethods).queryByText("Cash")).not.toBeInTheDocument();
    expect(within(paymentMethods).queryByText("No. approval")).not.toBeInTheDocument();
    expect(within(paymentMethods).queryByText("Debit / Kredit")).not.toBeInTheDocument();
  });

  it("menghilangkan teks mikro tetapi mempertahankan kontrol pembayaran", async () => {
    const user = userEvent.setup();
    render(<PosPage />);

    expect(screen.queryByText("Mie & Pasta")).not.toBeInTheDocument();
    expect(screen.queryByText("0089686010947")).not.toBeInTheDocument();
    expect(screen.queryByText(/72 stok/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: /edc/i }));
    expect(screen.queryByText(/12–19 digit/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^wajib$/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/nomor kartu edc/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nomor approval edc/i)).toBeInTheDocument();
  });

  it("menempatkan enam tab stop utama dalam urutan transaksi", async () => {
    const user = userEvent.setup();
    render(<PosPage />);

    const scan = screen.getByRole("textbox", { name: /scan barcode/i });
    scan.focus();
    await user.tab();
    expect(screen.getByRole("grid", { name: /daftar produk/i })).toHaveFocus();
    await user.tab();
    expect(
      screen.getByRole("textbox", { name: /nomor hp member/i }),
    ).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("radio", { name: /tunai/i })).toHaveFocus();
    await user.tab();
    expect(
      screen.getByRole("textbox", { name: /uang diterima/i }),
    ).toHaveFocus();
    await user.tab();
    expect(
      screen.getByRole("button", { name: /bayar \/ selesaikan/i }),
    ).toHaveFocus();
  });

  it("memilih baris dengan panah dan mengatur qty lewat angka lalu Enter", () => {
    render(<PosPage />);
    const grid = screen.getByRole("grid", { name: /daftar produk/i });
    grid.focus();

    fireEvent.keyDown(grid, { key: "ArrowUp" });
    const previousProductRow = screen.getByRole("row", {
      name: /AQUA Air Mineral/i,
    });
    expect(previousProductRow).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(grid, { key: "3" });
    fireEvent.keyDown(grid, { key: "Enter" });
    expect(within(previousProductRow).getByText("3")).toBeInTheDocument();
  });

  it("menjalankan shortcut registry tanpa kombinasi browser yang dilarang", async () => {
    render(<PosPage />);
    const scan = screen.getByRole("textbox", { name: /scan barcode/i });

    fireEvent.keyDown(scan, { key: "F2" });
    expect(
      screen.getByRole("dialog", { name: /pilih produk/i }),
    ).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("dialog", { name: /pilih produk/i }), {
      key: "Escape",
    });
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: /pilih produk/i }),
      ).not.toBeInTheDocument(),
    );

    fireEvent.keyDown(scan, { key: "F4" });
    expect(
      screen.getByRole("textbox", { name: /nomor hp member/i }),
    ).toHaveFocus();
    expect(
      Object.values(shortcutRegistry).some((shortcut) =>
        shortcut.label.startsWith("Alt+"),
      ),
    ).toBe(false);
  });

  it("menambahkan qty multiplier dari kolom scan", () => {
    render(<PosPage />);
    const scan = screen.getByRole("textbox", { name: /scan barcode/i });

    fireEvent.change(scan, { target: { value: "3*0089686010947" } });
    fireEvent.keyDown(scan, { key: "Enter" });

    const row = screen.getByRole("row", { name: /Indomie Mi Goreng Original/i });
    expect(within(row).getByText("7")).toBeInTheDocument();
  });

  it("scan saat fokus di Uang diterima menambah item tanpa mengubah nominal atau membayar", () => {
    render(<PosPage />);
    const cash = screen.getByRole("textbox", { name: /uang diterima/i });
    fireEvent.change(cash, { target: { value: "200000" } });
    cash.focus();
    expect(cash).toHaveValue("200.000");

    dispatchScannerBurst(cash, "8996001600146");

    expect(
      screen.getByRole("row", {
        name: /Teh Pucuk Harum/i,
      }),
    ).toBeInTheDocument();
    expect(cash).toHaveValue("200.000");
    expect(
      screen.queryByRole("dialog", { name: /transaksi berhasil/i }),
    ).not.toBeInTheDocument();
  });

  it("Enter pada Uang diterima kosong membayar pas dengan kembalian Rp0", async () => {
    render(<PosPage />);
    const cash = screen.getByRole("textbox", { name: /uang diterima/i });
    expect(cash).toHaveValue("");

    fireEvent.keyDown(cash, { key: "Enter" });
    const receipt = await screen.findByRole("dialog", {
      name: /transaksi berhasil/i,
    });
    expect(within(receipt).getByText("Rp0")).toBeInTheDocument();
  });

  it("menyelesaikan QRIS tanpa mouse", async () => {
    render(<PosPage />);
    const scan = screen.getByRole("textbox", { name: /scan barcode/i });

    fireEvent.keyDown(scan, { key: "2", ctrlKey: true, shiftKey: true });
    expect(screen.getByRole("radio", { name: /QRIS/i })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    fireEvent.keyDown(document.activeElement!, { key: "F12" });
    const approval = screen.getByRole("textbox", {
      name: /nomor approval QRIS/i,
    });
    await waitFor(() => expect(approval).toHaveFocus());
    fireEvent.change(approval, { target: { value: "QRIS12345" } });
    fireEvent.keyDown(approval, { key: "Enter" });
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /bayar \/ selesaikan/i }),
      ).toHaveFocus(),
    );
    fireEvent.keyDown(document.activeElement!, { key: "F12" });
    expect(
      await screen.findByRole("dialog", { name: /transaksi berhasil/i }),
    ).toBeInTheDocument();
  });

  it("menyelesaikan EDC Debit tanpa mouse", async () => {
    render(<PosPage />);
    const scan = screen.getByRole("textbox", { name: /scan barcode/i });

    fireEvent.keyDown(scan, { key: "3", ctrlKey: true, shiftKey: true });
    fireEvent.keyDown(document.activeElement!, { key: "F12" });
    const cardNumber = screen.getByLabelText(/nomor kartu EDC/i);
    await waitFor(() => expect(cardNumber).toHaveFocus());
    fireEvent.change(cardNumber, { target: { value: "4111111111111111" } });
    const approval = screen.getByRole("textbox", {
      name: /nomor approval EDC/i,
    });
    approval.focus();
    fireEvent.change(approval, { target: { value: "A12345" } });
    fireEvent.keyDown(approval, { key: "Enter" });
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /bayar \/ selesaikan/i }),
      ).toHaveFocus(),
    );
    fireEvent.keyDown(document.activeElement!, { key: "F12" });
    expect(
      await screen.findByRole("dialog", { name: /transaksi berhasil/i }),
    ).toBeInTheDocument();
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
    fireEvent.change(cash, { target: { value: "10000000" } });
    fireEvent.keyDown(cash, { key: "Enter" });

    expect(
      await screen.findByRole("dialog", { name: /konfirmasi nominal besar/i }),
    ).toBeInTheDocument();
  });
});
