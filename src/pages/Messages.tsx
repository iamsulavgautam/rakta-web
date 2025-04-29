
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function Messages() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Messages</h2>
          <p className="text-muted-foreground">
            Message history feature is coming soon!
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
