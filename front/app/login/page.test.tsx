import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LoginPage from "./page";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  loginAccount: vi.fn(),
  confirmTotpSetup: vi.fn(),
  verifyTotpLogin: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, replace: mocks.replace }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("../api", () => ({
  loginAccount: mocks.loginAccount,
  confirmTotpSetup: mocks.confirmTotpSetup,
  verifyTotpLogin: mocks.verifyTotpLogin,
  forgotPassword: mocks.forgotPassword,
  resetPassword: mocks.resetPassword,
}));

const profile = {
  employee_code: "ADMIN",
  full_name: "Administrator",
  role_name: "Administrator",
  permissions: ["admin.overview"],
};

describe("login admin dengan Authenticator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it("menampilkan QR pada login pertama lalu menyimpan sesi setelah kode benar", async () => {
    const user = userEvent.setup();
    mocks.loginAccount.mockResolvedValue({
      ...profile,
      status: "totp_setup_required",
      access_token: null,
      challenge_token: "challenge-setup-token-1234567890",
      provisioning_uri:
        "otpauth://totp/MYMARKET:admin%40gmail.com?secret=ABCDEFGHIJKLMNOP&issuer=MYMARKET",
      totp_secret: "ABCDEFGHIJKLMNOP",
      expires_at: "2026-10-08T15:00:00Z",
    });
    mocks.confirmTotpSetup.mockResolvedValue({
      ...profile,
      status: "authenticated",
      access_token: "authenticated-token",
      challenge_token: null,
      provisioning_uri: null,
      totp_secret: null,
      expires_at: "2026-10-09T02:00:00Z",
    });

    render(<LoginPage />);
    expect(screen.getByLabelText(/kode pegawai atau email/i)).toHaveValue(
      "admin@gmail.com",
    );
    await user.type(screen.getByLabelText(/^password$/i), "password");
    await user.click(screen.getByRole("button", { name: /lanjutkan/i }));

    expect(
      await screen.findByRole("heading", { name: /hubungkan authenticator/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/qr setup authenticator/i)).toBeInTheDocument();
    await user.type(screen.getByLabelText(/kode authenticator/i), "123456");
    await user.click(screen.getByRole("button", { name: /aktifkan & masuk/i }));

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/admin"));
    expect(window.localStorage.getItem("mymarket_token")).toBe(
      "authenticated-token",
    );
    expect(mocks.confirmTotpSetup).toHaveBeenCalledWith(
      "challenge-setup-token-1234567890",
      "123456",
    );
  });

  it("mengarahkan role kasir ke layar POS", async () => {
    const user = userEvent.setup();
    mocks.loginAccount.mockResolvedValue({
      status: "authenticated",
      access_token: "cashier-token",
      challenge_token: null,
      provisioning_uri: null,
      totp_secret: null,
      expires_at: "2026-10-09T02:00:00Z",
      employee_code: "CASH02",
      full_name: "Kasir Biasa",
      role_name: "Kasir",
      permissions: ["pos.access", "admin.sales"],
    });

    render(<LoginPage />);
    await user.type(screen.getByLabelText(/^password$/i), "password");
    await user.click(screen.getByRole("button", { name: /lanjutkan/i }));

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/pos"));
  });

  it("mengarahkan role gudang ke halaman admin terbatas", async () => {
    const user = userEvent.setup();
    mocks.loginAccount.mockResolvedValue({
      status: "authenticated",
      access_token: "warehouse-token",
      challenge_token: null,
      provisioning_uri: null,
      totp_secret: null,
      expires_at: "2026-10-09T02:00:00Z",
      employee_code: "GUDANG",
      full_name: "Staf Gudang MYMARKET",
      role_name: "Staf Gudang",
      permissions: ["admin.overview", "admin.stock", "admin.purchasing"],
    });

    render(<LoginPage />);
    await user.type(screen.getByLabelText(/^password$/i), "password");
    await user.click(screen.getByRole("button", { name: /lanjutkan/i }));

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/admin"));
  });
});
