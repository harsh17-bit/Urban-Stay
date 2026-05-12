import React, { useEffect, useState } from 'react';

export default function MaintenanceList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/maintenance', {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Failed to load tickets');
        if (mounted) setTickets(json.tickets || []);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchTickets();
    return () => (mounted = false);
  }, []);

  if (loading) return <p aria-live="polite">Loading tickets…</p>;
  if (error) return <p role="alert">Error: {error}</p>;
  if (!tickets.length) return <p>No tickets found.</p>;

  return (
    <ul aria-live="polite">
      {tickets.map((t) => (
        <li key={t._id}>
          <h3>{t.title}</h3>
          <p>
            <strong>Property:</strong> {t.property?.title || t.property}
          </p>
          <p>
            <strong>Priority:</strong> {t.priority}
          </p>
          <p>
            <strong>Status:</strong> {t.status}
          </p>
          <p>
            <strong>Reported by:</strong> {t.reportedBy?.name || '—'}
          </p>
        </li>
      ))}
    </ul>
  );
}
