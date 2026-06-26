function Notice({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div>
      <p
        className={`text-xs bg-yellow-300/15 px-3 py-2 rounded-lg border border-yellow-200 ${className}`}
      >
        {message}
      </p>
    </div>
  );
}

export default Notice;
