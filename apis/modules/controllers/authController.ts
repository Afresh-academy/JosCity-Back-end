import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import db from "../config/database";
import { sendEmail } from "../config/emailConfig";

interface SignUpBody {
  first_name: string;
  last_name: string;
  gender: string;
  phone_number: string;
  nin_number?: string;
  email: string;
  password: string;
  address: string;
  account_type?: "personal" | "business";
  business_name?: string;
  business_type?: string;
  CAC_number?: string;
  business_location?: string;
}

// Helper function to generate activation code
const generateActivationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};

// Helper function to generate reset code
const generateResetCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};

/**
 * User Registration - Submit for Review (Personal or Business)
 */
export const signUp = async (
  req: Request<{}, {}, SignUpBody>,
  res: Response
): Promise<void> => {
  try {
    const {
      first_name,
      last_name,
      gender,
      phone_number,
      nin_number,
      email,
      password,
      address,
      account_type = "personal", // 'personal' or 'business'
      // Business-specific fields
      business_name,
      business_type,
      CAC_number,
      business_location,
    } = req.body;

    // Common validation
    if (
      !first_name ||
      !last_name ||
      !gender ||
      !phone_number ||
      !email ||
      !password ||
      !address
    ) {
      res.status(400).json({
        error: true,
        message: "All basic fields are required",
      });
      return;
    }

    // Business account validation
    if (account_type === "business") {
      if (!business_name || !business_type || !CAC_number) {
        res.status(400).json({
          error: true,
          message:
            "Business name, type, and CAC number are required for business accounts",
        });
        return;
      }
    }

    // Personal account validation
    if (account_type === "personal" && !nin_number) {
      res.status(400).json({
        error: true,
        message: "NIN number is required for personal accounts",
      });
      return;
    }

    // Check if email already exists
    const existingEmailResult = await db.query(
      "SELECT user_id FROM users WHERE user_email = $1",
      [email]
    );

    if (existingEmailResult.rows.length > 0) {
      res.status(400).json({
        error: true,
        message: "Email already registered",
      });
      return;
    }

    // Check if NIN already exists (for personal accounts)
    if (account_type === "personal" && nin_number) {
      const existingNINResult = await db.query(
        "SELECT user_id FROM users WHERE nin_number = $1",
        [nin_number]
      );

      if (existingNINResult.rows.length > 0) {
        res.status(400).json({
          error: true,
          message: "NIN number already registered",
        });
        return;
      }
    }

    // Check if business registration number exists (for business accounts - CAC_number is required)
    if (account_type === "business") {
      if (!CAC_number) {
        res.status(400).json({
          error: true,
          message: "CAC number is required for business accounts",
        });
        return;
      }

      const existingBusinessResult = await db.query(
        "SELECT user_id FROM users WHERE CAC_number = $1",
        [CAC_number]
      );

      if (existingBusinessResult.rows.length > 0) {
        res.status(400).json({
          error: true,
          message: "Business registration number already registered",
        });
        return;
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const user_name =
      account_type === "business"
        ? business_name!.toLowerCase().replace(/\s+/g, "")
        : `${first_name}${last_name}`.toLowerCase().replace(/\s+/g, "");

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Create user with "pending" status - NO ACTIVATION CODE YET
      const userResult = await connection.query(
        `INSERT INTO users 
         (user_name, user_firstname, user_lastname, user_gender, user_phone, nin_number, 
          user_email, user_password, address, account_status, account_type, 
          business_name, business_type, CAC_number, business_location) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', $10, $11, $12, $13, $14)
         RETURNING user_id`,
        [
          user_name,
          first_name,
          last_name,
          gender,
          phone_number,
          nin_number,
          email,
          hashedPassword,
          address,
          account_type,
          business_name,
          business_type,
          CAC_number,
          business_location,
        ]
      );

      await connection.commit();

      // Send "under review" email to user - NO ACTIVATION CODE IN THIS EMAIL
      const emailSubject =
        account_type === "business"
          ? "Business Account Registration Under Review"
          : "Account Registration Under Review";

      const emailTemplate =
        account_type === "business"
          ? `
          <h2>Business Registration Under Review</h2>
          <p>Dear ${business_name},</p>
          <p>Your business account registration has been received and is currently under review.</p>
          <p>We will verify your business details and notify you once your account is approved.</p>
          <p>You will receive an activation code via email when your account is approved.</p>
          <br>
          <p>Thank you for your patience.</p>
        `
          : `
          <h2>Registration Under Review</h2>
          <p>Dear ${first_name} ${last_name},</p>
          <p>Your account registration has been received and is currently under review.</p>
          <p>We will verify your details and notify you once your account is approved.</p>
          <p>You will receive an activation code via email when your account is approved.</p>
          <br>
          <p>Thank you for your patience.</p>
        `;

      await sendEmail(email, emailSubject, emailTemplate);

      res.status(201).json({
        success: true,
        message:
          "Registration submitted for review. You will receive an email once approved.",
        user_id: userResult.rows[0].user_id,
        status: "under_review",
        account_type: account_type,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      error: true,
      message: "Registration failed. Please try again.",
    });
  }
};

/**
 * Get Pending Approvals (For Admin) - Updated for both account types
 */
export const getPendingApprovals = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const pendingUsersResult = await db.query(
      `SELECT u.user_id, u.user_name, u.user_firstname, u.user_lastname, u.user_phone, u.nin_number, 
              u.user_email, u.address, u.user_registered, u.account_type,
              u.business_name, u.business_type, u.CAC_number, u.business_location
       FROM users u
       WHERE u.account_status = 'pending'
       ORDER BY u.user_registered DESC`
    );

    res.json({
      success: true,
      data: pendingUsersResult.rows,
    });
  } catch (error) {
    console.error("Get pending error:", error);
    res.status(500).json({
      error: true,
      message: "Failed to fetch pending approvals",
    });
  }
};

/**
 * Admin Approve Account - Updated for both account types
 */
export const approveAccount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { user_id } = req.body;

    // Generate activation code (expires in 48 hours) - ONLY WHEN APPROVING
    const activationCode = generateActivationCode();
    const activationExpires = new Date(Date.now() + 48 * 60 * 60 * 1000);

    // Update user status and set activation code
    const result = await db.query(
      `UPDATE users 
       SET account_status = 'approved', 
           activation_code = $1, 
           activation_expires = $2 
       WHERE user_id = $3 AND account_status = 'pending'`,
      [activationCode, activationExpires, user_id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({
        error: true,
        message: "User not found or already processed",
      });
      return;
    }

    // Get user details for email
    const usersResult = await db.query(
      "SELECT user_email, user_firstname, user_lastname, account_type, business_name FROM users WHERE user_id = $1",
      [user_id]
    );

    const user = usersResult.rows[0];

    // Send approval email with activation code - ONLY AFTER APPROVAL
    const emailSubject =
      user.account_type === "business"
        ? "Business Account Approved - Activation Code"
        : "Account Approved - Activation Code";

    const emailTemplate =
      user.account_type === "business"
        ? `
        <h2>Business Account Approved!</h2>
        <p>Dear ${user.business_name},</p>
        <p>Your business account has been approved! You can now login to your account.</p>
        <p><strong>Your Activation Code: ${activationCode}</strong></p>
        <p><em>This code will expire in 48 hours.</em></p>
        <br>
        <p>Use this code along with your email and password to login.</p>
        <p>Welcome to our platform!</p>
      `
        : `
        <h2>Account Approved!</h2>
        <p>Dear ${user.user_firstname} ${user.user_lastname},</p>
        <p>Your account has been approved! You can now login to your account.</p>
        <p><strong>Your Activation Code: ${activationCode}</strong></p>
        <p><em>This code will expire in 48 hours.</em></p>
        <br>
        <p>Use this code along with your email and password to login.</p>
        <p>Welcome to our platform!</p>
      `;

    await sendEmail(user.user_email, emailSubject, emailTemplate);

    res.json({
      success: true,
      message: "Account approved and activation code sent to user",
    });
  } catch (error) {
    console.error("Approval error:", error);
    res.status(500).json({
      error: true,
      message: "Account approval failed",
    });
  }
};

/**
 * Admin Reject Account - Updated for both account types
 */
export const rejectAccount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { user_id, reason } = req.body;

    // Update user status to rejected
    const result = await db.query(
      `UPDATE users 
       SET account_status = 'rejected'
       WHERE user_id = $1 AND account_status = 'pending'`,
      [user_id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({
        error: true,
        message: "User not found or already processed",
      });
      return;
    }

    // Get user details for email
    const usersResult = await db.query(
      "SELECT user_email, user_firstname, user_lastname, account_type, business_name FROM users WHERE user_id = $1",
      [user_id]
    );

    const user = usersResult.rows[0];

    // Send rejection email
    const recipientName =
      user.account_type === "business"
        ? user.business_name
        : `${user.user_firstname} ${user.user_lastname}`;

    await sendEmail(
      user.user_email,
      "Account Registration Update",
      `
      <h2>Registration Status Update</h2>
      <p>Dear ${recipientName},</p>
      <p>We regret to inform you that your ${
        user.account_type
      } account registration could not be approved at this time.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
      <br>
      <p>If you believe this is an error, please contact our support team.</p>
      `
    );

    res.json({
      success: true,
      message: "Account rejected and user notified",
    });
  } catch (error) {
    console.error("Rejection error:", error);
    res.status(500).json({
      error: true,
      message: "Account rejection failed",
    });
  }
};

/**
 * User Login (After Approval) - Updated for both account types
 */
export const signIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, activation_code } = req.body;

    // Find user
    const usersResult = await db.query(
      `SELECT user_id, user_email, user_password, user_firstname, user_lastname, 
              account_status, activation_code, activation_expires, is_verified, account_type,
              business_name, user_verified
       FROM users WHERE user_email = $1`,
      [email]
    );

    if (usersResult.rows.length === 0) {
      res.status(401).json({
        error: true,
        message: "Invalid email or password",
      });
      return;
    }

    const user = usersResult.rows[0];

    // Check account status
    if (user.account_status === "pending") {
      res.status(401).json({
        error: true,
        message: "Account is still under review. Please wait for approval.",
        status: "pending",
      });
      return;
    }

    if (user.account_status === "rejected") {
      res.status(401).json({
        error: true,
        message: "Account registration was rejected. Please contact support.",
        status: "rejected",
      });
      return;
    }

    // Verify activation code
    if (!activation_code || user.activation_code !== activation_code) {
      res.status(401).json({
        error: true,
        message: "Invalid activation code",
      });
      return;
    }

    // Check if activation code expired
    if (new Date() > new Date(user.activation_expires)) {
      res.status(401).json({
        error: true,
        message:
          "Activation code has expired. Please contact support for a new one.",
      });
      return;
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.user_password);
    if (!validPassword) {
      res.status(401).json({
        error: true,
        message: "Invalid email or password",
      });
      return;
    }

    // Mark as verified on first successful login
    if (!user.is_verified) {
      await db.query(
        "UPDATE users SET is_verified = 1, verified_at = NOW(), activation_code = NULL WHERE user_id = $1",
        [user.user_id]
      );
    }

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured in environment variables");
      res.status(500).json({
        error: true,
        message:
          "Server configuration error: JWT authentication not properly configured",
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.user_email,
        is_verified: true,
        account_type: user.account_type,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Prepare user response based on account type
    const userResponse: any = {
      user_id: user.user_id,
      email: user.user_email,
      is_verified: true,
      has_verified_badge:
        user.user_verified === 1 || user.user_verified === "1",
      account_type: user.account_type,
    };

    if (user.account_type === "business") {
      userResponse.business_name = user.business_name;
      userResponse.display_name = user.business_name;
    } else {
      userResponse.first_name = user.user_firstname;
      userResponse.last_name = user.user_lastname;
      userResponse.display_name = `${user.user_firstname} ${user.user_lastname}`;
    }

    res.json({
      success: true,
      message: "Login successful",
      token: token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: true,
      message: "Login failed",
    });
  }
};

/**
 * Forgot Password - Request reset
 */
export const forgetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    const usersResult = await db.query(
      "SELECT user_id, user_firstname, user_lastname, business_name, account_type FROM users WHERE user_email = $1 AND account_status = 'approved'",
      [email]
    );

    if (usersResult.rows.length === 0) {
      // Don't reveal if email exists or not for security
      res.json({
        success: true,
        message: "If the email exists, a reset code has been sent",
      });
      return;
    }

    const user = usersResult.rows[0];
    const resetCode = generateResetCode();
    const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await db.query(
      "UPDATE users SET reset_code = $1, reset_expires = $2 WHERE user_id = $3",
      [resetCode, resetExpires, user.user_id]
    );

    const recipientName =
      user.account_type === "business"
        ? user.business_name
        : `${user.user_firstname} ${user.user_lastname}`;

    // Send reset email
    await sendEmail(
      email,
      "Password Reset Code",
      `
      <h2>Password Reset Request</h2>
      <p>Dear ${recipientName},</p>
      <p>You requested to reset your password. Use the code below to reset your password:</p>
      <p><strong>Reset Code: ${resetCode}</strong></p>
      <p><em>This code will expire in 1 hour.</em></p>
      <br>
      <p>If you didn't request this, please ignore this email.</p>
      `
    );

    res.json({
      success: true,
      message: "If the email exists, a reset code has been sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      error: true,
      message: "Password reset request failed",
    });
  }
};

/**
 * Confirm Reset Code
 */
export const forgetPasswordConfirm = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, reset_key } = req.body;

    const usersResult = await db.query(
      "SELECT user_id FROM users WHERE user_email = $1 AND reset_code = $2 AND reset_expires > NOW()",
      [email, reset_key]
    );

    if (usersResult.rows.length === 0) {
      res.status(400).json({
        error: true,
        message: "Invalid or expired reset code",
      });
      return;
    }

    res.json({
      success: true,
      message: "Reset code verified successfully",
    });
  } catch (error) {
    console.error("Reset confirm error:", error);
    res.status(500).json({
      error: true,
      message: "Reset code verification failed",
    });
  }
};

/**
 * Reset Password with new password
 */
export const forgetPasswordReset = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, reset_key, password, confirm } = req.body;

    if (password !== confirm) {
      res.status(400).json({
        error: true,
        message: "Passwords do not match",
      });
      return;
    }

    const usersResult = await db.query(
      "SELECT user_id FROM users WHERE user_email = $1 AND reset_code = $2 AND reset_expires > NOW()",
      [email, reset_key]
    );

    if (usersResult.rows.length === 0) {
      res.status(400).json({
        error: true,
        message: "Invalid or expired reset code",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.query(
      "UPDATE users SET user_password = $1, reset_code = NULL, reset_expires = NULL WHERE user_id = $2",
      [hashedPassword, usersResult.rows[0].user_id]
    );

    res.json({
      success: true,
      message:
        "Password has been reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({
      error: true,
      message: "Password reset failed",
    });
  }
};

/**
 * Resend Activation Code
 */
export const resendActivation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    const usersResult = await db.query(
      "SELECT user_id, user_firstname, user_lastname, business_name, account_type FROM users WHERE user_email = $1 AND account_status = 'approved'",
      [email]
    );

    if (usersResult.rows.length === 0) {
      res.status(404).json({
        error: true,
        message: "Email not found or account not approved",
      });
      return;
    }

    const user = usersResult.rows[0];
    const newActivationCode = generateActivationCode();
    const activationExpires = new Date(Date.now() + 48 * 60 * 60 * 1000);

    await db.query(
      "UPDATE users SET activation_code = $1, activation_expires = $2 WHERE user_id = $3",
      [newActivationCode, activationExpires, user.user_id]
    );

    const recipientName =
      user.account_type === "business"
        ? user.business_name
        : `${user.user_firstname} ${user.user_lastname}`;

    // Send new activation code
    await sendEmail(
      email,
      "New Activation Code",
      `
      <h2>New Activation Code</h2>
      <p>Dear ${recipientName},</p>
      <p>Your new activation code is: <strong>${newActivationCode}</strong></p>
      <p><em>This code will expire in 48 hours.</em></p>
      <p>Use this code along with your email and password to login.</p>
      `
    );

    res.json({
      success: true,
      message: "New activation code sent to your email",
    });
  } catch (error) {
    console.error("Resend activation error:", error);
    res.status(500).json({
      error: true,
      message: "Failed to resend activation code",
    });
  }
};

/**
 * User Logout
 */
export const signOut = async (_req: Request, res: Response): Promise<void> => {
  try {
    // In a real app, you might want to blacklist the token
    // For now, we'll just return success
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      error: true,
      message: "Logout failed",
    });
  }
};

/**
 * Admin Login - Bypasses activation code requirement
 * Only allows login for users with user_group = 1 (admin) or user_group = 2 (moderator)
 */
export const adminLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        error: true,
        message: "Email and password are required",
      });
      return;
    }

    // Find user
    const usersResult = await db.query(
      `SELECT user_id, user_email, user_password, user_firstname, user_lastname, 
              user_group, account_status, account_type, user_verified
       FROM users WHERE user_email = $1`,
      [email]
    );

    if (usersResult.rows.length === 0) {
      res.status(401).json({
        error: true,
        message: "Invalid email or password",
      });
      return;
    }

    const user = usersResult.rows[0];

    // Check if user is admin or moderator
    if (user.user_group !== 1 && user.user_group !== 2) {
      res.status(403).json({
        error: true,
        message: "Access denied. Admin privileges required.",
      });
      return;
    }

    // Check account status - admin accounts should be approved
    if (user.account_status !== "approved") {
      res.status(403).json({
        error: true,
        message: "Account is not approved. Please contact support.",
        status: user.account_status,
      });
      return;
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.user_password);
    if (!validPassword) {
      res.status(401).json({
        error: true,
        message: "Invalid email or password",
      });
      return;
    }

    // Update last login timestamp
    await db.query(
      "UPDATE users SET last_login = NOW(), user_last_seen = NOW() WHERE user_id = $1",
      [user.user_id]
    );

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured in environment variables");
      res.status(500).json({
        error: true,
        message:
          "Server configuration error: JWT authentication not properly configured",
      });
      return;
    }

    // Generate JWT token with admin role
    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.user_email,
        is_verified: true,
        account_type: user.account_type,
        user_group: user.user_group,
        is_admin: true,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Prepare admin response
    const adminResponse: any = {
      user_id: user.user_id,
      email: user.user_email,
      first_name: user.user_firstname,
      last_name: user.user_lastname,
      display_name: `${user.user_firstname} ${user.user_lastname}`,
      user_group: user.user_group,
      is_admin: user.user_group === 1,
      is_moderator: user.user_group === 2,
      account_type: user.account_type,
      is_verified: true,
      has_verified_badge:
        user.user_verified === 1 || user.user_verified === "1",
    };

    // Set token in HTTP-only cookie for security
    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Return success response with redirect URL for frontend
    res.json({
      success: true,
      message: "Admin login successful",
      token: token,
      admin: adminResponse,
      redirect: "/admin/dashboard", // Frontend should redirect to this URL
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      error: true,
      message: "Admin login failed",
    });
  }
};

/**
 * Personal Registration - Wrapper for signUp with account_type='personal'
 */
export const personalRegister = async (
  req: Request<{}, {}, SignUpBody>,
  res: Response
): Promise<void> => {
  // Set account_type to 'personal' and call signUp
  req.body.account_type = "personal";
  await signUp(req, res);
};

/**
 * Business Registration - Wrapper for signUp with account_type='business'
 */
export const businessRegister = async (
  req: Request<{}, {}, SignUpBody>,
  res: Response
): Promise<void> => {
  // Set account_type to 'business' and call signUp
  req.body.account_type = "business";
  await signUp(req, res);
};
