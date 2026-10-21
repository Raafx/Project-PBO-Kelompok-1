import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import AdminPage from "./page";

describe("halaman admin", () => {
  it("menempatkan seluruh modul operasional langsung di sidebar", async () => {
    const user = userEvent.setup();
    render(<AdminPage />);

    expect(screen.queryByRole("link", { name: /buka pos|buka kasir|kembali ke kasir/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/sistem tersambung/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^refresh$/i })).not.toBeInTheDocument();
    expect(await screen.findByText(/backend belum dikonfigurasi/i)).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /^penjualan$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^laporan bisnis$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^produk & promo$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^transaksi live$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^kasir & shift$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^kontrol stok$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^pelanggan$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^keuangan$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^pengaturan$/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^pusat operasional$/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /role & akses/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^produk & promo$/i }));
    expect(screen.getAllByRole("heading", { name: "Master Produk" }).length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: /tambah produk/i }));
    const productDialog = screen.getByRole("dialog", { name: /tambah produk/i });
    expect(productDialog).toBeInTheDocument();
    await user.click(within(productDialog).getByRole("button", { name: /^close$/i }));

    await user.click(screen.getByRole("button", { name: /^po & supplier$/i }));
    expect(screen.getByRole("heading", { name: "Riwayat pembelian" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /catat pembelian/i }));
    expect(screen.getByRole("dialog", { name: /catat pembelian/i })).toBeInTheDocument();
  });

  it("menyediakan monitor transaksi live dengan komponen operasional", async () => {
    const user = userEvent.setup();
    render(<AdminPage />);
    await screen.findByText(/backend belum dikonfigurasi/i);
    await user.click(screen.getByRole("button", { name: /^transaksi live$/i }));
    expect(screen.getByRole("heading", { name: /workflow transaksi live/i })).toBeInTheDocument();
    expect(screen.getByText(/kasir online/i)).toBeInTheDocument();
    expect(screen.getByText(/siap melayani/i)).toBeInTheDocument();
    expect(screen.getByText(/belum ada kasir yang terhubung/i)).toBeInTheDocument();
  });
});

