"use client";

// Komponen menu Penjualan dan Laporan Bisnis di sidebar admin.
import { Icon } from "@iconify/react";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { Fragment, useState } from "react";
import {
  Badge, Button, Card, Col, Form, InputGroup, ProgressBar, Row, Spinner, Table,
} from "react-bootstrap";

import PilihanCari from "../PilihanCari";
import type { AdminSale, SalesReport } from "../api";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });
const numberFormatter = new Intl.NumberFormat("id-ID");
const moneyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency", currency: "IDR", maximumFractionDigits: 0,
});
const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit", month: "short", year: "numeric",
});
const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
});
const namaPembayaran: Record<string, string> = {
  cash: "Tunai", qris: "QRIS", edc: "EDC", debit: "Debit",
  credit: "Kredit", wallet: "E-Wallet", voucher: "Voucher",
};

function formatRupiah(value: number) {
  return moneyFormatter.format(value).replace(/\s/g, "");
}

function formatTanggal(value: string | null) {
  return value ? dateFormatter.format(new Date(`${value}T00:00:00`)) : "Belum ditentukan";
}

function rentangBulan(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const lastDay = new Date(year, monthNumber, 0).getDate();
  return { from: `${month}-01`, to: `${month}-${String(lastDay).padStart(2, "0")}` };
}

function bulanTerpilih(range: { from: string; to: string }) {
  const month = range.from.slice(0, 7);
  const fullMonth = rentangBulan(month);
  return range.from === fullMonth.from && range.to === fullMonth.to ? month : "";
}

function PesanKosong({ icon, title, copy }: { icon: string; title: string; copy: string }) {
  return (
    <div className="text-center py-4">
      <span className="avatar-lg rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center mb-2">
        <Icon icon={icon} width={28} />
      </span>
      <h5>{title}</h5>
      <p className="text-muted mb-0">{copy}</p>
    </div>
  );
}
function JudulPanel({
  icon,
  title,
  copy,
  action,
  onAction,
}: {
  icon: string;
  title: string;
  copy: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <Card.Header className="d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center gap-2">
        <span className="avatar-sm rounded bg-primary-subtle text-primary d-flex align-items-center justify-content-center">
          <Icon icon={icon} width={20} />
        </span>
        <div>
          <h5 className="mb-0">{title}</h5>
          <small className="text-muted">{copy}</small>
        </div>
      </div>
      {action && onAction ? (
        <Button variant="link" size="sm" onClick={onAction}>
          {action} <Icon icon="solar:alt-arrow-right-linear" width={15} />
        </Button>
      ) : null}
    </Card.Header>
  );
}

// Menampilkan transaksi yang sudah difilter oleh backend.
export function RiwayatPenjualan({
  sales,
  search,
  status,
  payment,
  month,
  page,
  loading,
  onSearch,
  onStatus,
  onPayment,
  onMonth,
  onPage,
}: {
  sales: AdminSale[];
  search: string;
  status: string;
  payment: string;
  month: string;
  page: number;
  loading: boolean;
  onSearch: (value: string) => void;
  onStatus: (value: string) => void;
  onPayment: (value: string) => void;
  onMonth: (value: string) => void;
  onPage: (page: number) => void;
}) {
  return (
    <Card>
      <Card.Header className="d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div>
          <h4 className="mb-1">Riwayat transaksi POS</h4>
          <p className="text-muted mb-0">
            Data pembayaran selesai, transaksi hold, dan transaksi dibatalkan.
          </p>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <InputGroup className="admin-report-search">
            <InputGroup.Text>
              <Icon icon="solar:magnifer-linear" width={17} />
            </InputGroup.Text>
            <Form.Control
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Cari transaksi, kasir, atau produk"
            />
          </InputGroup>
          <PilihanCari
            className="w-auto"
            value={status}
            onChange={(event) => onStatus(event.target.value)}
            aria-label="Filter status transaksi"
          >
            <option value="all">Semua status</option>
            <option value="completed">Selesai</option>
            <option value="held">Hold</option>
            <option value="cancelled">Dibatalkan</option>
          </PilihanCari>
          <PilihanCari
            className="w-auto"
            value={payment}
            onChange={(event) => onPayment(event.target.value)}
            aria-label="Filter metode pembayaran"
          >
            <option value="all">Semua pembayaran</option>
            <option value="cash">Tunai</option>
            <option value="qris">QRIS</option>
            <option value="edc">EDC</option>
          </PilihanCari>
          <Form.Control
            type="month"
            className="w-auto"
            value={month}
            onChange={(event) => onMonth(event.target.value)}
            aria-label="Filter bulan penjualan"
          />
          {month ? <Button variant="outline-secondary" onClick={() => onMonth("")}>Semua bulan</Button> : null}
        </div>
      </Card.Header>
      {loading ? <div className="px-3 py-2 text-muted"><Spinner size="sm" className="me-2" />Memuat transaksi...</div> : null}
      <TabelTransaksi sales={sales} />
      {!loading && !sales.length ? (
        <Card.Body>
          <PesanKosong
            icon="solar:bill-list-bold-duotone"
            title="Transaksi tidak ditemukan"
            copy="Ubah kata kunci, status, pembayaran, atau bulan untuk melihat transaksi lain."
          />
        </Card.Body>
      ) : null}
      <Card.Footer className="d-flex align-items-center justify-content-between gap-2">
        <small className="text-muted">{sales.length ? `Menampilkan ${(page - 1) * 100 + 1}–${(page - 1) * 100 + sales.length} transaksi` : "Tidak ada transaksi"}</small>
        <div className="d-flex gap-2">
          <Button size="sm" variant="outline-secondary" disabled={loading || page === 1} onClick={() => onPage(page - 1)}>Sebelumnya</Button>
          <Button size="sm" variant="outline-secondary" disabled={loading || sales.length < 100} onClick={() => onPage(page + 1)}>Berikutnya</Button>
        </div>
      </Card.Footer>
    </Card>
  );
}

// Menampilkan angka laporan untuk rentang tanggal yang dipilih pengguna.
export function LaporanBisnis({
  report,
  range,
  working,
  onRangeChange,
  onApply,
  onExport,
  onOpenAnalysis,
}: {
  report: SalesReport;
  range: { from: string; to: string };
  working: boolean;
  onRangeChange: (value: { from: string; to: string }) => void;
  onApply: (value?: { from: string; to: string }) => void;
  onExport: () => void;
  onOpenAnalysis: () => void;
}) {
  const [periodMode, setPeriodMode] = useState<"daily" | "monthly">("daily");
  const [reportTransactionSearch, setReportTransactionSearch] = useState("");
  const [transactionPage, setTransactionPage] = useState(1);
  const reportPageSize = 25;
  const transactionQuery = reportTransactionSearch
    .trim()
    .toLocaleLowerCase("id-ID");
  const filteredReportTransactions = report.transactions.filter(
    (sale) =>
      !transactionQuery ||
      [
        sale.transaction_no,
        sale.cashier_name,
        sale.member_name || "",
        sale.payment_method || "",
        ...sale.items.flatMap((item) => [item.product_name, item.barcode]),
      ].some((value) =>
        value.toLocaleLowerCase("id-ID").includes(transactionQuery),
      ),
  );
  const transactionPageCount = Math.max(
    1,
    Math.ceil(filteredReportTransactions.length / reportPageSize),
  );
  const currentTransactionPage = Math.min(transactionPage, transactionPageCount);
  const visibleReportTransactions = filteredReportTransactions.slice(
    (currentTransactionPage - 1) * reportPageSize,
    currentTransactionPage * reportPageSize,
  );
  const localDateValue = (value: Date) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const today = new Date();
  const todayValue = localDateValue(today);
  const monthStartValue = localDateValue(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const productRevenue = report.product_performance.reduce(
    (sum, product) => sum + product.net_revenue, 0,
  );
  const metrics = [
    {
      label: "Total omzet",
      value: formatRupiah(report.total_sales),
      icon: "solar:wallet-money-bold-duotone",
    },
    {
      label: "Transaksi",
      value: numberFormatter.format(report.transaction_count),
      icon: "solar:bill-list-bold-duotone",
    },
    {
      label: "Item terjual",
      value: numberFormatter.format(report.item_count),
      icon: "solar:cart-check-bold-duotone",
    },
    {
      label: "Rata-rata transaksi",
      value: formatRupiah(report.average_transaction),
      icon: "solar:chart-2-bold-duotone",
    },
    {
      label: "Laba kotor produk",
      value: formatRupiah(report.estimated_gross_profit),
      icon: "solar:graph-up-bold-duotone",
    },
    {
      label: "Diskon",
      value: formatRupiah(report.total_discount),
      icon: "solar:tag-price-bold-duotone",
    },
  ];
  return (
    <>
      <Card className="mb-3">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col xl={4}>
              <div className="d-flex align-items-center gap-2">
                <span className="avatar-md rounded bg-primary-subtle text-primary d-flex align-items-center justify-content-center">
                  <Icon icon="solar:calendar-date-bold-duotone" width={24} />
                </span>
                <div>
                  <h5 className="mb-0">Periode laporan</h5>
                  <small className="text-muted">
                    Maksimal 366 hari per penarikan data.
                  </small>
                </div>
              </div>
            </Col>
            <Col md={3} xl={2}>
              <Form.Label htmlFor="report-month">Pilih bulan</Form.Label>
              <Form.Control
                id="report-month"
                type="month"
                value={bulanTerpilih(range)}
                disabled={working}
                onChange={(event) => event.target.value && onApply(rentangBulan(event.target.value))}
              />
            </Col>
            <Col md={3} xl={2}>
              <Form.Label>Dari</Form.Label>
              <Form.Control
                type="date"
                value={range.from}
                max={range.to}
                onChange={(event) =>
                  onRangeChange({ ...range, from: event.target.value })
                }
              />
            </Col>
            <Col md={3} xl={2}>
              <Form.Label>Sampai</Form.Label>
              <Form.Control
                type="date"
                value={range.to}
                min={range.from}
                onChange={(event) =>
                  onRangeChange({ ...range, to: event.target.value })
                }
              />
            </Col>
            <Col md={6} xl={4} className="d-flex flex-wrap gap-2">
              <Button
                variant="outline-secondary"
                disabled={working}
                onClick={() =>
                  onApply({ from: todayValue, to: todayValue })
                }
              >
                Hari ini
              </Button>
              <Button
                variant="outline-secondary"
                disabled={working}
                onClick={() =>
                  onApply({ from: monthStartValue, to: todayValue })
                }
              >
                Bulan ini
              </Button>
              <Button
                variant="outline-primary"
                disabled={working}
                onClick={() => onApply()}
              >
                {working ? (
                  <Spinner size="sm" className="me-1" />
                ) : (
                  <Icon
                    icon="solar:refresh-circle-linear"
                    width={17}
                    className="me-1"
                  />
                )}
                Terapkan
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => window.print()}
              >
                <Icon
                  icon="solar:printer-2-linear"
                  width={17}
                  className="me-1"
                />
                Cetak
              </Button>
              <Button onClick={onExport} disabled={working}>
                <Icon
                  icon="solar:download-minimalistic-linear"
                  width={17}
                  className="me-1"
                />
                Ekspor CSV
              </Button>
              <Button variant="outline-primary" onClick={onOpenAnalysis}>
                <Icon icon="solar:chart-square-bold-duotone" width={17} className="me-1" />
                Analisis Produk
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <Row className="g-3 mb-3">
        {metrics.map((metric) => (
          <Col xxl={2} md={4} sm={6} key={metric.label}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex align-items-center gap-2">
                  <span className="avatar-sm rounded bg-primary-subtle text-primary d-flex align-items-center justify-content-center">
                    <Icon icon={metric.icon} width={20} />
                  </span>
                  <div>
                    <small className="text-muted">{metric.label}</small>
                    <h5 className="mb-0">{metric.value}</h5>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <Card className="mb-3">
        <JudulPanel
          icon="solar:calculator-bold-duotone"
          title="Analisis laba / rugi"
          copy="Berdasarkan transaksi selesai dan pengeluaran tercatat pada periode yang dipilih."
        />
        <Card.Body>
          <Row className="g-3">
            {[
              ["Omzet bersih item", productRevenue, ""],
              ["HPP barang terjual", report.cost_of_goods, ""],
              ["Laba kotor", report.estimated_gross_profit, report.estimated_gross_profit < 0 ? "text-danger" : "text-success"],
              ["Pengeluaran operasional", report.expenses, ""],
              [report.net_profit < 0 ? "Rugi operasional" : "Laba operasional", report.net_profit, report.net_profit < 0 ? "text-danger" : "text-success"],
            ].map(([label, value, color]) => (
              <Col lg={2} md={4} sm={6} key={String(label)}>
                <small className="text-muted d-block">{label}</small>
                <strong className={`fs-5 ${color}`}>{formatRupiah(Number(value))}</strong>
              </Col>
            ))}
          </Row>
          <small className="text-muted d-block mt-3">Laba/rugi operasional = laba kotor produk − pengeluaran tercatat. Pembelian stok menjadi HPP saat barang terjual; transaksi hold dan batal tidak dihitung.</small>
        </Card.Body>
      </Card>
      <Row className="g-3 mb-3">
        <Col xl={8}>
          <Card className="h-100">
            <JudulPanel
              icon="solar:chart-bold-duotone"
              title="Tren omzet"
              copy={`${formatTanggal(report.date_from)} sampai ${formatTanggal(report.date_to)}`}
            />
            <Card.Body>
              <GrafikTrenPenjualan data={report.daily_sales} />
            </Card.Body>
          </Card>
        </Col>
        <Col xl={4}>
          <Card className="h-100">
            <JudulPanel
              icon="solar:card-bold-duotone"
              title="Metode pembayaran"
              copy="Nilai dan jumlah transaksi."
            />
            <Card.Body>
              <DaftarRincian
                items={report.payment_methods.map((item) => ({
                  ...item,
                  label: namaPembayaran[item.label] || item.label,
                }))}
                empty="Belum ada pembayaran."
                unit="transaksi"
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="g-3">
        <Col xl={6}>
          <Card className="h-100">
            <JudulPanel
              icon="solar:layers-bold-duotone"
              title="Penjualan kategori"
              copy="Kontribusi omzet per kategori."
            />
            <Card.Body>
              <DaftarRincian
                items={report.category_sales}
                empty="Belum ada kategori terjual."
                unit="item"
              />
            </Card.Body>
          </Card>
        </Col>
        <Col xl={6}>
          <Card className="h-100">
            <JudulPanel
              icon="solar:cup-star-bold-duotone"
              title="Produk terlaris"
              copy="Produk dengan unit penjualan tertinggi."
            />
            <Card.Body>
              <DaftarProdukTerlaris products={report.top_products} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Card className="mt-3">
        <Card.Header className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h4 className="mb-1">Laporan transaksi per periode</h4>
            <p className="text-muted mb-0">
              Ringkasan omzet, laba, dan jumlah transaksi harian atau bulanan.
            </p>
          </div>
          <PilihanCari
            className="w-auto"
            value={periodMode}
            onChange={(event) =>
              setPeriodMode(event.target.value as "daily" | "monthly")
            }
            aria-label="Kelompokkan laporan transaksi"
          >
            <option value="daily">Per hari</option>
            <option value="monthly">Per bulan</option>
          </PilihanCari>
        </Card.Header>
        <div className="table-responsive">
          <Table className="table-custom table-centered mb-0">
            <thead>
              <tr>
                <th>Periode</th>
                <th className="text-end">Transaksi</th>
                <th className="text-end">Omzet</th>
                <th className="text-end">Laba kotor</th>
                <th className="text-end">Pengeluaran</th>
                <th className="text-end">Laba / rugi operasional</th>
              </tr>
            </thead>
            <tbody>
              {(periodMode === "daily"
                ? report.daily_sales.map((item) => ({
                    period: formatTanggal(item.date),
                    ...item,
                  }))
                : report.monthly_sales.map((item) => ({
                    period: new Date(`${item.month}-01T00:00:00`).toLocaleDateString(
                      "id-ID",
                      { month: "long", year: "numeric" },
                    ),
                    ...item,
                  }))).map((item) => (
                <tr key={item.period}>
                  <td>
                    <strong>{item.period}</strong>
                  </td>
                  <td className="text-end">
                    {numberFormatter.format(item.transaction_count)}
                  </td>
                  <td className="text-end">{formatRupiah(item.total_sales)}</td>
                  <td className={`text-end fw-semibold ${item.gross_profit < 0 ? "text-danger" : "text-success"}`}>
                    {formatRupiah(item.gross_profit)}
                  </td>
                  <td className="text-end">{formatRupiah(item.expenses)}</td>
                  <td className={`text-end fw-semibold ${item.net_profit < 0 ? "text-danger" : "text-success"}`}>
                    {formatRupiah(item.net_profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
      <Card className="mt-3">
        <Card.Header className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h4 className="mb-1">Detail transaksi dan barang</h4>
            <p className="text-muted mb-0">
              Buka setiap transaksi untuk melihat produk, jumlah, harga, diskon,
              dan laba per barang.
            </p>
          </div>
          <InputGroup className="admin-report-search">
            <InputGroup.Text>
              <Icon icon="solar:magnifer-linear" width={17} />
            </InputGroup.Text>
            <Form.Control
              value={reportTransactionSearch}
              onChange={(event) => {
                setReportTransactionSearch(event.target.value);
                setTransactionPage(1);
              }}
              placeholder="Cari transaksi, kasir, atau produk"
              aria-label="Cari detail transaksi"
            />
          </InputGroup>
        </Card.Header>
        <TabelTransaksi sales={visibleReportTransactions} />
        {!filteredReportTransactions.length ? (
          <Card.Body className="text-center text-muted">
            Transaksi tidak ditemukan pada periode ini.
          </Card.Body>
        ) : (
          <NavigasiHalamanLaporan
            page={currentTransactionPage}
            pageCount={transactionPageCount}
            itemCount={filteredReportTransactions.length}
            pageSize={reportPageSize}
            onPageChange={setTransactionPage}
          />
        )}
      </Card>
    </>
  );
}

function NavigasiHalamanLaporan({
  page,
  pageCount,
  itemCount,
  pageSize,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  itemCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, itemCount);
  return (
    <Card.Footer className="d-flex flex-wrap align-items-center justify-content-between gap-2">
      <small className="text-muted">
        Menampilkan {numberFormatter.format(firstItem)}–
        {numberFormatter.format(lastItem)} dari {numberFormatter.format(itemCount)} data
      </small>
      <div className="d-flex align-items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline-secondary"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Sebelumnya
        </Button>
        <small className="text-muted">
          Halaman {numberFormatter.format(page)} dari {numberFormatter.format(pageCount)}
        </small>
        <Button
          type="button"
          size="sm"
          variant="outline-secondary"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          Berikutnya
        </Button>
      </div>
    </Card.Footer>
  );
}

// Nilai grafik berasal dari laporan API; tidak dihitung ulang dari tabel yang tampil.
function GrafikTrenPenjualan({ data }: { data: SalesReport["daily_sales"] }) {
  const options: ApexOptions = {
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "inherit",
    },
    colors: ["#3e60d5", "#0f9f78"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.04,
        stops: [0, 95, 100],
      },
    },
    grid: { borderColor: "#e9ecef", strokeDashArray: 4 },
    xaxis: {
      categories: data.map((item) =>
        new Date(`${item.date}T00:00:00`).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
        }),
      ),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (value) =>
          value >= 1_000_000
            ? `${(value / 1_000_000).toFixed(1)} jt`
            : `${Math.round(value / 1000)} rb`,
      },
    },
    tooltip: { y: { formatter: (value) => formatRupiah(value) } },
  };
  return (
    <ReactApexChart
      options={options}
      series={[
        { name: "Omzet", data: data.map((item) => item.total_sales) },
        { name: "Laba kotor", data: data.map((item) => item.gross_profit) },
      ]}
      type="area"
      height={310}
    />
  );
}

function DaftarRincian({
  items,
  empty,
  unit,
}: {
  items: Array<{ label: string; amount: number; count: number }>;
  empty: string;
  unit: string;
}) {
  const max = Math.max(...items.map((item) => item.amount), 1);
  if (!items.length)
    return <p className="text-muted text-center py-4 mb-0">{empty}</p>;
  return (
    <div>
      {items.slice(0, 7).map((item) => (
        <div className="mb-3" key={item.label}>
          <div className="d-flex justify-content-between mb-1">
            <strong>{item.label}</strong>
            <span>{formatRupiah(item.amount)}</span>
          </div>
          <ProgressBar now={Math.max(5, (item.amount / max) * 100)} />
          <small className="text-muted">
            {numberFormatter.format(item.count)} {unit}
          </small>
        </div>
      ))}
    </div>
  );
}

function DaftarProdukTerlaris({ products }: { products: SalesReport["top_products"] }) {
  if (!products.length)
    return (
      <p className="text-muted text-center py-4 mb-0">
        Belum ada produk terjual pada periode ini.
      </p>
    );
  return (
    <div>
      {products.map((product, index) => (
        <div
          className="d-flex align-items-center py-2 border-bottom"
          key={product.barcode}
        >
          <Badge bg="primary" className="me-2">
            {index + 1}
          </Badge>
          <div className="flex-grow-1">
            <h6 className="mb-0">{product.name}</h6>
            <small className="text-muted">{product.barcode}</small>
          </div>
          <div className="text-end">
            <strong className="d-block">
              {numberFormatter.format(product.quantity)} unit
            </strong>
            <small className="text-muted d-block">
              Omzet {formatRupiah(product.revenue)}
            </small>
            <small className="text-success">
              Laba {formatRupiah(product.gross_profit)} ·{" "}
              {product.margin_percentage.toLocaleString("id-ID", {
                maximumFractionDigits: 2,
              })}
              %
            </small>
          </div>
        </div>
      ))}
    </div>
  );
}

function TabelTransaksi({
  sales,
  compact = false,
}: {
  sales: AdminSale[];
  compact?: boolean;
}) {
  const [expandedSales, setExpandedSales] = useState<Set<string>>(new Set());
  if (!sales.length) return null;
  const toggleSale = (saleId: string) => {
    setExpandedSales((current) => {
      const next = new Set(current);
      if (next.has(saleId)) next.delete(saleId);
      else next.add(saleId);
      return next;
    });
  };
  return (
    <div className="table-responsive">
      <Table className="table-custom table-centered table-nowrap table-hover mb-0">
        <thead>
          <tr>
            <th>Transaksi</th>
            <th>Waktu</th>
            <th>Kasir / pelanggan</th>
            <th>Bayar</th>
            <th className="text-center">Item</th>
            <th>Status</th>
            {!compact ? <th className="text-end">Laba</th> : null}
            <th className="text-end">Total</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => {
            const expanded = expandedSales.has(sale.id);
            return (
              <Fragment key={sale.id}>
                <tr>
                  <td>
                    <strong className="d-block">{sale.transaction_no}</strong>
                    {!compact ? (
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0 text-decoration-none"
                        onClick={() => toggleSale(sale.id)}
                        aria-expanded={expanded}
                      >
                        <Icon
                          icon={
                            expanded
                              ? "solar:alt-arrow-up-linear"
                              : "solar:alt-arrow-down-linear"
                          }
                          width={14}
                          className="me-1"
                        />
                        {expanded ? "Tutup barang" : "Lihat barang"}
                      </button>
                    ) : null}
                  </td>
                  <td>{dateTimeFormatter.format(new Date(sale.created_at))}</td>
                  <td>
                    <strong className="d-block">{sale.cashier_name}</strong>
                    <small className="text-muted">
                      {sale.member_name || "Pelanggan umum"}
                    </small>
                  </td>
                  <td>
                    {sale.payment_method
                      ? namaPembayaran[sale.payment_method] || sale.payment_method
                      : "—"}
                  </td>
                  <td className="text-center">{sale.item_count}</td>
                  <td>
                    <Badge
                      bg={
                        sale.status === "completed"
                          ? "success"
                          : sale.status === "held"
                            ? "warning"
                            : "danger"
                      }
                    >
                      {sale.status === "completed"
                        ? "Selesai"
                        : sale.status === "held"
                          ? "Hold"
                          : "Dibatalkan"}
                    </Badge>
                  </td>
                  {!compact ? (
                    <td className={`text-end fw-semibold ${sale.status === "completed" ? sale.gross_profit < 0 ? "text-danger" : "text-success" : "text-muted"}`}>
                      {sale.status === "completed" ? formatRupiah(sale.gross_profit) : "—"}
                    </td>
                  ) : null}
                  <td className="text-end">
                    <strong className="d-block">{formatRupiah(sale.total)}</strong>
                    {!compact && sale.discount > 0 ? (
                      <small className="text-muted">
                        Diskon {formatRupiah(sale.discount)}
                      </small>
                    ) : null}
                  </td>
                </tr>
                {!compact && expanded ? (
                  <tr className="sale-items-detail-row">
                    <td colSpan={8}>
                      <div className="sale-items-detail">
                        <Table size="sm" className="mb-0 align-middle">
                          <thead>
                            <tr>
                              <th>Barang</th>
                              <th className="text-end">Harga</th>
                              <th className="text-end">Qty</th>
                              <th className="text-end">Diskon</th>
                              <th className="text-end">Subtotal</th>
                              <th className="text-end">Laba</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sale.items.map((item) => (
                              <tr key={`${sale.id}-${item.product_id}`}>
                                <td>
                                  <strong className="d-block">
                                    {item.product_name}
                                  </strong>
                                  <small className="text-muted">{item.barcode}</small>
                                </td>
                                <td className="text-end">
                                  {formatRupiah(item.unit_price)}
                                </td>
                                <td className="text-end">{item.quantity}</td>
                                <td className="text-end">
                                  {formatRupiah(item.discount)}
                                </td>
                                <td className="text-end">
                                  {formatRupiah(item.subtotal)}
                                </td>
                                <td className={`text-end fw-semibold ${sale.status === "completed" ? item.gross_profit < 0 ? "text-danger" : "text-success" : "text-muted"}`}>
                                  {sale.status === "completed" ? formatRupiah(item.gross_profit) : "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
