import { describe, expect, it } from "vitest";

import {
  canAccessArea,
  defaultPathForPermissions,
  resolvePostLoginPath,
} from "./access";

describe("role-based access routing", () => {
  it("mengarahkan pemilik atau manajer ke admin", () => {
    expect(defaultPathForPermissions(["pos.access", "admin.overview"])).toBe(
      "/admin",
    );
  });

  it("mengarahkan kasir ke POS", () => {
    expect(defaultPathForPermissions(["pos.access", "admin.sales"])).toBe(
      "/pos",
    );
  });

  it("menolak tujuan next yang tidak sesuai permission", () => {
    const permissions = ["pos.access", "admin.sales"];

    expect(resolvePostLoginPath(permissions, "/admin")).toBe("/pos");
    expect(canAccessArea(permissions, "admin")).toBe(false);
  });

  it("mempertahankan tujuan next yang memang diizinkan", () => {
    const permissions = ["admin.overview", "admin.ceo_chat"];

    expect(resolvePostLoginPath(permissions, "/ceo-chat?from=admin")).toBe(
      "/ceo-chat?from=admin",
    );
  });
});
