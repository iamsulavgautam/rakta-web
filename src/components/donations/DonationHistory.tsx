import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Calendar, MapPin, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { fetchDonationsByDonor } from "@/services/donationService";
import { Donation } from "@/types";

interface DonationHistoryProps {
  donorId: string;
  donorName: string;
}

export default function DonationHistory({ donorId, donorName }: DonationHistoryProps) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDonations();
  }, [donorId]);

  const loadDonations = async () => {
    try {
      setIsLoading(true);
      const data = await fetchDonationsByDonor(donorId);
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

  const getEligibilityStatus = (donationDate: string) => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const donationDateTime = new Date(donationDate);
    const isEligible = donationDateTime < threeMonthsAgo;
    
    return isEligible ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Eligible
      </Badge>
    ) : (
      <Badge variant="destructive" className="bg-red-100 text-red-800">
        Not Eligible
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Donation History</CardTitle>
          <CardDescription>Loading donation records...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rakta-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Donation History</CardTitle>
        <CardDescription>
          {donorName}'s blood donation records ({donations.length} total donations)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {donations.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No donation records found</p>
            <p className="text-sm text-muted-foreground mt-1">
              This donor has never donated blood before
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {format(new Date(donation.donation_date), "MMM dd, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      {donation.location ? (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                          {donation.location}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not specified</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {donation.notes ? (
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="truncate max-w-xs" title={donation.notes}>
                            {donation.notes}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No notes</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getEligibilityStatus(donation.donation_date)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
