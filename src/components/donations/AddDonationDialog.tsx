import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { createDonation } from "@/services/donationService";
import { DonationForm } from "@/types";

interface AddDonationDialogProps {
  donorId: string;
  donorName: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export default function AddDonationDialog({ 
  donorId, 
  donorName, 
  onSuccess,
  trigger 
}: AddDonationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [donationForm, setDonationForm] = useState<DonationForm>({
    donor_id: donorId,
    donation_date: new Date().toISOString().split('T')[0],
    location: "",
    notes: "",
  });
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await createDonation(donationForm);
      toast({
        title: "Success",
        description: "Donation record created successfully",
      });
      setIsOpen(false);
      if (onSuccess) {
        onSuccess();
      }
      // Reset form
      setDonationForm({
        donor_id: donorId,
        donation_date: new Date().toISOString().split('T')[0],
        location: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error creating donation:", error);
      toast({
        title: "Error",
        description: "Failed to create donation record",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Donation
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Donation Record</DialogTitle>
          <DialogDescription>
            Record a new blood donation for {donorName}
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
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Donation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
