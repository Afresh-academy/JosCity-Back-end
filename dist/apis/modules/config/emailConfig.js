"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Create transporter
// SMTP_HOST should be a hostname (e.g., smtp.gmail.com, smtp.mailtrap.io), NOT an email address
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: true,
    auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
    },
});
// Verify connection
transporter.verify(function (error, _success) {
    if (error) {
        console.log(" Email configuration error:", error);
    }
    else {
        console.log(" Email server is ready to send messages");
    }
});
// Send email function
const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: process.env.SMTP_FROM || '"JosCity" <support@joscity.com>',
            to: to,
            subject: subject,
            html: html,
        };
        const result = await transporter.sendMail(mailOptions);
        console.log(" Email sent to:", to);
        return result;
    }
    catch (error) {
        console.error(" Email sending failed:", error);
        throw error;
    }
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=emailConfig.js.map