"use client";

// Asks before the delete action runs
export default function DeleteButton({ action }: { action: () => Promise<void> }) {
  return (
    <form action={action} onSubmit={(e) => { if (!confirm("Delete this post permanently? This cannot be undone.")) e.preventDefault(); }}>
      <button className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50">Delete this post</button>
    </form>
  );
}
