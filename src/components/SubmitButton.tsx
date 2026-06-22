"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingLabel = "Salvando...",
  className,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button disabled={pending} className={`${className} disabled:cursor-wait disabled:opacity-60`}>
      {pending ? pendingLabel : children}
    </button>
  );
}
