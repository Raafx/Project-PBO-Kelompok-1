"use client";

// Tampilan menu Ringkasan. Angka diterima dari HalamanAdmin sebagai props.
import { Icon } from "@iconify/react";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Badge, Button, Card, Col, Dropdown, ProgressBar, Row } from "react-bootstrap";
import type { AdminDashboard, AdminSale, PurchaseOrder, SalesReport } from "../api";
import { gambarProdukContoh } from "./gambarProdukContoh";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});
const angka = new Intl.NumberFormat("id-ID");
const pencetakRupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
const namaPembayaran: Record<string, string> = {
  cash: "Tunai",
  qris: "QRIS",
  edc: "EDC",
  debit: "Debit",
  credit: "Kredit",
  wallet: "E-Wallet",
  voucher: "Voucher",
};
const namaStatus: Record<PurchaseOrder["status"], string> = {
  draft: "Draft",
  ordered: "Dipesan",
  partially_received: "Diterima sebagian",
  received: "Selesai",
  cancelled: "Dibatalkan",
};
function formatRupiah(value: number) {
  return pencetakRupiah.format(value).replace(/\s/g, "");
}
function rupiahSingkat(value: number) {
  if (value === 0) return "Rp0";
  if (Math.abs(value) >= 1_000_000) {
    return `Rp${angka.format(Math.round(value / 1_000_000))} jt`;
  }
  return `Rp${angka.format(Math.round(value / 1_000))} rb`;
}
function jumlahBarangPesanan(order: PurchaseOrder) {
  return order.items.reduce((total, item) => total + item.quantity_ordered, 0);
}
function LabelStatusPesanan({ status }: { status: PurchaseOrder["status"] }) {
  const variants: Record<PurchaseOrder["status"], string> = {
    draft: "secondary",
    ordered: "info",
    partially_received: "warning",
    received: "success",
    cancelled: "danger",
  };
  return <Badge bg={variants[status]}>{namaStatus[status]}</Badge>;
}
function PesanKosong({
  icon,
  title,
  copy,
}: {
  icon: string;
  title: string;
  copy: string;
}) {
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

export default function RingkasanAdmin({
  dashboard,
  report,
  onOpenPurchasing,
  onOpenStock,
  onOpenSales,
  onOpenReports,
}: {
  dashboard: AdminDashboard;
  report: SalesReport;
  onOpenPurchasing: () => void;
  onOpenStock: () => void;
  onOpenSales: () => void;
  onOpenReports: () => void;
}) {
  const healthyStock = dashboard.product_count
    ? Math.max(
        0,
        ((dashboard.product_count - dashboard.low_stock_count) /
          dashboard.product_count) *
          100,
      )
    : 100;
  const salesStockShare = dashboard.stock_units
    ? (dashboard.sales_stock_units / dashboard.stock_units) * 100
    : 0;
  return (
    <>
      <Row className="row-cols-xxl-4 row-cols-md-2 row-cols-1">
        <Col>
          <KartuMetrik
            title="Total Transaksi"
            value={angka.format(report.transaction_count)}
            note="Dalam periode laporan"
            percentage={Math.min(100, Math.max(1, report.transaction_count))}
            color="#ff5b5b"
            radial
            onClick={onOpenSales}
          />
        </Col>
        <Col>
          <KartuMetrik
            title="Total Omzet"
            value={formatRupiah(report.total_sales)}
            note="Dalam periode laporan"
            percentage={Math.min(
              100,
              Math.max(1, report.total_sales / 1_000_000),
            )}
            variant="success"
            onClick={onOpenReports}
          />
        </Col>
        <Col>
          <KartuMetrik
            title="Item Terjual"
            value={angka.format(report.item_count)}
            note="Dalam periode laporan"
            percentage={Math.min(100, Math.max(1, report.item_count))}
            color="#f9c851"
            radial
            onClick={onOpenSales}
          />
        </Col>
        <Col>
          <KartuMetrik
            title="Stok Sehat"
            value={`${healthyStock.toFixed(1)}%`}
            note={`${dashboard.low_stock_count} produk perlu dicek`}
            percentage={healthyStock}
            variant="info"
            onClick={onOpenStock}
          />
        </Col>
      </Row>

      <Row>
        <Col xxl={6} xl={6}>
          <GrafikPembayaran report={report} />
        </Col>
        <Col xxl={6} xl={6}>
          <GrafikStatistik report={report} />
        </Col>
        <Col xxl={12} xl={12}>
          <KartuOmzet
            dashboard={dashboard}
            report={report}
            salesStockShare={salesStockShare}
          />
        </Col>
      </Row>

      <KartuPenjualan
        sales={report.recent_sales}
        onOpenSales={onOpenSales}
      />

      <Row>
        <Col xxl={6}>
          <KartuPembelian dashboard={dashboard} onOpen={onOpenPurchasing} />
        </Col>
        <Col xxl={6}>
          <KartuProdukTerlaris report={report} onOpen={onOpenReports} />
        </Col>
      </Row>
    </>
  );
}

function MenuKartu({ onClick }: { onClick?: () => void }) {
  return (
    <Dropdown align="end">
      <Dropdown.Toggle
        as="button"
        className="drop-arrow-none card-drop border-0 bg-transparent p-0"
        aria-label="Menu kartu"
      >
        <Icon icon="ri:more-2-fill" className="fs-18" />
      </Dropdown.Toggle>
      <Dropdown.Menu className="dropdown-menu-end">
        <Dropdown.Item onClick={onClick}>Lihat laporan</Dropdown.Item>
        <Dropdown.Item onClick={onClick}>Muat data</Dropdown.Item>
        <Dropdown.Item onClick={onClick}>Detail</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

function pilihanGrafikMetrik(percentage: number, color: string): ApexOptions {
  return {
    chart: {
      type: "radialBar",
      height: 81,
      width: 81,
      sparkline: { enabled: false },
    },
    series: [Math.max(0, Math.min(100, percentage))],
    plotOptions: {
      radialBar: {
        offsetY: 0,
        hollow: { margin: 0, size: "50%" },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: 5,
            fontSize: "14px",
            fontWeight: "600",
            formatter: (value) => `${Math.round(value)}%`,
          },
        },
      },
    },
    grid: { padding: { top: -18, bottom: -20, left: -20, right: -20 } },
    colors: [color, "#F6F7FB"],
  };
}

function KartuMetrik({
  title,
  value,
  note,
  percentage,
  color = "#188ae2",
  variant = "primary",
  radial = false,
  onClick,
}: {
  title: string;
  value: string;
  note: string;
  percentage: number;
  color?: string;
  variant?: string;
  radial?: boolean;
  onClick?: () => void;
}) {
  const options = pilihanGrafikMetrik(percentage, color);
  return (
    <Card>
      <div className="d-flex card-header justify-content-between align-items-center">
        <h4 className="header-title">{title}</h4>
        <MenuKartu onClick={onClick} />
      </div>
      <Card.Body className="pt-0">
        {radial ? (
          <div className="d-flex align-items-end gap-2 justify-content-between">
            <div className="text-end flex-shrink-0">
              <ReactApexChart
                height={81}
                width={81}
                options={options}
                series={options.series}
                type="radialBar"
              />
            </div>
            <div className="text-end">
              <h3 className="fw-semibold">{value}</h3>
              <p className="text-muted mb-0">{note}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="d-flex align-items-center gap-2 justify-content-between">
              <span className={`badge bg-${variant} rounded-pill fs-13`}>
                {percentage.toFixed(1)}% <Icon icon="tabler:trending-up" />
              </span>
              <div className="text-end">
                <h3 className="fw-semibold">{value}</h3>
                <p className="text-muted mb-0">{note}</p>
              </div>
            </div>
            <ProgressBar
              variant={variant}
              className="progress-soft progress-sm mt-3"
              now={Math.max(0, Math.min(100, percentage))}
            />
          </>
        )}
      </Card.Body>
    </Card>
  );
}

function GrafikPembayaran({ report }: { report: SalesReport }) {
  const methods = report.payment_methods.length
    ? report.payment_methods.slice(0, 4)
    : [{ label: "Belum ada", amount: 1, count: 0 }];
  const colors = ["#5b69bc", "#ff8acc", "#10c469", "#35b8e0"];
  const options: ApexOptions = {
    chart: { height: 281, type: "donut" },
    series: methods.map((item) => item.amount),
    labels: methods.map((item) => namaPembayaran[item.label] || item.label),
    colors,
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "14px",
      offsetY: 7,
    },
    stroke: { show: false },
  };
  return (
    <Card>
      <Card.Header className="border-bottom border-dashed">
        <h4 className="header-title">Statistik Pembayaran</h4>
      </Card.Header>
      <Card.Body className="pt-2">
        <div dir="ltr">
          <ReactApexChart
            height={281}
            options={options}
            className="apex-charts"
            series={options.series}
            type="donut"
          />
          <Row className="mt-3">
            {methods.map((item, index) => (
              <Col xs={6} key={item.label}>
                <div className="d-flex justify-content-between align-items-center p-1">
                  <div>
                    <Icon
                      icon="ri:circle-fill"
                      className="fs-12 align-middle me-1"
                      style={{ color: colors[index] }}
                    />
                    <span className="align-middle fw-semibold">
                      {namaPembayaran[item.label] || item.label}
                    </span>
                  </div>
                  <span className="fw-semibold text-muted float-end">
                    {item.count}
                  </span>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </Card.Body>
    </Card>
  );
}

function GrafikStatistik({ report }: { report: SalesReport }) {
  const dates = report.daily_sales.map((item) =>
    new Date(`${item.date}T00:00:00`).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    }),
  );
  const options: ApexOptions = {
    series: [
      {
        name: "Omzet",
        type: "bar",
        data: report.daily_sales.map((item) => item.total_sales),
      },
    ],
    chart: {
      height: 320,
      type: "bar",
      toolbar: { show: false },
      fontFamily: "Public Sans, sans-serif",
      foreColor: "#475467",
    },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    plotOptions: {
      bar: {
        columnWidth: dates.length > 20 ? "58%" : "48%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },
    grid: {
      borderColor: "#d7dee8",
      strokeDashArray: 3,
      padding: { left: 10, right: 12, bottom: 4 },
    },
    xaxis: {
      categories: dates,
      tickAmount: Math.min(7, Math.max(1, dates.length - 1)),
      axisBorder: { show: true, color: "#98a2b3" },
      axisTicks: { show: true, color: "#98a2b3" },
      labels: {
        rotate: 0,
        hideOverlappingLabels: true,
        trim: false,
        style: {
          colors: "#475467",
          fontSize: "11px",
          fontWeight: 500,
        },
      },
    },
    yaxis: {
      min: 0,
      tickAmount: 5,
      forceNiceScale: true,
      labels: {
        minWidth: 58,
        maxWidth: 64,
        formatter: rupiahSingkat,
        style: {
          colors: "#475467",
          fontSize: "11px",
          fontWeight: 500,
        },
      },
    },
    fill: { opacity: 1 },
    colors: ["#0969da"],
    tooltip: {
      theme: "light",
      y: { title: { formatter: () => "Omzet: " }, formatter: formatRupiah },
    },
  };
  return (
    <Card className="overview-statistics-card">
      <div className="d-flex card-header justify-content-between align-items-center border-bottom border-dashed">
        <h4 className="header-title">Statistik</h4>
        <MenuKartu />
      </div>
      <Card.Body className="p-0 pt-1">
        <div
          dir="ltr"
          className="px-2 pt-2"
          role="img"
          aria-label={`Grafik omzet harian untuk ${dates.length} hari`}
        >
          <ReactApexChart
            height={320}
            options={options}
            className="apex-charts"
            series={options.series}
            type="bar"
          />
        </div>
        <div className="border-top border-dashed mt-2">
          <Row className="text-center align-items-center g-0">
            <Col md={4} xs={6}>
              <p className="statistics-label mt-3 mb-1">Omzet</p>
              <h4 className="statistics-value mb-3">
                <span className="text-success me-1">
                  <Icon icon="ri:arrow-left-down-box-line" />
                </span>
                {formatRupiah(report.total_sales)}
              </h4>
            </Col>
            <Col
              md={4}
              xs={6}
              className="border-start border-end border-dashed"
            >
              <p className="statistics-label mt-3 mb-1">Diskon</p>
              <h4 className="statistics-value mb-3">
                <span className="text-danger me-1">
                  <Icon icon="ri:arrow-left-up-box-line" />
                </span>
                {formatRupiah(report.total_discount)}
              </h4>
            </Col>
            <Col md={4}>
              <p className="statistics-label mt-3 mb-1">Laba Kotor</p>
              <h4 className="statistics-value mb-3">
                <span className="text-success me-1">
                  <Icon icon="ri:arrow-left-down-box-line" />
                </span>
                {formatRupiah(report.estimated_gross_profit)}
              </h4>
            </Col>
          </Row>
        </div>
      </Card.Body>
    </Card>
  );
}

function KartuOmzet({
  dashboard,
  report,
  salesStockShare,
}: {
  dashboard: AdminDashboard;
  report: SalesReport;
  salesStockShare: number;
}) {
  const grossRatio = report.total_sales
    ? report.estimated_gross_profit / report.total_sales
    : 0;
  const options: ApexOptions = {
    series: [
      {
        name: "Omzet",
        data: report.daily_sales.map((item) => item.total_sales),
      },
      {
        name: "Estimasi laba",
        data: report.daily_sales.map((item) => item.total_sales * grossRatio),
      },
    ],
    stroke: { width: 3, curve: "straight" },
    chart: {
      height: 299,
      type: "line",
      zoom: { enabled: false },
      toolbar: { show: false },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: report.daily_sales.map((item) =>
        new Date(`${item.date}T00:00:00`).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
        }),
      ),
    },
    yaxis: {
      labels: { formatter: (value) => `${Math.round(value / 1000)} rb` },
    },
    colors: ["#10c469", "#35b8e0"],
    tooltip: { shared: true, y: { formatter: (value) => formatRupiah(value) } },
  };
  return (
    <Card>
      <div className="d-flex card-header justify-content-between align-items-center border-bottom border-dashed">
        <h4 className="header-title">Total Pendapatan</h4>
        <MenuKartu />
      </div>
      <Card.Body className="p-0 pt-1">
        <div dir="ltr" className="px-2">
          <ReactApexChart
            height={301}
            options={options}
            className="apex-charts"
            series={options.series}
            type="line"
          />
        </div>
        <div className="border-top border-dashed mt-2">
          <Row className="text-center align-items-center g-0">
            <Col md={4} xs={12}>
              <p className="text-muted mt-3 mb-1">Stok di Kasir</p>
              <h4 className="mb-3">{salesStockShare.toFixed(1)}%</h4>
            </Col>
            <Col
              md={4}
              xs={6}
              className="border-start border-end border-dashed"
            >
              <p className="text-muted mt-3 mb-1">Belanja Bulan Ini</p>
              <h4 className="mb-3">
                <span className="text-danger me-1">
                  <Icon icon="ri:arrow-left-up-box-line" />
                </span>
                {formatRupiah(dashboard.purchase_spend_this_month)}
              </h4>
            </Col>
            <Col md={4}>
              <p className="text-muted mt-3 mb-1">Nilai Persediaan</p>
              <h4 className="mb-3">
                <span className="text-success me-1">
                  <Icon icon="ri:arrow-left-down-box-line" />
                </span>
                {formatRupiah(dashboard.inventory_value)}
              </h4>
            </Col>
          </Row>
        </div>
      </Card.Body>
    </Card>
  );
}

function KartuPenjualan({
  sales,
  onOpenSales,
}: {
  sales: AdminSale[];
  onOpenSales: () => void;
}) {
  const avatars = [
    "/adminto/users/avatar-7.jpg",
    "/adminto/users/avatar-4.jpg",
    "/adminto/users/avatar-5.jpg",
    "/adminto/users/avatar-6.jpg",
    "/adminto/users/avatar-3.jpg",
  ];
  return (
    <Row className="row-cols-xxl-5 row-cols-md-2 row-cols-1">
      {sales.slice(0, 5).map((sale, index) => (
        <Col key={sale.id}>
          <Card>
            <Card.Body className="d-flex align-items-center gap-2">
              <Image
                src={avatars[index]}
                width={72}
                height={72}
                alt={sale.cashier_name}
                className="me-1 avatar-xl img-thumbnail rounded-circle"
              />
              <div>
                <h5>{sale.cashier_name}</h5>
                <p className="text-muted">
                  {sale.member_name || "Pelanggan umum"}
                </p>
                <p className="m-0 fs-14">
                  {sale.item_count} item{" "}
                  <button
                    type="button"
                    className="btn btn-link link-reset fw-medium p-0"
                    onClick={onOpenSales}
                  >
                    <Icon icon="tabler:arrow-right" />
                  </button>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

function KartuPembelian({
  dashboard,
  onOpen,
}: {
  dashboard: AdminDashboard;
  onOpen: () => void;
}) {
  const orders = dashboard.recent_purchase_orders.slice(0, 5);
  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h4 className="header-title">Pembelian Terbaru</h4>
        <Button variant="light" size="sm" onClick={onOpen}>
          Tambah Pembelian <Icon icon="tabler:plus" className="ms-1" />
        </Button>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="bg-light bg-opacity-50 py-1 text-center">
          <p className="m-0">
            <b>{dashboard.open_purchase_order_count}</b> pembelian aktif dari{" "}
            <span className="fw-medium">{orders.length}</span> data terbaru
          </p>
        </div>
        <div className="table-responsive">
          <table className="table table-custom table-centered table-sm table-nowrap table-hover mb-0">
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="avatar-md flex-shrink-0 me-2">
                        <span className="avatar-title bg-primary-subtle rounded-circle">
                          <Icon
                            icon="solar:delivery-bold-duotone"
                            className="fs-22 text-primary"
                          />
                        </span>
                      </div>
                      <div>
                        <span className="text-muted fs-12">
                          {order.supplier.code}
                        </span>
                        <br />
                        <h5 className="fs-14 mt-1">{order.supplier.name}</h5>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="text-muted fs-12">Nomor</span>
                    <h5 className="fs-14 mt-1 fw-normal">{order.po_number}</h5>
                  </td>
                  <td>
                    <span className="text-muted fs-12">Produk</span>
                    <h5 className="fs-14 mt-1 fw-normal">
                      {jumlahBarangPesanan(order)} unit
                    </h5>
                  </td>
                  <td>
                    <span className="text-muted fs-12">Total</span>
                    <h5 className="fs-14 mt-1 fw-normal">
                      {formatRupiah(order.subtotal)}
                    </h5>
                  </td>
                  <td>
                    <span className="text-muted fs-12">Status</span>
                    <h5 className="fs-14 mt-1 fw-normal">
                      <LabelStatusPesanan status={order.status} />
                    </h5>
                  </td>
                  <td style={{ width: 30 }}>
                    <MenuKartu onClick={onOpen} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!orders.length ? (
          <PesanKosong
            icon="solar:clipboard-list-bold-duotone"
            title="Belum ada pembelian"
            copy="Catat pembelian pertama dari menu Pembelian."
          />
        ) : null}
      </Card.Body>
      <Card.Footer>
        <div className="align-items-center justify-content-between row text-center text-sm-start">
          <div className="col-sm">
            <div className="text-muted">
              Menampilkan <span className="fw-semibold">{orders.length}</span>{" "}
              pembelian terbaru
            </div>
          </div>
          <Col sm="auto" className="mt-3 mt-sm-0">
            <Button variant="link" size="sm" onClick={onOpen}>
              Lihat semua <Icon icon="tabler:chevron-right" />
            </Button>
          </Col>
        </div>
      </Card.Footer>
    </Card>
  );
}

function KartuProdukTerlaris({
  report,
  onOpen,
}: {
  report: SalesReport;
  onOpen: () => void;
}) {
  const products = report.top_products.slice(0, 5);
  return (
    <Card className="card-h-100">
      <Card.Header className="d-flex flex-wrap align-items-center gap-2 border-bottom border-dashed">
        <h4 className="header-title me-auto">Produk Terlaris</h4>
        <Button variant="light" size="sm" onClick={onOpen}>
          Laporan <Icon icon="tabler:download" className="ms-1" />
        </Button>
        <Button variant="primary" size="sm" onClick={onOpen}>
          Detail <Icon icon="tabler:file-export" className="ms-1" />
        </Button>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="table-responsive">
          <table className="table table-custom align-middle table-nowrap table-hover mb-0">
            <tbody>
              {products.map((product, index) => (
                <tr key={product.barcode}>
                  <td>
                    <div className="avatar-lg">
                      <Image
                        src={
                          gambarProdukContoh[
                            index % gambarProdukContoh.length
                          ]
                        }
                        width={64}
                        height={64}
                        alt={product.name}
                        className="img-fluid rounded-2"
                      />
                    </div>
                  </td>
                  <td className="ps-0">
                    <h5 className="fs-14 my-1">{product.name}</h5>
                    <span className="text-muted fs-12">{product.barcode}</span>
                  </td>
                  <td>
                    <h5 className="fs-14 my-1">
                      {formatRupiah(
                        product.quantity
                          ? product.revenue / product.quantity
                          : 0,
                      )}
                    </h5>
                    <span className="text-muted fs-12">Harga rata-rata</span>
                  </td>
                  <td>
                    <h5 className="fs-14 my-1">{product.quantity}</h5>
                    <span className="text-muted fs-12">Jumlah</span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center justify-content-end">
                      <div className="me-2">
                        <h5 className="fs-14 my-1">
                          {formatRupiah(product.revenue)}
                        </h5>
                        <span className="text-muted fs-12">Omzet</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!products.length ? (
          <PesanKosong
            icon="solar:cup-star-bold-duotone"
            title="Belum ada produk terjual"
            copy="Produk terlaris akan muncul setelah ada transaksi."
          />
        ) : null}
      </Card.Body>
      <Card.Footer>
        <div className="align-items-center justify-content-between row text-center text-sm-start">
          <div className="col-sm">
            <div className="text-muted">
              Menampilkan <span className="fw-semibold">{products.length}</span>{" "}
              produk teratas
            </div>
          </div>
          <Col sm="auto" className="mt-3 mt-sm-0">
            <ul className="pagination pagination-boxed pagination-sm mb-0 justify-content-center">
              <li className="page-item disabled">
                <span className="page-link">
                  <Icon icon="tabler:chevron-left" />
                </span>
              </li>
              <li className="page-item active">
                <span className="page-link">1</span>
              </li>
              <li className="page-item disabled">
                <span className="page-link">
                  <Icon icon="tabler:chevron-right" />
                </span>
              </li>
            </ul>
          </Col>
        </div>
      </Card.Footer>
    </Card>
  );
}
