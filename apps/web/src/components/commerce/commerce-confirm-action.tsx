"use client";

import { useState } from "react";
import { Button } from "@rtb/ui";

export function CommerceConfirmAction({
  label,
  confirmMessage,
  variant = "outline",
  size = "sm",
  disabled,
  onConfirm,
}: {
  label: string;
  confirmMessage: string;
  variant?: "default" | "outline" | "destructive";
  size?: "sm" | "default";
  disabled?: boolean;
  onConfirm: () => void | Promise<void>;
}) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    setPending(true);
    try {
      await onConfirm();
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || pending}
      onClick={handleClick}
    >
      {pending ? "Working…" : label}
    </Button>
  );
}
