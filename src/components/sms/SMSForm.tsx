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
import { Textarea } from "@/components/ui/textarea";

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
    if (recipientCount === 0) {
      toast({
        title: "No Recipients",
        description: "Please select filters that include at least one donor.",
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
      const result = await sendSMSToFilteredDonors(filters, generatedMessage);

      if (result.success) {
        toast({
          title: "SMS Sent Successfully",
          description: `${result.count} messages have been sent to donors.`,
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
          Auto-generated message for {recipientCount} donor
          {recipientCount !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          value={generatedMessage}
          disabled
          className="min-h-[120px] bg-gray-100 cursor-not-allowed"
          placeholder="Select Blood Group, Province, District and Municipality first."
        />
        <p className="text-right text-xs mt-2">
          {generatedMessage.length}/160 characters
        </p>
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          className="bg-rakta-600 hover:bg-rakta-700"
          disabled={isLoading || recipientCount === 0 || !isReadyToSend}
          onClick={onSubmit}
        >
          {isLoading
            ? "Sending..."
            : `Send to ${recipientCount} Recipient${
                recipientCount !== 1 ? "s" : ""
              }`}
        </Button>
      </CardFooter>
    </Card>
  );
}
