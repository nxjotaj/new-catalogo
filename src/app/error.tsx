"use client";

import { ErrorDiagnostic } from "@/components/ErrorDiagnostic";

export default function AppError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return <ErrorDiagnostic error={error} retry={unstable_retry} />;
}
