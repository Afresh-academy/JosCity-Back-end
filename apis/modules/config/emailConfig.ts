import nodemailer, { Transporter } from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Helper function to get SMTP configuration
const getSmtpConfig = () => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";
  
  // Check if credentials are provided
  if (!user || !pass) {
    console.warn("⚠️  SMTP_USER or SMTP_PASS not configured. Email sending will fail.");
    return null;
  }

  // For Gmail, use service-based configuration if it's Gmail
  if (host.includes("gmail.com") && user.includes("@gmail.com")) {
    return {
      service: "gmail",
      auth: {
        user: user,
        pass: pass,
      },
    };
  }

  // For other SMTP providers, use host/port configuration
  const isSecure = port === 465;
  const config: any = {
    host: host,
    port: port,
    secure: isSecure, // true for 465, false for other ports
    auth: {
      user: user,
      pass: pass,
    },
    // Add TLS options for better compatibility
    tls: {
      rejectUnauthorized: false, // For self-signed certificates (use true in production with valid certs)
    },
  };

  // For port 587, use STARTTLS
  if (port === 587) {
    config.secure = false;
    config.requireTLS = true;
  }

  return config;
};

// Create transporter
const smtpConfig = getSmtpConfig();
let transporter: Transporter | null = null;

if (smtpConfig) {
  try {
    transporter = nodemailer.createTransport(smtpConfig);
    
    // Verify connection on startup (non-blocking)
    transporter.verify(function (error, success) {
      if (error) {
        console.error("❌ Email configuration error:", error.message);
        console.error("   Please check your SMTP settings in .env file");
      } else {
        console.log("✅ Email server is ready to send messages");
      }
    });
  } catch (error: any) {
    console.error("❌ Failed to create email transporter:", error.message);
    transporter = null;
  }
} else {
  console.warn("⚠️  Email transporter not initialized - SMTP credentials missing");
}

// Helper function to parse SMTP_FROM
const getFromAddress = (): string => {
  const user = process.env.SMTP_USER || "";
  const from = process.env.SMTP_FROM || "";
  
  // For Gmail, the "from" address must match the authenticated user
  // Extract email from SMTP_FROM if it's in "Name <email>" format
  let fromEmail = user; // Default to SMTP_USER
  
  if (from) {
    const cleanFrom = from.replace(/^["']|["']$/g, "");
    
    // If it's in "Name <email>" format, extract the email
    const emailMatch = cleanFrom.match(/<([^>]+)>/);
    if (emailMatch) {
      fromEmail = emailMatch[1];
    } else if (cleanFrom.includes("@")) {
      // If it's just an email address
      fromEmail = cleanFrom;
    }
    
    // For Gmail, force the from email to match the authenticated user
    if (user.includes("@gmail.com")) {
      fromEmail = user;
    }
    
    // Extract name from SMTP_FROM if available
    const nameMatch = cleanFrom.match(/^["']?([^"']+)["']?\s*</);
    const displayName = nameMatch ? nameMatch[1] : cleanFrom.split("<")[0].trim().replace(/^["']|["']$/g, "");
    
    if (displayName && displayName !== fromEmail) {
      return `"${displayName}" <${fromEmail}>`;
    }
  }
  
  // Default formatting with user's name
  if (user) {
    const name = user.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, l => l.toUpperCase());
    return `"${name}" <${user}>`;
  }
  
  return '"JosCity" <support@joscity.com>';
};

// Send email function
export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<any> => {
  // Check if transporter is initialized
  if (!transporter) {
    const error = new Error("Email service not configured. Please set SMTP_USER and SMTP_PASS in .env file.");
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
    const mailOptions = {
      from: getFromAddress(),
      to: to,
      subject: subject,
      html: html,
    };

    console.log(`📧 Attempting to send email to: ${to}`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to: ${to} (Message ID: ${result.messageId})`);
    return result;
  } catch (error: any) {
    console.error(`❌ Email sending failed to ${to}:`, error.message);
    
    // Provide more helpful error messages
    if (error.code === "EAUTH") {
      throw new Error("Email authentication failed. Please check your SMTP_USER and SMTP_PASS in .env file.");
    } else if (error.code === "ECONNECTION") {
      throw new Error("Failed to connect to email server. Please check your SMTP_HOST and SMTP_PORT in .env file.");
    } else if (error.responseCode === 535) {
      throw new Error("Email authentication failed. For Gmail, make sure you're using an App Password, not your regular password.");
    }
    
    throw error;
  }
};
