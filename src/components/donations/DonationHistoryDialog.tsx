import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { fetchDonationsByDonor, deleteDonation } from "@/services/donationService";
import { Donation, Donor } from "@/types";

interface DonationHistoryDialogProps {
  donor: Donor | null;
  isOpen: boolean;
  onClose: () => void;
  onDonationDeleted: () => void;
}

export default function DonationHistoryDialog({
  donor,
  isOpen,
  onClose,
  onDonationDeleted,
}: DonationHistoryDialogProps) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && donor) {
      loadDonations();
    }
  }, [isOpen, donor]);

  const loadDonations = async () => {
    if (!donor) return;
    
    try {
      setIsLoading(true);
      const data = await fetchDonationsByDonor(donor.id);
      setDonations(data);
    } catch (error) {
      console.error("Error loading donations:", error);
      toast({
        title: "Error",
        description: "Failed to load donation history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDonation = async (donationId: string) => {
    try {
      setDeletingId(donationId);
      await deleteDonation(donationId);
      
      toast({
        title: "Success",
        description: "Donation record deleted successfully",
      });
      
      // Remove from local state
      setDonations(prev => prev.filter(d => d.id !== donationId));
      
      // Notify parent to refresh data
      onDonationDeleted();
    } catch (error) {
      console.error("Error deleting donation:", error);
      toast({
        title: "Error",
        description: "Failed to delete donation record",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getTimeSinceLastDonation = (donationDate: string) => {
    const date = new Date(donationDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  };

  const isEligibleFromDate = (donationDate: string) => {
    const date = new Date(donationDate);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const threeMonthsInMs = 3 * 30 * 24 * 60 * 60 * 1000;
    return diffTime > threeMonthsInMs;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Donation History - {donor?.name}
          </DialogTitle>
          <DialogDescription>
            View and manage all donation records for this donor
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Donor Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Blood Group:</span>
                <div className="text-lg font-bold text-red-600">{donor?.blood_group}</div>
              </div>
              <div>
                <span className="font-medium">Phone:</span>
                <div>{donor?.phone}</div>
              </div>
              <div>
                <span className="font-medium">Location:</span>
                <div>{donor?.municipality}, {donor?.district}</div>
              </div>
              <div>
                <span className="font-medium">Total Donations:</span>
                <div className="text-lg font-bold text-blue-600">{donations.length}</div>
              </div>
            </div>
          </div>

          {/* Donations Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : donations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <EyeOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No donation records found for this donor</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time Since</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Eligibility</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell className="font-medium">
                        {format(new Date(donation.donation_date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {getTimeSinceLastDonation(donation.donation_date)}
                      </TableCell>
                      <TableCell>{donation.location || "Not specified"}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {donation.notes || "No notes"}
                      </TableCell>
                      <TableCell>
                        {isEligibleFromDate(donation.donation_date) ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Eligible since this donation
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="bg-red-100 text-red-800">
                            Too recent
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                              disabled={deletingId === donation.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Donation Record</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this donation record from{" "}
                                {format(new Date(donation.donation_date), "MMM dd, yyyy")}?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteDonation(donation.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
