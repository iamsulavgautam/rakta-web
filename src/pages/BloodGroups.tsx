
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropletIcon } from 'lucide-react';

export default function BloodGroups() {
  const bloodGroups = [
    { 
      name: 'A+', 
      canDonateTo: ['A+', 'AB+'],
      canReceiveFrom: ['A+', 'A-', 'O+', 'O-']
    },
    { 
      name: 'A-', 
      canDonateTo: ['A+', 'A-', 'AB+', 'AB-'],
      canReceiveFrom: ['A-', 'O-']
    },
    { 
      name: 'B+', 
      canDonateTo: ['B+', 'AB+'],
      canReceiveFrom: ['B+', 'B-', 'O+', 'O-']
    },
    { 
      name: 'B-', 
      canDonateTo: ['B+', 'B-', 'AB+', 'AB-'],
      canReceiveFrom: ['B-', 'O-']
    },
    { 
      name: 'AB+', 
      canDonateTo: ['AB+'],
      canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    { 
      name: 'AB-', 
      canDonateTo: ['AB+', 'AB-'],
      canReceiveFrom: ['A-', 'B-', 'AB-', 'O-']
    },
    { 
      name: 'O+', 
      canDonateTo: ['A+', 'B+', 'AB+', 'O+'],
      canReceiveFrom: ['O+', 'O-']
    },
    { 
      name: 'O-', 
      canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      canReceiveFrom: ['O-']
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Blood Groups</h2>
          <p className="text-muted-foreground">
            Information about different blood groups and compatibility
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {bloodGroups.map(group => (
            <Card key={group.name}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold">{group.name}</CardTitle>
                  <DropletIcon className="h-8 w-8 text-rakta-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <CardDescription>Can donate to:</CardDescription>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {group.canDonateTo.map(recipient => (
                        <span 
                          key={recipient} 
                          className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-md bg-green-100 text-green-800"
                        >
                          {recipient}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <CardDescription>Can receive from:</CardDescription>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {group.canReceiveFrom.map(donor => (
                        <span 
                          key={donor} 
                          className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-md bg-rakta-100 text-rakta-800"
                        >
                          {donor}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Blood Group Compatibility Chart</CardTitle>
            <CardDescription>
              This chart shows which blood groups are compatible for donation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Group</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Can Donate To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Can Receive From</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bloodGroups.map(group => (
                    <tr key={group.name}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-rakta-600">{group.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {group.canDonateTo.join(', ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {group.canReceiveFrom.join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
