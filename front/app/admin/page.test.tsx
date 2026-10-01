import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import AdminPage from "./page";

describe("halaman admin", () => {
  it("menyediakan navigasi pengadaan dan form purchase order", async () => {
    const user = userEvent.setup();
    render(<AdminPage />);

    expect(screen.queryByRole("link", { name: /buka pos|buka kasir|kembali ke kasir/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/sistem tersambung/i)).not.toBeInTheDocument();
    expect(await screen.findByText(/backend belum dikonfigurasi/i)).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /^penjualan$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^laporan$/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^pembelian$/i }));
    expect(screen.getByRole("heading", { name: "Purchase order" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /buat purchase order/i }));
    expect(screen.getByRole("dialog", { name: /buat purchase order/i })).toBeInTheDocument();
  });
});

