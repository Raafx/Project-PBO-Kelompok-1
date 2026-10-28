"use client";

// Grafik dan tabel untuk membandingkan performa satu produk antarbulan.

import { Icon } from "@iconify/react";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { Badge, Card, Table } from "react-bootstrap";

import type { HasilAnalisisProduk } from "./apiAnalisisProduk";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });
const formatAngka = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 });
const formatRupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

type DataBulanan = HasilAnalisisProduk["monthly_comparison"];

function rupiah(value: number) {
  return formatRupiah.format(value).replace(/\s/g, "");
}

function namaBulan(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("id-ID", {
    month: "short",
    year: "numeric",
  });
}

function perubahan(current: number, previous: number | undefined) {
  if (previous === undefined) return null;
  if (previous === 0) return current === 0 ? 0 : Number.POSITIVE_INFINITY;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function NilaiPerubahan({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted">—</span>;
  if (!Number.isFinite(value)) return <Badge bg="info">Baru</Badge>;
  const naik = value > 0;
  const turun = value < 0;
  return (
    <span className={naik ? "text-success" : turun ? "text-danger" : "text-muted"}>
      <Icon
        icon={naik ? "solar:arrow-up-linear" : turun ? "solar:arrow-down-linear" : "solar:minus-linear"}
        className="me-1"
      />
      {formatAngka.format(Math.abs(value))}%
    </span>
  );
}

export default function PerbandinganBulananProduk({
  bulanan,
}: {
  bulanan: DataBulanan;
}) {
  const chartOptions: ApexOptions = {
    chart: { toolbar: { show: false }, fontFamily: "inherit" },
    colors: ["#3e60d5", "#f59f45", "#0f9f78"],
    dataLabels: { enabled: false },
    grid: { borderColor: "#e9ecef", strokeDashArray: 4 },
    legend: { position: "top" },
    plotOptions: { bar: { borderRadius: 5, columnWidth: "58%" } },
    xaxis: {
      categories: bulanan.map((item) => namaBulan(item.month)),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (value) => `${formatAngka.format(Math.round(value / 1000))} rb`,
      },
    },
    tooltip: { y: { formatter: rupiah } },
  };
  const hasSales = bulanan.some(
    (item) => item.net_revenue || item.cost_of_goods || item.gross_profit,
  );

  return (
    <Card className="mb-3">
      <Card.Header>
        <h5 className="mb-1">Perbandingan antarbulan</h5>
        <p className="text-muted mb-0">
          Perubahan dihitung terhadap bulan sebelumnya dalam rentang pilihan.
        </p>
      </Card.Header>
      <Card.Body>
        {hasSales ? (
          <ApexChart
            options={chartOptions}
            series={[
              { name: "Omzet bersih", data: bulanan.map((item) => item.net_revenue) },
              { name: "HPP", data: bulanan.map((item) => item.cost_of_goods) },
              { name: "Laba / rugi", data: bulanan.map((item) => item.gross_profit) },
            ]}
            type="bar"
            height={330}
          />
        ) : (
          <div className="text-center text-muted py-4">
            Belum ada penjualan pada rentang bulan ini.
          </div>
        )}
      </Card.Body>
      <div className="table-responsive">
        <Table className="table-custom table-centered mb-0">
          <thead>
            <tr>
              <th>Bulan</th>
              <th className="text-end">Transaksi</th>
              <th className="text-end">Unit</th>
              <th className="text-end">Omzet</th>
              <th className="text-end">HPP</th>
              <th className="text-end">Laba / rugi</th>
              <th className="text-end">Margin</th>
              <th className="text-end">Δ omzet</th>
              <th className="text-end">Δ laba</th>
            </tr>
          </thead>
          <tbody>
            {bulanan.map((item, index) => {
              const previous = bulanan[index - 1];
              return (
                <tr key={item.month}>
                  <td className="fw-semibold">{namaBulan(item.month)}</td>
                  <td className="text-end">{formatAngka.format(item.transaction_count)}</td>
                  <td className="text-end">{formatAngka.format(item.quantity)}</td>
                  <td className="text-end">{rupiah(item.net_revenue)}</td>
                  <td className="text-end">{rupiah(item.cost_of_goods)}</td>
                  <td
                    className={`text-end fw-semibold ${item.gross_profit < 0 ? "text-danger" : "text-success"}`}
                  >
                    {rupiah(item.gross_profit)}
                  </td>
                  <td className="text-end">{formatAngka.format(item.margin_percentage)}%</td>
                  <td className="text-end">
                    <NilaiPerubahan
                      value={perubahan(item.net_revenue, previous?.net_revenue)}
                    />
                  </td>
                  <td className="text-end">
                    <NilaiPerubahan
                      value={perubahan(item.gross_profit, previous?.gross_profit)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </Card>
  );
}
