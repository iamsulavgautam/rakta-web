import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DonorFilters from "@/components/donors/DonorFilters";
import DonorsList from "@/components/donors/DonorsList";
import CSVUpload from "@/components/donors/CSVUpload";
import SMSForm from "@/components/sms/SMSForm";
import { Donor, DonorFilters as DonorFiltersType, DonorForm } from "@/types";
import { fetchDonors, deleteDonor, createDonor } from "@/services/donorService";
import { Plus, Upload, Download } from "lucide-react"; // <-- Added Download icon
import { format } from "date-fns"; // <-- For date formatting

export default function Donors() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [filters, setFilters] = useState<DonorFiltersType>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [donorToDelete, setDonorToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadDonors = async () => {
      try {
        setIsLoading(true);
        const donorData = await fetchDonors(filters);

        if (!Array.isArray(donorData)) {
          throw new Error("Invalid donor data format.");
        }

        setDonors(donorData);
      } catch (error) {
        console.error("Error loading donors:", error);
        toast({
          title: "Error",
          description: "Failed to load donors.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDonors();
  }, [filters, toast]);

  const handleDeleteConfirm = async () => {
    if (!donorToDelete) return;

    try {
      await deleteDonor(donorToDelete);
      setDonors(donors.filter((d) => d.id !== donorToDelete));

      toast({
        title: "Donor Deleted",
        description: "Donor has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting donor:", error);
      toast({
        title: "Error",
        description: "Failed to delete donor.",
        variant: "destructive",
      });
    } finally {
      setDonorToDelete(null);
    }
  };

  const handleCSVUpload = async (donorsToImport: DonorForm[]) => {
    try {
      setIsLoading(true);
      const importedDonors: Donor[] = [];

      for (const donorData of donorsToImport) {
        const newDonor = await createDonor(donorData);
        importedDonors.push(newDonor);
      }

      setDonors((prev) => [...importedDonors, ...prev]);
      setShowCSVUpload(false);

      toast({
        title: "Import Successful",
        description: `${importedDonors.length} donors have been imported.`,
      });
    } catch (error) {
      console.error("Error importing donors:", error);
      toast({
        title: "Import Failed",
        description: (error as Error).message || "Failed to import donors.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (donors.length === 0) {
      toast({
        title: "No Data",
        description: "No donors to export.",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "name",
      "blood_group",
      "phone",
      "province",
      "district",
      "municipality",
    ];
    const rows = donors.map((donor) => [
      donor.name,
      donor.blood_group,
      donor.phone,
      donor.province,
      donor.district,
      donor.municipality,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((val) => `"${val}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `donors-${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Donors</h2>
            <p className="text-muted-foreground">
              Manage and contact blood donors.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowCSVUpload(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button asChild className="bg-rakta-600 hover:bg-rakta-700">
              <Link to="/donors/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Donor
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <DonorFilters onFilterChange={setFilters} isLoading={isLoading} />

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DonorsList
              donors={donors}
              isLoading={isLoading}
              onDeleteDonor={(id) => setDonorToDelete(id)}
            />
          </div>
          <div>
            <SMSForm
              filters={filters}
              recipientCount={donors.length}
              onSendSuccess={(count) => {
                toast({
                  title: "SMS Sent",
                  description: `${count} SMS messages were sent successfully.`,
                });
              }}
            />
          </div>
        </div>

        {/* CSV Upload Dialog */}
        <Dialog open={showCSVUpload} onOpenChange={setShowCSVUpload}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Import Donors from CSV</DialogTitle>
              <DialogDescription>
                Upload a CSV file with donor information to import in bulk.
              </DialogDescription>
            </DialogHeader>
            <CSVUpload onUpload={handleCSVUpload} isLoading={isLoading} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCSVUpload(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={!!donorToDelete}
          onOpenChange={() => setDonorToDelete(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this donor? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDonorToDelete(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
