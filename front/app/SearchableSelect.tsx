"use client";

import {
  Children,
  Fragment,
  isValidElement,
  useId,
  useMemo,
  type ChangeEvent,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import ReactSelect, { type SingleValue } from "react-select";

type SearchableOption = {
  value: string;
  label: string;
  isDisabled: boolean;
};

type SearchableSelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "multiple" | "size"
> & {
  children: ReactNode;
};

function textContent(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) return node.map(textContent).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return textContent(node.props.children);
  }
  return "";
}

function optionsFromChildren(children: ReactNode): SearchableOption[] {
  const options: SearchableOption[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type === Fragment) {
      options.push(
        ...optionsFromChildren(
          (child.props as { children?: ReactNode }).children,
        ),
      );
      return;
    }
    if (child.type === "optgroup") {
      options.push(
        ...optionsFromChildren(
          (child.props as { children?: ReactNode }).children,
        ),
      );
      return;
    }
    if (child.type !== "option") return;

    const props = child.props as {
      value?: string | number;
      disabled?: boolean;
      children?: ReactNode;
    };
    const label = textContent(props.children).trim();
    options.push({
      value: props.value === undefined ? label : String(props.value),
      label,
      isDisabled: Boolean(props.disabled),
    });
  });

  return options;
}

export default function SearchableSelect({
  children,
  className = "",
  disabled,
  id,
  name,
  onChange,
  required,
  value,
  "aria-label": ariaLabel,
}: SearchableSelectProps) {
  const generatedId = useId();
  const portalTarget = typeof document === "undefined" ? undefined : document.body;
  const options = useMemo(() => optionsFromChildren(children), [children]);
  const selectedValue = value === undefined || value === null ? "" : String(value);
  const selected =
    options.find((option) => option.value === selectedValue) || null;

  function emitChange(option: SingleValue<SearchableOption>) {
    if (!onChange) return;
    const target = {
      name: name || "",
      value: option?.value || "",
    } as HTMLSelectElement;
    onChange({ target, currentTarget: target } as ChangeEvent<HTMLSelectElement>);
  }

  return (
    <ReactSelect<SearchableOption, false>
      instanceId={id || generatedId}
      inputId={id || generatedId}
      name={name}
      aria-label={ariaLabel}
      className={`mymarket-select2 ${className}`.trim()}
      classNamePrefix="mymarket-select2"
      options={options}
      value={selected}
      onChange={emitChange}
      isDisabled={disabled}
      isOptionDisabled={(option) => option.isDisabled}
      isSearchable
      required={required}
      unstyled
      menuPortalTarget={portalTarget}
      menuPosition={portalTarget ? "fixed" : "absolute"}
      noOptionsMessage={() => "Tidak ada pilihan"}
      loadingMessage={() => "Memuat pilihan..."}
      placeholder="Pilih atau cari..."
    />
  );
}
