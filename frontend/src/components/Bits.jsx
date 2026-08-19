export function StatusStamp({ status }) {
  const map = {
    DELIVERED: 'green',
    SUCCESS: 'green',
    SHIPPED: 'green',
    PROCESSING: 'amber',
    PENDING: 'amber',
    CANCELLED: 'red',
    FAILED: 'red',
    REFUNDED: 'red'
  };
  const variant = map[status] || 'amber';
  return <span className={`stamp stamp--${variant}`}>{status}</span>;
}

export function Stars({ rating }) {
  if (rating === null || rating === undefined) {
    return <span className="loading">No ratings yet</span>;
  }
  const full = Math.round(rating);
  return (
    <span className="stars" aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
      <span className="mono" style={{ color: 'var(--ink-soft)', fontSize: 12, marginLeft: 6 }}>
        {rating.toFixed ? rating.toFixed(2) : rating}
      </span>
    </span>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return <div className="error-banner">⚠ {message}</div>;
}

export function Loading({ label = 'Loading…' }) {
  return <p className="loading">{label}</p>;
}
