"use client";

// Menu Hak Akses: pilih izin untuk role dan hubungkan role dengan petugas.
import { Icon } from "@iconify/react";
import { useState } from "react";
import { Badge, Button, Card, Col, Form, Row, Spinner, Table } from "react-bootstrap";
import PilihanCari from "../PilihanCari";
import type { AccessRole, StaffMember } from "../api";

const namaIzin: Record<string, string> = {
  "pos.access": "Kasir POS",
  "pos.supervise": "Persetujuan void POS",
  "admin.overview": "Ringkasan",
  "admin.sales": "Penjualan",
  "admin.reports": "Laporan",
  "admin.stock": "Persediaan",
  "admin.purchasing": "Pembelian",
  "admin.suppliers": "Supplier",
  "admin.roles": "Role & akses",
  "admin.ceo_chat": "CEO Copilot",
  "admin.products": "Master produk",
  "admin.live_transactions": "Transaksi live",
  "admin.operations": "Kasir, shift & pelanggan",
  "admin.finance": "Keuangan",
  "admin.settings": "Pengaturan",
};

export default function PengaturanAkses({
  roles,
  staff,
  working,
  onSaveRole,
  onAssignRole,
}: {
  roles: AccessRole[];
  staff: StaffMember[];
  working: boolean;
  onSaveRole: (role: AccessRole, permissions: string[]) => void;
  onAssignRole: (staffId: string, roleId: string) => void;
}) {
  return (
    <>
      <Card className="mb-3">
        <Card.Header>
          <h4 className="mb-1">Role dan akses halaman</h4>
          <p className="text-muted mb-0">
            Atur halaman yang dapat dibuka oleh setiap role.
          </p>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            {roles.map((role) => (
              <Col
                xl={4}
                md={6}
                key={`${role.id}:${role.permissions.join(",")}`}
              >
                <KartuPeran role={role} working={working} onSave={onSaveRole} />
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
      <Card>
        <Card.Header>
          <h4 className="mb-1">Role petugas</h4>
          <p className="text-muted mb-0">
            Hubungkan setiap petugas dengan satu role operasional.
          </p>
        </Card.Header>
        <div className="table-responsive">
          <Table className="table-custom table-centered table-nowrap table-hover mb-0">
            <thead>
              <tr>
                <th>Petugas</th>
                <th>Kode</th>
                <th>Status</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.id}>
                  <td>
                    <strong>{member.full_name}</strong>
                  </td>
                  <td>{member.employee_code}</td>
                  <td>
                    <Badge bg={member.is_active ? "success" : "danger"}>
                      {member.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </td>
                  <td>
                    <PilihanCari
                      value={member.role_id || ""}
                      disabled={working}
                      onChange={(event) =>
                        onAssignRole(member.id, event.target.value)
                      }
                    >
                      <option value="" disabled>
                        Pilih role
                      </option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </PilihanCari>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
    </>
  );
}

function KartuPeran({
  role,
  working,
  onSave,
}: {
  role: AccessRole;
  working: boolean;
  onSave: (role: AccessRole, permissions: string[]) => void;
}) {
  // Centang izin disimpan sementara di kartu; database berubah setelah klik Simpan.
  const [pilihanIzin, aturPilihanIzin] = useState(role.permissions);
  const terkunci = role.code === "OWNER";
  function ubahPilihanIzin(permission: string) {
    aturPilihanIzin((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission],
    );
  }
  return (
    <Card className="h-100 border">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <span className="avatar-sm rounded bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold">
            {role.code.slice(0, 2)}
          </span>
          <div>
            <h5 className="mb-0">{role.name}</h5>
            <small className="text-muted">{role.code}</small>
          </div>
        </div>
        {terkunci ? <Badge bg="primary">Role utama</Badge> : null}
      </Card.Header>
      <Card.Body>
        {Object.entries(namaIzin).map(([permission, label]) => (
          <Form.Check
            className="mb-2"
            key={permission}
            type="checkbox"
            label={label}
            checked={pilihanIzin.includes(permission)}
            disabled={terkunci || working}
            onChange={() => ubahPilihanIzin(permission)}
          />
        ))}
      </Card.Body>
      <Card.Footer className="d-flex align-items-center justify-content-between">
        <span className="text-muted">{pilihanIzin.length} akses aktif</span>
        <Button
          variant="outline-primary"
          size="sm"
          disabled={terkunci || working || pilihanIzin.length === 0}
          onClick={() => onSave(role, pilihanIzin)}
        >
          {working ? (
            <Spinner size="sm" className="me-1" />
          ) : (
            <Icon icon="solar:diskette-linear" width={16} className="me-1" />
          )}
          Simpan
        </Button>
      </Card.Footer>
    </Card>
  );
}
