import React from 'react';
import LeaseForm from '../components/LeaseForm';
import LeaseList from '../components/LeaseList';

export default function LeasePage() {
  return (
    <div className="container" style={{ padding: '1rem' }}>
      <h1>Leases</h1>
      <p>Manage leases for your properties or view leases you are part of.</p>

      <section aria-labelledby="create-lease">
        <h2 id="create-lease">Create Lease</h2>
        <LeaseForm />
      </section>

      <section aria-labelledby="your-leases" style={{ marginTop: '2rem' }}>
        <h2 id="your-leases">Your Leases</h2>
        <LeaseList />
      </section>
    </div>
  );
}
