type AdminFeedbackProps = {
  success?: string;
  error?: string;
};

export function AdminFeedback({ success, error }: AdminFeedbackProps) {
  if (!success && !error) return null;

  return (
    <div
      role="status"
      className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-bold ${
        error
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      {error || success}
    </div>
  );
}
