import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Calendar, DropletIcon, Plus, UserCheck, UserX, Upload } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import BulkDonationUpload from "@/components/donations/BulkDonationUpload";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { fetchDonorsWithLastDonation, createDonation } from "@/services/donationService";
import { fetchDonors } from "@/services/donorService";
import { Donor, DonationForm } from "@/types";

interface DonorWithDonationInfo extends Donor {
  last_donation_date: string | null;
  is_eligible: boolean;
  total_donations: number;
}

export default function DonatedIndividuals() {
  const [donors, setDonors] = useState<DonorWithDonationInfo[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<DonorWithDonationInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "eligible" | "ineligible">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [donationForm, setDonationForm] = useState<DonationForm>({
    donor_id: "",
    donation_date: "",
    location: "",
    notes: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadDonors();
  }, []);

  useEffect(() => {
    filterDonors();
  }, [donors, searchTerm, filterStatus]);

  const loadDonors = async () => {
    try {
      setIsLoading(true);
      const data = await fetchDonorsWithLastDonation();
      setDonors(data);
    } catch (error) {
      console.error("Error loading donors:", error);
      toast({
        title: "Error",
        description: "Failed to load donors with donation history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterDonors = () => {
    let filtered = donors;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (donor) =>
          donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          donor.phone.includes(searchTerm) ||
          donor.blood_group.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by eligibility status
    if (filterStatus === "eligible") {
      filtered = filtered.filter((donor) => donor.is_eligible);
    } else if (filterStatus === "ineligible") {
      filtered = filtered.filter((donor) => !donor.is_eligible);
    }

    setFilteredDonors(filtered);
  };

  const handleAddDonation = (donor: Donor) => {
    setSelectedDonor(donor);
    setDonationForm({
      donor_id: donor.id,
      donation_date: new Date().toISOString().split('T')[0],
      location: "",
      notes: "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmitDonation = async () => {
    try {
      await createDonation(donationForm);
      toast({
        title: "Success",
        description: "Donation record created successfully",
      });
      setIsDialogOpen(false);
      loadDonors(); // Reload to update the data
    } catch (error) {
      console.error("Error creating donation:", error);
      toast({
        title: "Error",
        description: "Failed to create donation record",
        variant: "destructive",
      });
    }
  };

  const getEligibilityBadge = (isEligible: boolean, lastDonationDate: string | null) => {
    if (!lastDonationDate) {
      return <Badge variant="secondary">Never Donated</Badge>;
    }
    
    if (isEligible) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Eligible</Badge>;
    } else {
      return <Badge variant="destructive" className="bg-red-100 text-red-800">Not Eligible</Badge>;
    }
  };

  const formatLastDonation = (date: string | null) => {
    if (!date) return "Never";
    return format(new Date(date), "MMM dd, yyyy");
  };

  const getRowClassName = (isEligible: boolean, hasNeverDonated: boolean) => {
    if (hasNeverDonated) return "";
    if (!isEligible) return "opacity-60 bg-gray-50";
    return "";
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rakta-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading donated individuals...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const eligibleCount = donors.filter(d => d.is_eligible).length;
  const ineligibleCount = donors.filter(d => !d.is_eligible).length;
  const neverDonatedCount = donors.filter(d => !d.last_donation_date).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Donated Individuals</h2>
            <p className="text-muted-foreground">
              Manage and track blood donation records
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowBulkUpload(!showBulkUpload)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Button>
          </div>
        </div>

        {/* Bulk Upload Section */}
        {showBulkUpload && (
          <BulkDonationUpload />
        )}

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
              <DropletIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{donors.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eligible Donors</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{eligibleCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Not Eligible</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{ineligibleCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Never Donated</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{neverDonatedCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Donor List</CardTitle>
            <CardDescription>
              View all donors with their donation history and eligibility status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search by name, phone, or blood group..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={(value: "all" | "eligible" | "ineligible") => setFilterStatus(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Donors</SelectItem>
                  <SelectItem value="eligible">Eligible Only</SelectItem>
                  <SelectItem value="ineligible">Not Eligible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Blood Group</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Last Donation</TableHead>
                    <TableHead>Total Donations</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDonors.map((donor) => (
                    <TableRow 
                      key={donor.id} 
                      className={getRowClassName(donor.is_eligible, !donor.last_donation_date)}
                    >
                      <TableCell className="font-medium">{donor.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{donor.blood_group}</Badge>
                      </TableCell>
                      <TableCell>{donor.phone}</TableCell>
                      <TableCell>{formatLastDonation(donor.last_donation_date)}</TableCell>
                      <TableCell>{donor.total_donations}</TableCell>
                      <TableCell>
                        {getEligibilityBadge(donor.is_eligible, donor.last_donation_date)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleAddDonation(donor)}
                          disabled={!donor.is_eligible && !!donor.last_donation_date}
                          variant={donor.is_eligible || !donor.last_donation_date ? "default" : "secondary"}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Donation
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Add Donation Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Donation Record</DialogTitle>
              <DialogDescription>
                {selectedDonor && `Record a new blood donation for ${selectedDonor.name}`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="donation_date" className="text-right">
                  Date
                </Label>
                <Input
                  id="donation_date"
                  type="date"
                  value={donationForm.donation_date}
                  onChange={(e) => setDonationForm({ ...donationForm, donation_date: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Input
                  id="location"
                  value={donationForm.location}
                  onChange={(e) => setDonationForm({ ...donationForm, location: e.target.value })}
                  placeholder="Blood bank or hospital name"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={donationForm.notes}
                  onChange={(e) => setDonationForm({ ...donationForm, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSubmitDonation}>
                Save Donation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
