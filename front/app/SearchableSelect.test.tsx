import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import SearchableSelect from "./SearchableSelect";

describe("SearchableSelect", () => {
  it("mencari opsi dan meneruskan value seperti select biasa", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <SearchableSelect
        aria-label="Produk"
        value=""
        onChange={onChange}
      >
        <option value="">Pilih produk</option>
        <option value="apel">Jus Apel Premium</option>
        <option value="jeruk">Jeruk Mandarin Segar</option>
      </SearchableSelect>,
    );

    const combobox = screen.getByRole("combobox", { name: "Produk" });
    await user.click(combobox);
    await user.type(combobox, "apel");

    expect(screen.queryByText("Jeruk Mandarin Segar")).not.toBeInTheDocument();
    await user.click(screen.getByText("Jus Apel Premium"));

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0][0].target.value).toBe("apel");
  });
});
