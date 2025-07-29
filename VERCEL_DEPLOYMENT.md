# Vercel Deployment Guide

## Environment Variables Setup

After fixing the runtime issue, you need to add your environment variables to Vercel:

### 1. Add Environment Variables in Vercel Dashboard

Go to your Vercel project dashboard:
1. Navigate to Settings → Environment Variables
2. Add these variables:

```
Name: TWILIO_ACCOUNT_SID
Value: AC6262dc992fa3a49bca74716a53414e57

Name: TWILIO_AUTH_TOKEN  
Value: 161edbef1ae77c139e3f94c3b6533ab5

Name: TWILIO_PHONE_NUMBER
Value: +61483934656
```

### 2. Redeploy Your Application

After adding the environment variables:
- Trigger a new deployment (push to git or redeploy in Vercel dashboard)
- The API functions should now have access to the Twilio credentials

### 3. Test Your SMS Function

Once deployed, test the SMS functionality from your application.

## What We Fixed

1. **Updated vercel.json**: Changed from `"nodejs"` to `"nodejs20.x"` runtime
2. **Simplified configuration**: Removed unnecessary routes and version specifications  
3. **Fixed API function**: Changed from ES modules to CommonJS for better Vercel compatibility
4. **Environment variables**: Updated your .env file with the correct server-side variables

## Troubleshooting

If you still get runtime errors:
- Check the Vercel Functions logs in your dashboard
- Ensure environment variables are properly set
- Try using `nodejs18.x` instead of `nodejs20.x` if issues persist
