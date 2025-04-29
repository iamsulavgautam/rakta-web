import React from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Donor } from "@/types";
import { format } from "date-fns";
import { Edit, MoreHorizontal, Trash } from "lucide-react";

interface DonorsListProps {
  donors: Donor[];
  isLoading?: boolean;
  onDeleteDonor?: (donorId: string) => void;
}

export default function DonorsList({
  donors,
  isLoading = false,
  onDeleteDonor,
}: DonorsListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Blood Group</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Province</TableHead>
            <TableHead>District</TableHead>
            <TableHead>Municipality</TableHead>
            <TableHead>Date Added</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center h-32">
                Loading donors...
              </TableCell>
            </TableRow>
          ) : !donors || donors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center h-32">
                No donors found. Add a new donor to get started.
              </TableCell>
            </TableRow>
          ) : (
            donors.map((donor) => (
              <TableRow key={donor.id}>
                <TableCell className="font-medium">
                  {donor?.name || "—"}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-md bg-rakta-100 text-rakta-800">
                    {donor?.blood_group || "-"}
                  </span>
                </TableCell>
                <TableCell>{donor?.phone || "-"}</TableCell>
                <TableCell>{donor?.province || "-"}</TableCell>
                <TableCell>{donor?.district || "-"}</TableCell>
                <TableCell>{donor?.municipality || "-"}</TableCell>
                <TableCell>
                  {donor?.created_at
                    ? format(new Date(donor.created_at), "MMM d, yyyy")
                    : "—"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/donors/${donor.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      {onDeleteDonor && (
                        <DropdownMenuItem
                          onClick={() => onDeleteDonor(donor.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
