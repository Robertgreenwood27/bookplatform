'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4">
      <h2 className="text-xl">Something went wrong!</h2>
      <p className="text-gray-600">{error.message || 'An unexpected error occurred'}</p>
      {error.digest && (
        <p className="text-sm text-gray-500">Error ID: {error.digest}</p>
      )}
      <button
        onClick={() => reset()}
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Try again
      </button>
    </div>
  )
}