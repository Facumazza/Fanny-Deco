export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <p className="text-ink mb-4">Algo salió mal. Intentá de nuevo en un momento.</p>
      <button
        type="button"
        onClick={onRetry}
        className="bg-brown-dark text-white px-5 py-2 rounded-sm hover:bg-brown"
      >
        Reintentar
      </button>
    </div>
  );
}
