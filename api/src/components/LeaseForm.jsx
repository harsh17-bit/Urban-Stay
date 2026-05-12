import React, { useState } from 'react';

// Minimal, accessible Lease creation form
// Props:
// - propertyId (optional) pre-filled property id
// - onCreated callback(lease) called after successful creation

export default function LeaseForm({ propertyId = '', onCreated = () => {} }) {
  const [property, setProperty] = useState(propertyId);
  const [tenantId, setTenantId] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!property || !rentAmount) {
      setError('Property and rent amount are required');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/leases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          propertyId: property,
          tenantId,
          rentAmount,
          startDate,
          endDate,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create lease');
      onCreated(json.lease);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-labelledby="lease-form-title">
      <h2 id="lease-form-title">Create Lease</h2>

      <div>
        <label htmlFor="property">Property ID</label>
        <input
          id="property"
          name="property"
          value={property}
          onChange={(e) => setProperty(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="tenantId">Tenant User ID (optional)</label>
        <input
          id="tenantId"
          name="tenantId"
          value={tenantId}
          onChange={(e) => setTenantId(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="rentAmount">Monthly Rent Amount</label>
        <input
          id="rentAmount"
          name="rentAmount"
          type="number"
          min="0"
          step="0.01"
          value={rentAmount}
          onChange={(e) => setRentAmount(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="startDate">Start Date</label>
        <input
          id="startDate"
          name="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="endDate">End Date</label>
        <input
          id="endDate"
          name="endDate"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {error && (
        <div role="alert" aria-live="assertive" style={{ color: 'red' }}>
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} aria-busy={loading}>
        {loading ? 'Creating…' : 'Create Lease'}
      </button>
    </form>
  );
}
