import React, { useEffect, useState } from 'react';

// Minimal, accessible Lease list
export default function LeaseList() {
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchLeases = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/leases', {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Failed to load leases');
        if (mounted) setLeases(json.leases || []);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchLeases();
    return () => (mounted = false);
  }, []);

  if (loading) return <p aria-live="polite">Loading leases…</p>;
  if (error) return <p role="alert">Error: {error}</p>;

  if (!leases.length) return <p>No leases found.</p>;

  return (
    <ul aria-live="polite">
      {leases.map((l) => (
        <li key={l._id}>
          <h3>{l.property?.title || 'Property'}</h3>
          <p>
            <strong>Rent:</strong> {l.rentAmount}
          </p>
          <p>
            <strong>Status:</strong> {l.status}
          </p>
          <p>
            <strong>Period:</strong>{' '}
            {l.startDate ? new Date(l.startDate).toLocaleDateString() : '—'} -{' '}
            {l.endDate ? new Date(l.endDate).toLocaleDateString() : '—'}
          </p>
        </li>
      ))}
    </ul>
  );
}
