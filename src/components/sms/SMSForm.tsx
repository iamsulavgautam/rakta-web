import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { DonorFilters } from "@/types";
import { sendSMSToFilteredDonors } from "@/services/smsService";
import { fetchDonorsWithLastDonation } from "@/services/donationService";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SMSFormProps {
  filters: DonorFilters;
  recipientCount: number;
  onSendSuccess?: (count: number) => void;
}

const adminInfo = {
  orgName: "Rakta Organization",
  phone: "+9779761780429",
};

export default function SMSForm({
  filters,
  recipientCount,
  onSendSuccess,
}: SMSFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [onlyEligible, setOnlyEligible] = useState(true);
  const [eligibleCount, setEligibleCount] = useState(0);
  const { toast } = useToast();
  const [generatedMessage, setGeneratedMessage] = useState("");

  const isReadyToSend =
    filters.blood_group &&
    filters.blood_group !== "all" &&
    filters.province &&
    filters.province !== "all" &&
    filters.district &&
    filters.district !== "all" &&
    filters.municipality &&
    filters.municipality !== "all";

  useEffect(() => {
    // Calculate eligible donors count when filters change
    const calculateEligibleCount = async () => {
      if (!isReadyToSend) {
        setEligibleCount(0);
        return;
      }

      try {
        const donorsWithEligibility = await fetchDonorsWithLastDonation();
        
        const eligibleDonors = donorsWithEligibility.filter((donor) => {
          // Apply filters
          if (filters.blood_group && filters.blood_group !== "all" && donor.blood_group !== filters.blood_group) {
            return false;
          }
          if (filters.province && filters.province !== "all" && donor.province !== filters.province) {
            return false;
          }
          if (filters.district && filters.district !== "all" && donor.district !== filters.district) {
            return false;
          }
          if (filters.municipality && filters.municipality !== "all" && donor.municipality !== filters.municipality) {
            return false;
          }
          
          return donor.is_eligible;
        });
        
        setEligibleCount(eligibleDonors.length);
      } catch (error) {
        console.error("Error calculating eligible count:", error);
        setEligibleCount(0);
      }
    };

    calculateEligibleCount();

    if (!isReadyToSend) {
      setGeneratedMessage("");
      return;
    }

    const bloodGroup = filters.blood_group;
    const location = `${filters.municipality}, ${filters.district}, ${filters.province}`;

    const message = `[${adminInfo.orgName}]
Urgent Requirement: ${bloodGroup} blood needed at ${location}.
Please contact us at ${adminInfo.phone}.`;

    setGeneratedMessage(message);
  }, [filters, isReadyToSend]);

  const onSubmit = async () => {
    const currentRecipientCount = onlyEligible ? eligibleCount : recipientCount;
    
    if (currentRecipientCount === 0) {
      toast({
        title: "No Recipients",
        description: `Please select filters that include at least one ${onlyEligible ? 'eligible ' : ''}donor.`,
        variant: "destructive",
      });
      return;
    }

    if (!isReadyToSend) {
      toast({
        title: "Incomplete Filter",
        description:
          "Please select Blood Group, Province, District and Municipality before sending.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendSMSToFilteredDonors(filters, generatedMessage, onlyEligible);

      if (result.success) {
        toast({
          title: "SMS Sent Successfully",
          description: `${result.count} messages have been sent to ${onlyEligible ? 'eligible ' : ''}donors.`,
        });
        if (onSendSuccess) onSendSuccess(result.count);
      } else {
        toast({
          title: "SMS Sending Failed",
          description:
            result.errors?.map((e) => e.error).join(", ") || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending SMS:", error);
      toast({
        title: "SMS Sending Failed",
        description: (error as Error).message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send SMS</CardTitle>
        <CardDescription>
          Auto-generated message for {onlyEligible ? eligibleCount : recipientCount} {onlyEligible ? 'eligible ' : ''}donor
          {(onlyEligible ? eligibleCount : recipientCount) !== 1 ? "s" : ""}
          {onlyEligible && eligibleCount !== recipientCount && (
            <span className="text-orange-600 ml-2">
              ({recipientCount - eligibleCount} not eligible filtered out)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Eligibility Filter Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="only-eligible"
              checked={onlyEligible}
              onCheckedChange={setOnlyEligible}
            />
            <Label htmlFor="only-eligible" className="text-sm">
              Send only to eligible donors (donated more than 3 months ago)
            </Label>
          </div>
          
          {/* Recipient Count Info */}
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
            <div className="flex justify-between">
              <span>Total matching donors:</span>
              <span className="font-medium">{recipientCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Eligible donors:</span>
              <span className="font-medium text-green-600">{eligibleCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Will send to:</span>
              <span className="font-bold text-blue-600">
                {onlyEligible ? eligibleCount : recipientCount}
              </span>
            </div>
          </div>

          <Textarea
            value={generatedMessage}
            disabled
            className="min-h-[120px] bg-gray-100 cursor-not-allowed"
            placeholder="Select Blood Group, Province, District and Municipality first."
          />
          <p className="text-right text-xs mt-2">
            {generatedMessage.length}/160 characters
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          className="bg-rakta-600 hover:bg-rakta-700"
          disabled={isLoading || (onlyEligible ? eligibleCount : recipientCount) === 0 || !isReadyToSend}
          onClick={onSubmit}
        >
          {isLoading
            ? "Sending..."
            : `Send to ${onlyEligible ? eligibleCount : recipientCount} ${onlyEligible ? 'Eligible ' : ''}Recipient${
                (onlyEligible ? eligibleCount : recipientCount) !== 1 ? "s" : ""
              }`}
        </Button>
      </CardFooter>
    </Card>
  );
}
