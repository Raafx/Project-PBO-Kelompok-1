import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import PerangkatAuthenticator from "./PerangkatAuthenticator";

const mocks = vi.hoisted(() => ({
  load: vi.fn(),
  create: vi.fn(),
  confirm: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("../api", () => ({
  loadAuthenticatorDevices: mocks.load,
  createAuthenticatorDevice: mocks.create,
  confirmAuthenticatorDevice: mocks.confirm,
  deleteAuthenticatorDevice: mocks.remove,
}));

const activeDevice = {
  id: "device-main",
  name: "HP utama",
  is_active: true,
  created_at: "2026-10-28T10:00:00Z",
  enrolled_at: "2026-10-28T10:01:00Z",
  last_used_at: null,
};

describe("pengelolaan perangkat Authenticator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.load.mockResolvedValue([activeDevice]);
    mocks.create.mockResolvedValue({
      id: "device-office",
      name: "HP kantor",
      is_active: false,
      created_at: "2026-10-28T11:00:00Z",
      enrolled_at: null,
      last_used_at: null,
      provisioning_uri:
        "otpauth://totp/MYMARKET:admin?secret=ABCDEFGHIJKLMNOP&issuer=MYMARKET",
      totp_secret: "ABCDEFGHIJKLMNOP",
    });
    mocks.confirm.mockResolvedValue({
      ...activeDevice,
      id: "device-office",
      name: "HP kantor",
    });
  });

  it("mengesahkan penambahan, menampilkan QR, lalu mengaktifkan device", async () => {
    const user = userEvent.setup();
    render(<PerangkatAuthenticator />);

    await user.type(
      await screen.findByPlaceholderText(/nama perangkat/i),
      "HP kantor",
    );
    await user.type(screen.getByLabelText(/kode authenticator aktif/i), "654321");
    await user.click(screen.getByRole("button", { name: /tambah perangkat/i }));

    await waitFor(() =>
      expect(mocks.create).toHaveBeenCalledWith("HP kantor", "654321"),
    );
    expect(
      await screen.findByLabelText(/qr perangkat authenticator baru/i),
    ).toBeInTheDocument();

    await user.type(
      screen.getByLabelText(/kode perangkat authenticator baru/i),
      "123456",
    );
    await user.click(screen.getByRole("button", { name: /aktifkan perangkat/i }));

    await waitFor(() =>
      expect(mocks.confirm).toHaveBeenCalledWith("device-office", "123456"),
    );
  });

  it("tidak mengizinkan device aktif terakhir dicabut", async () => {
    render(<PerangkatAuthenticator />);

    const removeButton = await screen.findByTitle(/tambahkan perangkat aktif lain/i);
    expect(removeButton).toBeDisabled();
  });
});
