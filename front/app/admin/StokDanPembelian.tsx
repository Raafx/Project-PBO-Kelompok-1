"use client";

// Tampilan menu Pembelian, Persediaan, dan Supplier di admin.
// Aksi tambah/koreksi dilakukan oleh HalamanAdmin; file ini menampilkan datanya.
import { Icon } from "@iconify/react";
import { Badge, Button, Card, Col, Form, InputGroup, Row, Table } from "react-bootstrap";
import type { PurchaseOrder, StockItem, Supplier } from "../api";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
const tanggal = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const namaStatus: Record<PurchaseOrder["status"], string> = {
  draft: "Draft",
  ordered: "Dipesan",
  partially_received: "Diterima sebagian",
  received: "Selesai",
  cancelled: "Dibatalkan",
};
function formatRupiah(value: number) {
  return rupiah.format(value).replace(/\s/g, "");
}
function formatTanggal(value: string | null) {
  return value ? tanggal.format(new Date(`${value}T00:00:00`)) : "Belum ditentukan";
}
function jumlahBarangPesanan(order: PurchaseOrder) {
  return order.items.reduce((total, item) => total + item.quantity_ordered, 0);
}
function LabelStatusPesanan({ status }: { status: PurchaseOrder["status"] }) {
  const warna: Record<PurchaseOrder["status"], string> = {
    draft: "secondary",
    ordered: "info",
    partially_received: "warning",
    received: "success",
    cancelled: "danger",
  };
  return <Badge bg={warna[status]}>{namaStatus[status]}</Badge>;
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

export function DaftarPembelian({
  orders,
  onCreateOrder,
}: {
  orders: PurchaseOrder[];
  onCreateOrder: () => void;
}) {
  return (
    <Card>
      <Card.Header className="d-flex align-items-center justify-content-between gap-3">
        <div>
          <h4 className="mb-1">Riwayat pembelian</h4>
          <p className="text-muted mb-0">
            Pembelian yang dicatat langsung menambah stok gudang.
          </p>
        </div>
        <Button onClick={onCreateOrder}>
          <Icon icon="solar:add-circle-linear" width={17} className="me-1" />
          Catat pembelian
        </Button>
      </Card.Header>
      {orders.length ? (
        <div className="table-responsive">
          <Table className="table-custom table-centered table-nowrap table-hover mb-0">
            <thead>
              <tr>
                <th>Nomor pembelian</th>
                <th>Supplier</th>
                <th>Barang masuk</th>
                <th>Tanggal beli</th>
                <th>Status</th>
                <th className="text-end">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong className="d-block">{order.po_number}</strong>
                    <small className="text-muted">
                      {tanggal.format(new Date(order.created_at))}
                    </small>
                  </td>
                  <td>
                    <strong className="d-block">{order.supplier.name}</strong>
                    <small className="text-muted">{order.supplier.code}</small>
                  </td>
                  <td>
                    <strong className="d-block">
                      {jumlahBarangPesanan(order)} unit
                    </strong>
                    <small className="text-muted">
                      {order.items.length} macam produk
                    </small>
                  </td>
                  <td>{formatTanggal(order.expected_date)}</td>
                  <td>
                    <LabelStatusPesanan status={order.status} />
                  </td>
                  <td className="text-end">
                    <strong>{formatRupiah(order.subtotal)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ) : (
        <Card.Body>
          <PesanKosong
            icon="solar:cart-large-2-bold-duotone"
            title="Belum ada pembelian"
            copy="Gunakan tombol Catat pembelian untuk merekam barang masuk gudang."
          />
        </Card.Body>
      )}
    </Card>
  );
}

export function PersediaanStok({
  stock,
  search,
  onSearch,
  onAdjust,
  onTransfer,
  onCreateOrder,
}: {
  stock: StockItem[];
  search: string;
  onSearch: (value: string) => void;
  onAdjust: (product?: StockItem) => void;
  onTransfer: (product?: StockItem) => void;
  onCreateOrder?: () => void;
}) {
  return (
    <Card>
      <Card.Header className="d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div>
          <h4 className="mb-1">Persediaan produk</h4>
          <p className="text-muted mb-0">
            Saldo gudang dan stok yang tersedia untuk transaksi kasir.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <InputGroup>
            <InputGroup.Text>
              <Icon icon="solar:magnifer-linear" width={17} />
            </InputGroup.Text>
            <Form.Control
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Cari produk atau barcode"
            />
          </InputGroup>
          <Button variant="outline-secondary" onClick={() => onTransfer()}>
            <Icon
              icon="solar:transfer-horizontal-linear"
              width={17}
              className="me-1"
            />
            Transfer
          </Button>
          <Button variant="outline-secondary" onClick={() => onAdjust()}>
            <Icon
              icon="solar:settings-minimalistic-linear"
              width={17}
              className="me-1"
            />
            Koreksi
          </Button>
          {onCreateOrder ? (
            <Button onClick={onCreateOrder}>
              <Icon
                icon="solar:box-minimalistic-linear"
                width={17}
                className="me-1"
              />
              Beli stok
            </Button>
          ) : null}
        </div>
      </Card.Header>
      <div className="table-responsive">
        <Table className="table-custom table-centered table-nowrap table-hover mb-0">
          <thead>
            <tr>
              <th>Produk</th>
              <th className="text-end">Harga pokok</th>
              <th className="text-end">Harga jual</th>
              <th className="text-center">Gudang</th>
              <th className="text-center">Kasir</th>
              <th className="text-center">Total</th>
              <th>Status kasir</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {stock.map((product) => (
              <tr key={product.id}>
                <td>
                  <strong className="d-block">{product.name}</strong>
                  <small className="text-muted">
                    {product.barcode} · {product.category}
                  </small>
                </td>
                <td className="text-end">{formatRupiah(product.cost_price)}</td>
                <td className="text-end">
                  <strong>{formatRupiah(product.price)}</strong>
                </td>
                <td className="text-center">{product.warehouse_stock}</td>
                <td className="text-center">
                  <strong
                    className={
                      product.stock_status !== "healthy" ? "text-danger" : ""
                    }
                  >
                    {product.sales_stock}
                  </strong>
                </td>
                <td className="text-center">
                  <strong>{product.total_stock}</strong>
                </td>
                <td>
                  <Badge
                    bg={
                      product.stock_status === "healthy"
                        ? "success"
                        : product.stock_status === "low"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {product.stock_status === "healthy"
                      ? "Aman"
                      : product.stock_status === "low"
                        ? "Menipis"
                        : "Habis"}
                  </Badge>
                </td>
                <td>
                  <Button
                    variant="soft-primary"
                    size="sm"
                    className="me-1"
                    onClick={() => onTransfer(product)}
                    title="Transfer"
                  >
                    <Icon icon="solar:transfer-horizontal-linear" width={16} />
                  </Button>
                  <Button
                    variant="soft-secondary"
                    size="sm"
                    onClick={() => onAdjust(product)}
                    title="Sesuaikan"
                  >
                    <Icon
                      icon="solar:settings-minimalistic-linear"
                      width={16}
                    />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      {!stock.length ? (
        <Card.Body>
          <PesanKosong
            icon="solar:magnifer-linear"
            title="Produk tidak ditemukan"
            copy="Coba kata kunci atau barcode yang berbeda."
          />
        </Card.Body>
      ) : null}
    </Card>
  );
}

export function DaftarPemasok({
  suppliers,
  onAdd,
}: {
  suppliers: Supplier[];
  onAdd: () => void;
}) {
  return (
    <>
      <Card className="mb-3">
        <Card.Body className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <span className="avatar-lg rounded bg-primary-subtle text-primary d-flex align-items-center justify-content-center">
              <Icon icon="solar:delivery-bold-duotone" width={30} />
            </span>
            <div>
              <h4 className="mb-1">Mitra pemasok MYMARKET</h4>
              <p className="text-muted mb-0">
                Simpan identitas dan kontak supplier untuk pencatatan pembelian
                stok.
              </p>
            </div>
          </div>
          <Button onClick={onAdd}>
            <Icon icon="solar:add-circle-linear" width={17} className="me-1" />
            Tambah supplier
          </Button>
        </Card.Body>
      </Card>
      <Row className="g-3">
        {suppliers.map((supplier) => (
          <Col xl={4} md={6} key={supplier.id}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <span className="avatar-lg rounded bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold">
                    {supplier.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <Badge bg="light" text="dark">
                      {supplier.code}
                    </Badge>
                    <h5 className="mt-1 mb-0">{supplier.name}</h5>
                  </div>
                </div>
                <dl className="mb-0">
                  <dt className="text-muted fw-normal">
                    <Icon
                      icon="solar:user-rounded-linear"
                      width={16}
                      className="me-1"
                    />
                    Kontak
                  </dt>
                  <dd>{supplier.contact_person || "Belum diisi"}</dd>
                  <dt className="text-muted fw-normal">
                    <Icon
                      icon="solar:phone-linear"
                      width={16}
                      className="me-1"
                    />
                    Telepon
                  </dt>
                  <dd>{supplier.phone || "Belum diisi"}</dd>
                  <dt className="text-muted fw-normal">
                    <Icon
                      icon="solar:letter-linear"
                      width={16}
                      className="me-1"
                    />
                    Email
                  </dt>
                  <dd>{supplier.email || "Belum diisi"}</dd>
                  {supplier.address ? (
                    <>
                      <dt className="text-muted fw-normal">
                        <Icon
                          icon="solar:map-point-linear"
                          width={16}
                          className="me-1"
                        />
                        Alamat
                      </dt>
                      <dd>{supplier.address}</dd>
                    </>
                  ) : null}
                </dl>
              </Card.Body>
              <Card.Footer className="d-flex justify-content-between">
                <Badge bg="success">Aktif</Badge>
                <small className="text-muted">
                  Ditambahkan{" "}
                  {tanggal.format(new Date(supplier.created_at))}
                </small>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
      {!suppliers.length ? (
        <Card>
          <Card.Body>
            <PesanKosong
              icon="solar:buildings-2-bold-duotone"
              title="Belum ada supplier"
              copy="Gunakan tombol Tambah supplier di atas untuk mulai mencatat pemasok."
            />
          </Card.Body>
        </Card>
      ) : null}
    </>
  );
}
