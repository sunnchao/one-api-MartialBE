'use client';

import React from 'react';
import Statistics from './components/Statistics';
import Overview from './components/Overview';

export default function AnalyticsPage() {
  return (
    <div style={{ padding: 0 }}>
      <Statistics />
      <Overview />
    </div>
  );
}
