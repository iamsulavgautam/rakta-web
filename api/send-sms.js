// /api/send-sms.js
export default async function handler(req, res) {
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

  const accountSid = "AC6262dc992fa3a49bca74716a53414e57";
  const authToken = "bcfc69b77567a13d757ba7c636b4a47f";
  const fromPhone = "+12342305400";

  const { to, message } = req.body;

  if (!to || !message) {
    return res
      .status(400)
      .json({ error: "Missing 'to' or 'message' in request body." });
  }

  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const form = new URLSearchParams();
  form.append("To", to.startsWith("+") ? to : `+${to}`);
  form.append("From", fromPhone);
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
}
