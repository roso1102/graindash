interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ title = "Something went wrong", message, onRetry }: ErrorStateProps) {
  return (
    <div className="bg-danger/10 border border-danger/30 rounded-lg p-6 max-w-md mx-auto text-center">
      <div className="text-3xl mb-3">⚠️</div>
      <h3 className="text-base font-semibold text-danger mb-2">{title}</h3>
      <p className="text-sm text-text-secondary mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm bg-danger/20 text-danger rounded-md hover:bg-danger/30 transition-colors font-semibold"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
