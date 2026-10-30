"use client";

// Asks before the delete action runs
export default function DeleteButton({ action, label = "Delete this post" }: { action: () => Promise<void>; label?: string }) {
  return (
    <form action={action} onSubmit={(e) => { if (!confirm("Delete this post permanently? This cannot be undone.")) e.preventDefault(); }}>
      <button className="inline-flex min-h-10 items-center rounded-lg border border-red-200 px-3 text-sm font-semibold text-red-600 hover:bg-red-50">{label}</button>
    </form>
  );
}
