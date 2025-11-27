import nodemailer, { Transporter } from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Helper to determine if secure connection should be used
const getSmtpConfig = () => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";

  // Port 465 uses SSL/TLS (secure: true), port 587 uses STARTTLS (secure: false)
  const secure = port === 465;

  // For Gmail and most providers, port 587 with STARTTLS is recommended
  const config: any = {
    host: host,
    port: port,
    secure: secure, // true for 465, false for other ports
    auth: {
      user: user,
      pass: pass,
    },
  };

  // For port 587, we need to explicitly enable STARTTLS
  if (port === 587) {
    config.requireTLS = true;
    config.tls = {
      rejectUnauthorized: false, // Allow self-signed certificates if needed
    };
  }

  return config;
};

// Create transporter
// SMTP_HOST should be a hostname (e.g., smtp.gmail.com, smtp.mailtrap.io), NOT an email address
const transporter: Transporter = nodemailer.createTransport(getSmtpConfig());

// Verify connection on startup
transporter.verify(function (error, _success) {
  if (error) {
    console.error("❌ Email configuration error:", error.message);
    console.error(
      "   Please check your SMTP settings in environment variables:"
    );
    console.error("   - SMTP_HOST:", process.env.SMTP_HOST || "not set");
    console.error("   - SMTP_PORT:", process.env.SMTP_PORT || "not set");
    console.error("   - SMTP_USER:", process.env.SMTP_USER ? "set" : "not set");
    console.error("   - SMTP_PASS:", process.env.SMTP_PASS ? "set" : "not set");

    const errorWithCode = error as any;
    if (errorWithCode.code === "EAUTH") {
      console.error(
        "   ⚠️  Authentication failed. Check your SMTP_USER and SMTP_PASS."
      );
      console.error(
        "   For Gmail, make sure you're using an App Password, not your regular password."
      );
    }
  } else {
    console.log("✅ Email server is ready to send messages");
    console.log("   SMTP Host:", process.env.SMTP_HOST || "smtp.gmail.com");
    console.log("   SMTP Port:", process.env.SMTP_PORT || "587");
  }
});

// Send email function with improved error handling
export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<any> => {
  // Validate email configuration before attempting to send
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    const error = new Error(
      "SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables."
    );
    console.error("❌ Email sending failed:", error.message);
    throw error;
  }

  if (!process.env.SMTP_HOST) {
    const error = new Error(
      "SMTP_HOST not configured. Please set SMTP_HOST environment variable."
    );
    console.error("❌ Email sending failed:", error.message);
    throw error;
  }

  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || '"JosCity" <support@joscity.com>',
      to: to,
      subject: subject,
      html: html,
    };

    console.log(`📧 Attempting to send email to: ${to}`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to: ${to}`);
    console.log(`   Message ID: ${result.messageId}`);
    return result;
  } catch (error: any) {
    console.error("❌ Email sending failed:", error.message);

    // Provide helpful error messages based on error type
    const errorCode = error.code;
    if (errorCode === "EAUTH") {
      console.error("   Authentication failed. Please check:");
      console.error("   - SMTP_USER is correct");
      console.error("   - SMTP_PASS is correct (for Gmail, use App Password)");
    } else if (errorCode === "ECONNECTION" || errorCode === "ETIMEDOUT") {
      console.error("   Connection failed. Please check:");
      console.error("   - SMTP_HOST is correct");
      console.error("   - SMTP_PORT is correct");
      console.error("   - Network/firewall allows outbound SMTP connections");
    } else if (errorCode === "EENVELOPE") {
      console.error("   Invalid email address:", to);
    }

    throw error;
  }
};
