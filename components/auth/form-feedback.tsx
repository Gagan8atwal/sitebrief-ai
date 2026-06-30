import { AlertCircle } from "lucide-react";

/** Inline validation messages for a single field. */
export function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;
  return (
    <p className="text-xs text-destructive" role="alert">
      {messages[0]}
    </p>
  );
}

/** Top-of-form error banner. */
export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      role="alert"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
