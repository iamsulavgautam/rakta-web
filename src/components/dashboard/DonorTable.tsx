
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Donor } from '@/types';
import { format } from 'date-fns';

interface DonorTableProps {
  donors: Donor[];
  title: string;
}

export default function DonorTable({ donors, title }: DonorTableProps) {
  return (
    <div className="rounded-md border">
      <div className="py-3 px-4 bg-muted/30">
        <h3 className="font-medium">{title}</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Blood Group</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {donors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-32">
                No donors found
              </TableCell>
            </TableRow>
          ) : (
            donors.map((donor) => (
              <TableRow key={donor.id}>
                <TableCell className="font-medium">{donor.name}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-md bg-rakta-100 text-rakta-800">
                    {donor.blood_group}
                  </span>
                </TableCell>
                <TableCell>{donor.phone}</TableCell>
                <TableCell>{donor.municipality}, {donor.district}</TableCell>
                <TableCell>
                  {format(new Date(donor.created_at), 'MMM d, yyyy')}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
