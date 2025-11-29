"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Helper function to get the "from" email address
const getFromAddress = () => {
    // Check for RESEND_FROM first, then fallback to SMTP_FROM for backward compatibility
    const from = process.env.RESEND_FROM || process.env.SMTP_FROM || "";
    const user = process.env.SMTP_USER || ""; // Keep for backward compatibility
    // If RESEND_FROM or SMTP_FROM is set, use it
    if (from) {
        const cleanFrom = from.replace(/^["']|["']$/g, "");
        // If it's in "Name <email>" format, keep it as is (Resend supports this)
        if (cleanFrom.includes("<") && cleanFrom.includes(">")) {
            return cleanFrom;
        }
        else if (cleanFrom.includes("@")) {
            // If it's just an email address, use it
            return cleanFrom;
        }
    }
    // If SMTP_USER is available, use it (backward compatibility)
    if (user && user.includes("@")) {
        const name = user.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, l => l.toUpperCase());
        return `"${name}" <${user}>`;
    }
    // Default fallback
    return '"JosCity" <onboarding@resend.dev>';
};
// Validate that Resend API key is configured
const validateResendConfig = () => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.warn("⚠️  RESEND_API_KEY not configured. Email sending will fail.");
        console.warn("   Please add RESEND_API_KEY to your .env file");
        return false;
    }
    return true;
};
// Initialize and validate on startup
const isResendConfigured = validateResendConfig();
if (isResendConfigured) {
    console.log("✅ Resend email service is configured");
}
else {
    console.warn("⚠️  Email service not initialized - RESEND_API_KEY missing");
}
// Send email function using Resend API
const sendEmail = async (to, subject, html) => {
    // Check if Resend API key is configured
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        const error = new Error("Email service not configured. Please set RESEND_API_KEY in .env file.");
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
        const fromAddress = getFromAddress();
        console.log(`📧 Attempting to send email to: ${to}`);
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: fromAddress,
                to: [to],
                subject: subject,
                html: html,
            }),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
            console.error("❌ Resend API error:", errorData);
            // Provide helpful error messages
            if (response.status === 401 || response.status === 403) {
                throw new Error("Resend API authentication failed. Please check your RESEND_API_KEY in .env file.");
            }
            else if (response.status === 422) {
                throw new Error(`Invalid email configuration: ${errorData.message || "Please check your RESEND_FROM email address."}`);
            }
            else if (response.status === 429) {
                throw new Error("Rate limit exceeded. Please try again later.");
            }
            else {
                throw new Error(`Failed to send email via Resend: ${errorData.message || `HTTP ${response.status}`}`);
            }
        }
        const data = await response.json();
        console.log(`✅ Email sent successfully to: ${to} (Message ID: ${data.id || "N/A"})`);
        return data;
    }
    catch (error) {
        console.error(`❌ Email sending failed to ${to}:`, error.message || error);
        // If it's already a formatted error, re-throw it
        if (error.message && error.message.includes("Resend")) {
            throw error;
        }
        // Handle network errors
        if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
            throw new Error("Failed to connect to Resend API. Please check your internet connection.");
        }
        throw error;
    }
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=emailConfig.js.map