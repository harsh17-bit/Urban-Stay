import React from 'react';
import MaintenanceForm from '../components/MaintenanceForm';
import MaintenanceList from '../components/MaintenanceList';

export default function MaintenancePage() {
  return (
    <div className="container" style={{ padding: '1rem' }}>
      <h1>Maintenance</h1>
      <p>Report issues and track maintenance tickets for your properties.</p>

      <section aria-labelledby="report-maintenance">
        <h2 id="report-maintenance">Report an Issue</h2>
        <MaintenanceForm />
      </section>

      <section aria-labelledby="tickets" style={{ marginTop: '2rem' }}>
        <h2 id="tickets">Tickets</h2>
        <MaintenanceList />
      </section>
    </div>
  );
}
