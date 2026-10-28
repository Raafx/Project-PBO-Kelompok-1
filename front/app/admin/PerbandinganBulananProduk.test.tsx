import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import PerbandinganBulananProduk from "./PerbandinganBulananProduk";

vi.mock("next/dynamic", () => ({
  default: () => () => <div data-testid="monthly-chart" />,
}));

describe("perbandingan bulanan produk", () => {
  it("menampilkan setiap bulan dan perubahan dari bulan sebelumnya", () => {
    render(
      <PerbandinganBulananProduk
        bulanan={[
          {
            month: "2026-08-01",
            transaction_count: 8,
            quantity: 10,
            gross_revenue: 100_000,
            discount: 0,
            net_revenue: 100_000,
            cost_of_goods: 70_000,
            gross_profit: 30_000,
            margin_percentage: 30,
            average_unit_price: 10_000,
          },
          {
            month: "2026-09-01",
            transaction_count: 12,
            quantity: 15,
            gross_revenue: 150_000,
            discount: 0,
            net_revenue: 150_000,
            cost_of_goods: 105_000,
            gross_profit: 45_000,
            margin_percentage: 30,
            average_unit_price: 10_000,
          },
        ]}
      />,
    );

    expect(screen.getByTestId("monthly-chart")).toBeInTheDocument();
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(3);
    expect(within(rows[1]).getByText(/agu.*2026/i)).toBeInTheDocument();
    expect(within(rows[2]).getByText(/sep.*2026/i)).toBeInTheDocument();
    expect(within(rows[2]).getAllByText("50%")).toHaveLength(2);
    expect(within(rows[2]).getByText("Rp150.000")).toBeInTheDocument();
  });
});
