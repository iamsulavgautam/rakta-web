import { DonorFilters } from "@/types";
import { fetchDonors } from "./donorService";
import { fetchDonorsWithLastDonation } from "./donationService";

// Twilio credentials from environment variables
const TWILIO_SERVICE_SID = import.meta.env.VITE_TWILIO_SERVICE_SID;
const TWILIO_ACCOUNT_SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = import.meta.env.VITE_TWILIO_PHONE_NUMBER;
const TWILIO_BASE_URL = "https://api.twilio.com/2010-04-01";

// In a real application, these credentials would be stored in environment variables
// and the API calls would be made from a secure server-side endpoint

export interface SMSResponse {
  success: boolean;
  count: number;
  errors?: any[];
}

export const sendSMS = async (
  phoneNumbers: string[],
  message: string
): Promise<SMSResponse> => {
  try {
    // Validate that all required environment variables are present
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.error("Missing Twilio environment variables");
      return {
        success: false,
        count: 0,
        errors: [{ error: "Twilio configuration is incomplete. Please check your environment variables." }],
      };
    }

    // In a real application, this would be handled server-side
    // This is a simplified version for demonstration purposes

    // Create a basic auth token
    const authToken = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    // Keep track of successful sends and errors
    let successCount = 0;
    const errors: any[] = [];

    // Send SMS to each phone number
    for (const phoneNumber of phoneNumbers) {
      try {
        const formData = new URLSearchParams();
        formData.append("To", phoneNumber);
        formData.append("From", TWILIO_PHONE_NUMBER); // Use environment variable
        formData.append("Body", message);

        const response = await fetch(
          `${TWILIO_BASE_URL}/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${authToken}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData,
          }
        );

        const data = await response.json();

        if (data.sid) {
          successCount++;
        } else {
          errors.push({
            phoneNumber,
            error: data.message || "Failed to send SMS",
          });
        }
      } catch (error) {
        errors.push({ phoneNumber, error: (error as Error).message });
      }
    }

    // In a real app, you would store the SMS count in the database
    // For demonstration, we'll just return the count

    return {
      success: errors.length === 0,
      count: successCount,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error("Error sending SMS:", error);
    return {
      success: false,
      count: 0,
      errors: [{ error: (error as Error).message }],
    };
  }
};

export const sendSMSToFilteredDonors = async (
  filters: DonorFilters,
  message: string,
  onlyEligible: boolean = true
): Promise<SMSResponse> => {
  try {
    let donors;
    
    if (onlyEligible) {
      // Fetch donors with eligibility information
      const donorsWithEligibility = await fetchDonorsWithLastDonation();
      
      // Filter by provided filters
      donors = donorsWithEligibility.filter((donor) => {
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
        
        // Only include eligible donors
        return donor.is_eligible;
      });
    } else {
      // Fetch donors based on filters without eligibility check
      donors = await fetchDonors(filters);
    }

    // Extract phone numbers
    const phoneNumbers = donors.map((donor) => donor.phone);

    console.log(`Sending SMS to ${phoneNumbers.length} ${onlyEligible ? 'eligible ' : ''}donors`);

    // Send SMS to all phone numbers
    return await sendSMS(phoneNumbers, message);
  } catch (error) {
    console.error("Error sending SMS to filtered donors:", error);
    return {
      success: false,
      count: 0,
      errors: [{ error: (error as Error).message }],
    };
  }
};
