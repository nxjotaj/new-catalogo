"use client";

import { ErrorDiagnostic } from "@/components/ErrorDiagnostic";
import "./globals.css";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ErrorDiagnostic error={error} retry={unstable_retry} area="aplicacao" />
      </body>
    </html>
  );
}
