require("dotenv").config();
import nodemailer from "nodemailer";

// Helper function to get the "from" email address
const getFromAddress = (): string => {
  // Check for SMTP_FROM first
  const from = process.env.SMTP_FROM || "";
  const user = process.env.SMTP_USER || "";

  // If SMTP_FROM is set, use it
  if (from) {
    const cleanFrom = from.replace(/^["']|["']$/g, "");

    // If it's in "Name <email>" format, keep it as is
    if (cleanFrom.includes("<") && cleanFrom.includes(">")) {
      return cleanFrom;
    } else if (cleanFrom.includes("@")) {
      // If it's just an email address, format it
      return `"JosCity" <${cleanFrom}>`;
    }
  }

  // If SMTP_USER is available, use it
  if (user && user.includes("@")) {
    const name = user
      .split("@")[0]
      .replace(/\./g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
    return `"${name}" <${user}>`;
  }

  // Default fallback
  return '"JosCity" <noreply@joscity.com>';
};

// Create nodemailer transporter
const createTransporter = () => {
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
  const smtpUser = process.env.SMTP_USER || "";
  const smtpPass = process.env.SMTP_PASS || "";

  // Validate SMTP configuration
  if (!smtpUser || !smtpPass) {
    throw new Error(
      "SMTP configuration incomplete. Please set SMTP_USER and SMTP_PASS in .env file."
    );
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
};

// Validate SMTP configuration on startup
const validateSmtpConfig = (): boolean => {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.warn(
      "⚠️  SMTP_USER or SMTP_PASS not configured. Email sending will fail."
    );
    console.warn("   Please add SMTP_USER and SMTP_PASS to your .env file");
    return false;
  }

  return true;
};

// Initialize and validate on startup
const isSmtpConfigured = validateSmtpConfig();
if (isSmtpConfigured) {
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = process.env.SMTP_PORT || "465";
  const smtpUser = process.env.SMTP_USER || "";
  console.log(
    `✅ SMTP email service is configured (Host: ${smtpHost}:${smtpPort}, User: ${smtpUser.substring(
      0,
      smtpUser.indexOf("@") + 1
    )}...)`
  );
  const fromAddress = getFromAddress();
  console.log(`   From address: ${fromAddress}`);
} else {
  console.warn("⚠️  Email service not initialized - SMTP credentials missing");
  console.warn(
    "   Please add SMTP_USER=your_email@example.com and SMTP_PASS=your_password to your .env file"
  );
}

// Send email function using Nodemailer
export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<any> => {
  // Validate SMTP configuration
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    const error = new Error(
      "Email service not configured. Please set SMTP_USER and SMTP_PASS in .env file."
    );
    console.error("❌", error.message);
    throw error;
  }

  // Validate email address
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    const error = new Error(`Invalid email address: ${to}`);
    console.error("❌", error.message);
    throw error;
  }

  try {
    const transporter = createTransporter();
    const fromAddress = getFromAddress();

    console.log(`📧 Attempting to send email to: ${to}`);

    const mailOptions = {
      from: fromAddress,
      to: to,
      subject: subject,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(
      `✅ Email sent successfully to: ${to} (Message ID: ${
        info.messageId || "N/A"
      })`
    );

    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
    };
  } catch (error: any) {
    console.error(`❌ Email sending failed to ${to}:`, error.message || error);

    // Provide helpful error messages
    if (error.code === "EAUTH") {
      throw new Error(
        "SMTP authentication failed. Please check your SMTP_USER and SMTP_PASS in .env file."
      );
    } else if (error.code === "ECONNECTION") {
      throw new Error(
        `Failed to connect to SMTP server. Please check your SMTP_HOST and SMTP_PORT settings.`
      );
    } else if (error.code === "ETIMEDOUT") {
      throw new Error(
        "SMTP connection timed out. Please check your network connection."
      );
    } else if (error.responseCode === 550) {
      throw new Error(
        `Invalid recipient email address: ${to}. Please verify the email address.`
      );
    } else if (error.responseCode === 553) {
      throw new Error(
        `Invalid sender email address. Please check your SMTP_FROM or SMTP_USER setting.`
      );
    }

    throw new Error(
      `Failed to send email: ${error.message || "Unknown error occurred"}`
    );
  }
};
