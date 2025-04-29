import { DonorFilters } from "@/types";
import { fetchDonors } from "./donorService";

// Twilio credentials
const TWILIO_SERVICE_SID = "VA1444f9308d2fe3f9a3834d4e2e67f372";
const TWILIO_ACCOUNT_SID = "AC6262dc992fa3a49bca74716a53414e57";
const TWILIO_AUTH_TOKEN = "bcfc69b77567a13d757ba7c636b4a47f";
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
        formData.append("From", "+1 234 230 5400"); // Replace with your Twilio phone number
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
  message: string
): Promise<SMSResponse> => {
  try {
    // Fetch donors based on filters
    const donors = await fetchDonors(filters);

    // Extract phone numbers
    const phoneNumbers = donors.map((donor) => donor.phone);

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
