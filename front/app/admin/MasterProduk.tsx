"use client";

// Tabel Master Produk. Data dan aksi dikirim oleh HalamanAdmin sebagai props.
// Komponen ini hanya menggambar daftar, pencarian, dan tombol aksi.
import { Icon } from "@iconify/react";
import Image from "next/image";
import { Badge, Button, Card, Col, Form, InputGroup, Row, Table } from "react-bootstrap";
import PilihanCari from "../PilihanCari";
import type { MasterProduct } from "../api";

const angka = new Intl.NumberFormat("id-ID");
const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function formatRupiah(value: number) {
  return rupiah.format(value).replace(/\s/g, "");
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

export default function MasterProduk({
  products,
  search,
  status,
  working,
  onSearch,
  onStatus,
  onAdd,
  onEdit,
  onDeactivate,
  onExport,
}: {
  products: MasterProduct[];
  search: string;
  status: string;
  working: boolean;
  onSearch: (value: string) => void;
  onStatus: (value: string) => void;
  onAdd: () => void;
  onEdit: (product: MasterProduct) => void;
  onDeactivate: (product: MasterProduct) => void;
  onExport: () => void;
}) {
  return (
    <Card className="card-h-100">
      <Card.Header className="d-flex flex-wrap align-items-center gap-2 border-bottom border-dashed">
        <div className="me-auto">
          <h4 className="header-title mb-1">Master Produk</h4>
          <p className="text-muted mb-0">
            Kelola identitas, foto, harga, lokasi, dan status produk.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Button variant="light" size="sm" onClick={onExport}>
            Ekspor <Icon icon="tabler:file-export" className="ms-1" />
          </Button>
          <Button size="sm" onClick={onAdd}>
            <Icon icon="tabler:plus" className="me-1" />
            Tambah produk
          </Button>
        </div>
      </Card.Header>
      <Card.Body className="border-bottom">
        <Row className="g-2">
          <Col lg={8}>
            <InputGroup>
              <InputGroup.Text>
                <Icon icon="solar:magnifer-linear" width={17} />
              </InputGroup.Text>
              <Form.Control
                value={search}
                onChange={(event) => onSearch(event.target.value)}
                placeholder="Cari nama, SKU, barcode, atau kategori"
              />
            </InputGroup>
          </Col>
          <Col lg={4}>
            <PilihanCari
              value={status}
              onChange={(event) => onStatus(event.target.value)}
              aria-label="Filter status produk"
            >
              <option value="all">Semua status</option>
              <option value="active">Produk aktif</option>
              <option value="inactive">Produk nonaktif</option>
            </PilihanCari>
          </Col>
        </Row>
      </Card.Body>
      <Card.Body className="p-0">
        <div className="table-responsive">
          <Table className="table-custom align-middle table-nowrap table-hover mb-0">
            <thead>
              <tr>
                <th>Produk</th>
                <th>SKU / Barcode</th>
                <th>Harga</th>
                <th className="text-center">Stok</th>
                <th>Status</th>
                <th className="text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const totalStock = product.stock + product.warehouse_stock;
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="avatar-lg bg-light rounded-2 d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              width={64}
                              height={64}
                              className="img-fluid object-fit-contain"
                            />
                          ) : (
                            <Icon
                              icon="solar:box-minimalistic-bold-duotone"
                              width={30}
                              className="text-muted"
                            />
                          )}
                        </div>
                        <div>
                          <h5 className="fs-14 my-1">{product.name}</h5>
                          <span className="text-muted fs-12">
                            {product.category} · {product.location}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <h5 className="fs-14 my-1">
                        {product.sku || "Tanpa SKU"}
                      </h5>
                      <span className="text-muted fs-12">
                        {product.barcode}
                      </span>
                    </td>
                    <td>
                      <h5 className="fs-14 my-1">
                        {formatRupiah(product.price)}
                      </h5>
                      <span className="text-muted fs-12">
                        Modal {formatRupiah(product.cost_price)}
                      </span>
                    </td>
                    <td className="text-center">
                      <h5 className="fs-14 my-1">
                        {angka.format(totalStock)}
                      </h5>
                      <span className="text-muted fs-12">
                        Kasir {product.stock} · Gudang {product.warehouse_stock}
                      </span>
                    </td>
                    <td>
                      <Badge bg={product.is_active ? "success" : "secondary"}>
                        {product.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                      {totalStock <= product.reorder_level ? (
                        <Badge bg="warning" className="ms-1">
                          Stok rendah
                        </Badge>
                      ) : null}
                    </td>
                    <td className="text-end">
                      <Button
                        variant="soft-primary"
                        size="sm"
                        className="me-1"
                        onClick={() => onEdit(product)}
                        disabled={working}
                        title="Edit produk"
                      >
                        <Icon icon="solar:pen-new-square-linear" width={16} />
                      </Button>
                      {product.is_active ? (
                        <Button
                          variant="soft-danger"
                          size="sm"
                          onClick={() => onDeactivate(product)}
                          disabled={working}
                          title="Nonaktifkan produk"
                        >
                          <Icon
                            icon="solar:archive-down-minimlistic-linear"
                            width={16}
                          />
                        </Button>
                      ) : (
                        <Button
                          variant="soft-success"
                          size="sm"
                          onClick={() => onEdit(product)}
                          disabled={working}
                          title="Aktifkan lewat edit"
                        >
                          <Icon icon="solar:restart-bold" width={16} />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
        {!products.length ? (
          <div className="p-4">
            <PesanKosong
              icon="solar:box-minimalistic-bold-duotone"
              title="Produk tidak ditemukan"
              copy="Ubah pencarian atau tambahkan produk baru."
            />
          </div>
        ) : null}
      </Card.Body>
      <Card.Footer>
        <div className="align-items-center justify-content-between row text-center text-sm-start">
          <div className="col-sm">
            <div className="text-muted">
              Menampilkan <span className="fw-semibold">{products.length}</span>{" "}
              produk
            </div>
          </div>
          <Col sm="auto" className="mt-3 mt-sm-0">
            <ul className="pagination pagination-boxed pagination-sm mb-0 justify-content-center">
              <li className="page-item disabled">
                <button className="page-link" type="button">
                  <Icon icon="tabler:chevron-left" />
                </button>
              </li>
              <li className="page-item active">
                <button className="page-link" type="button">
                  1
                </button>
              </li>
              <li className="page-item disabled">
                <button className="page-link" type="button">
                  <Icon icon="tabler:chevron-right" />
                </button>
              </li>
            </ul>
          </Col>
        </div>
      </Card.Footer>
    </Card>
  );
}
