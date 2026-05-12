import React, { useState } from 'react';

// Minimal, accessible Maintenance ticket form
export default function MaintenanceForm({
  propertyId = '',
  onCreated = () => {},
}) {
  const [property, setProperty] = useState(propertyId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!property || !title) {
      setError('Property and title are required');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          propertyId: property,
          title,
          description,
          priority,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create ticket');
      onCreated(json.ticket);
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-labelledby="maintenance-form-title">
      <h2 id="maintenance-form-title">Report a Maintenance Issue</h2>

      <div>
        <label htmlFor="property">Property ID</label>
        <input
          id="property"
          value={property}
          onChange={(e) => setProperty(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="priority">Priority</label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {error && (
        <div role="alert" aria-live="assertive" style={{ color: 'red' }}>
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} aria-busy={loading}>
        {loading ? 'Reporting…' : 'Report Issue'}
      </button>
    </form>
  );
}
