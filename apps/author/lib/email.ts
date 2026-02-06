import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn("⚠️  RESEND_API_KEY is not set. Email sending will be disabled.");
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Resend allows using onboarding@resend.dev for testing without domain verification
// For production, set EMAIL_FROM to a verified domain email
// In development, automatically use test email if domain isn't verified
const getFromEmail = (): string => {
  const envEmail = process.env.EMAIL_FROM;
  
  // If no EMAIL_FROM is set, use test email
  if (!envEmail) {
    return "onboarding@resend.dev";
  }
  
  // In development, prefer test email to avoid verification issues
  if (process.env.NODE_ENV === "development" && envEmail.includes("@matthewhuntsberry.com")) {
    console.warn("⚠️  Using test email in development. Set EMAIL_FROM=onboarding@resend.dev or verify domain for production.");
    return "onboarding@resend.dev";
  }
  
  return envEmail;
};

const FROM_EMAIL = getFromEmail();

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:4200";
}

const BASE_URL = getBaseUrl();

export async function sendBetaReaderWelcomeEmail({
  to,
  token,
  bookTitle,
  program,
}: {
  to: string;
  token: string;
  bookTitle?: string;
  program: string;
}) {
  const readingLink = `${BASE_URL}/r/${token}`;
  const isPartial = program.includes("partial");
  const readingType = isPartial ? "early chapters" : "full draft";

  const subject = bookTitle
    ? `Welcome to beta reading: ${bookTitle}`
    : "Welcome to beta reading";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">You're in!</h1>
        
        <p>Thanks for applying to be a beta reader. I'm excited to share ${bookTitle ? `early chapters of <strong>${bookTitle}</strong>` : readingType} with you.</p>
        
        ${bookTitle ? `<p><strong>Book:</strong> ${bookTitle}</p>` : ""}
        <p><strong>What you'll read:</strong> ${isPartial ? "Chapters 1-3" : "Full draft"}</p>
        
        <p style="margin-top: 24px; margin-bottom: 24px;">
          <a href="${readingLink}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 600;">
            Start reading
          </a>
        </p>
        
        <p style="font-size: 14px; color: #666; margin-top: 32px;">
          Or copy and paste this link into your browser:<br>
          <a href="${readingLink}" style="color: #0066cc; word-break: break-all;">${readingLink}</a>
        </p>
        
        <p style="font-size: 14px; color: #666; margin-top: 24px;">
          This is a private link. Please don't share it publicly.
        </p>
        
        <p style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee; font-size: 14px; color: #666;">
          Thanks for your time and feedback,<br>
          Matthew Huntsberry
        </p>
      </body>
    </html>
  `;

  const text = `
You're in!

Thanks for applying to be a beta reader. I'm excited to share ${bookTitle ? `early chapters of ${bookTitle}` : readingType} with you.

${bookTitle ? `Book: ${bookTitle}\n` : ""}What you'll read: ${isPartial ? "Chapters 1-3" : "Full draft"}

Start reading: ${readingLink}

This is a private link. Please don't share it publicly.

Thanks for your time and feedback,
Matthew Huntsberry
  `;

  if (!resend) {
    console.error("❌ Cannot send email: RESEND_API_KEY is not configured");
    return { success: false, error: "Email service not configured" };
  }

  try {
    console.log(`📧 Attempting to send email to: ${to}`);
    console.log(`📧 From: ${FROM_EMAIL}`);
    console.log(`📧 Subject: ${subject}`);
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("❌ Resend API error:", JSON.stringify(error, null, 2));
      
      // If domain verification error, suggest using test email
      if (error.statusCode === 403 && error.message?.includes("not verified")) {
        const suggestion = "Use 'onboarding@resend.dev' for testing, or verify your domain at https://resend.com/domains";
        console.error(`💡 Suggestion: ${suggestion}`);
        return { 
          success: false, 
          error: `${error.message}. ${suggestion}` 
        };
      }
      
      return { success: false, error: error.message || String(error) };
    }

    console.log("✅ Email sent successfully:", data?.id);
    return { success: true, data };
  } catch (error) {
    console.error("❌ Email send exception:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return { success: false, error };
  }
}

export async function sendBetaReaderApplicationNotification({
  applicantEmail,
  bookTitle,
  formatPref,
  tasteProfile,
  source,
  program,
}: {
  applicantEmail: string;
  bookTitle?: string;
  formatPref?: string;
  tasteProfile?: string;
  source?: string;
  program: string;
}) {
  let adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || "onboarding@resend.dev";
  
  // If using test email (onboarding@resend.dev), Resend only allows sending to the account owner's email
  // Detect this and use the account owner email for localhost/development
  if (FROM_EMAIL === "onboarding@resend.dev" && adminEmail !== "matthewhuntsberry@gmail.com") {
    console.warn("⚠️  Using test email - Resend only allows sending to account owner. Redirecting to matthewhuntsberry@gmail.com");
    console.warn(`⚠️  Original admin email (${adminEmail}) will be used in production with verified domain`);
    adminEmail = "matthewhuntsberry@gmail.com";
  }
  
  console.log("📧 Admin email address:", adminEmail);
  console.log("📧 ADMIN_EMAIL env var:", process.env.ADMIN_EMAIL ? "SET" : "NOT SET");
  console.log("📧 EMAIL_FROM env var:", process.env.EMAIL_FROM ? "SET" : "NOT SET");
  
  const subject = bookTitle
    ? `New beta reader application: ${bookTitle}`
    : "New beta reader application";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">New Beta Reader Application</h1>
        
        <p>Someone has applied to be a beta reader.</p>
        
        <div style="background-color: #f5f5f5; padding: 16px; border-radius: 4px; margin: 24px 0;">
          <p style="margin: 8px 0;"><strong>Email:</strong> ${applicantEmail}</p>
          ${bookTitle ? `<p style="margin: 8px 0;"><strong>Book:</strong> ${bookTitle}</p>` : ""}
          <p style="margin: 8px 0;"><strong>Program:</strong> ${program}</p>
          ${formatPref ? `<p style="margin: 8px 0;"><strong>Format Preference:</strong> ${formatPref}</p>` : ""}
          ${tasteProfile ? `<p style="margin: 8px 0;"><strong>Taste Profile:</strong> ${tasteProfile}</p>` : ""}
          ${source ? `<p style="margin: 8px 0;"><strong>Source:</strong> ${source}</p>` : ""}
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 24px;">
          Review and approve applications at:<br>
          <a href="${BASE_URL}/admin/reader-applicants" style="color: #0066cc;">${BASE_URL}/admin/reader-applicants</a>
        </p>
      </body>
    </html>
  `;

  const text = `
New Beta Reader Application

Someone has applied to be a beta reader.

Email: ${applicantEmail}
${bookTitle ? `Book: ${bookTitle}\n` : ""}Program: ${program}
${formatPref ? `Format Preference: ${formatPref}\n` : ""}${tasteProfile ? `Taste Profile: ${tasteProfile}\n` : ""}${source ? `Source: ${source}\n` : ""}
Review and approve applications at: ${BASE_URL}/admin/reader-applicants
  `;

  if (!resend) {
    console.error("❌ Cannot send email: RESEND_API_KEY is not configured");
    return { success: false, error: "Email service not configured" };
  }

  try {
    console.log(`📧 Sending admin notification to: ${adminEmail}`);
    console.log(`📧 From email: ${FROM_EMAIL}`);
    console.log(`📧 Subject: ${subject}`);
    console.log(`📧 RESEND_API_KEY: ${process.env.RESEND_API_KEY ? "SET" : "NOT SET"}`);
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject,
      html,
      text,
    });
    
    console.log(`📧 Resend API response received`);
    console.log(`📧 Data:`, data ? JSON.stringify(data) : "null");
    console.log(`📧 Error:`, error ? JSON.stringify(error) : "null");

    if (error) {
      console.error("❌ Resend API error:", JSON.stringify(error, null, 2));
      console.error("❌ Error details:", {
        statusCode: error.statusCode,
        message: error.message,
        name: error.name,
      });
      
      // If domain verification error, suggest using test email
      if (error.statusCode === 403 && error.message?.includes("not verified")) {
        const suggestion = "Use 'onboarding@resend.dev' for testing, or verify your domain at https://resend.com/domains";
        console.error(`💡 Suggestion: ${suggestion}`);
        return { 
          success: false, 
          error: `${error.message}. ${suggestion}` 
        };
      }
      
      return { success: false, error: error.message || String(error) };
    }

    console.log("✅ Admin notification sent successfully");
    console.log("✅ Email ID:", data?.id);
    console.log("✅ Sent to:", adminEmail);
    return { success: true, data };
  } catch (error) {
    console.error("❌ Email send exception:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return { success: false, error };
  }
}
