// /api/send-sms.js
module.exports = async function handler(req, res) {
  // ✅ CORS support
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // for preflight requests
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Get Twilio credentials from environment variables
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone = process.env.TWILIO_PHONE_NUMBER;
  const serviceSid = process.env.TWILIO_SERVICE_SID;

  // Validate that all required environment variables are present
  if (!accountSid || !authToken || (!fromPhone && !serviceSid)) {
    console.error(
      "Twilio configuration is incomplete. Please check your environment variables"
    );
    return res.status(500).json({
      success: false,
      error:
        "Twilio configuration is incomplete. Please check your environment variables",
    });
  }

  const { to, message } = req.body;

  if (!to || !message) {
    return res
      .status(400)
      .json({ error: "Missing 'to' or 'message' in request body." });
  }

  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const form = new URLSearchParams();
  form.append("To", to.startsWith("+") ? to : `+${to}`);
  if (serviceSid) {
    form.append("MessagingServiceSid", serviceSid);
  } else {
    form.append("From", fromPhone);
  }
  form.append("Body", message);

  try {
    const response = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });

    const data = await response.json();

    if (data.sid) {
      return res.status(200).json({ success: true, sid: data.sid });
    } else {
      return res
        .status(400)
        .json({ success: false, error: data.message || "Unknown error" });
    }
  } catch (err) {
    console.error("Twilio Error:", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to send SMS" });
  }
};
