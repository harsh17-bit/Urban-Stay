/**
 * Email Service Module
 * Handles all email notifications for the UrbanStay.com platform
 * Uses Nodemailer with Gmail SMTP for sending emails
 *
 * @module utils/email
 * @requires nodemailer
 */

const nodemailer = require('nodemailer');

const buildOtpEmailTemplate = ({ title, message, otp, footer }) => {
  return `
    <div style="margin:0;padding:0;background:#f7f7f7;font-family:Arial,sans-serif;color:#222;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
        <tr>
          <td align="center">
            <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;">
              <tr>
                <td style="padding:20px 24px;border-bottom:1px solid #f0f0f0;">
                  <h2 style="margin:0;font-size:20px;color:#111;">${title}</h2>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#333;">${message}</p>
                  <div style="display:inline-block;padding:10px 14px;border:1px solid #dcdcdc;border-radius:6px;background:#fafafa;font-size:24px;font-weight:700;letter-spacing:4px;color:#111;">
                    ${otp}
                  </div>
                  <p style="margin:12px 0 0;font-size:13px;line-height:1.6;color:#555;">This code is valid for 10 minutes.</p>
                  <p style="margin:10px 0 0;font-size:13px;line-height:1.6;color:#555;">${footer}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
};

/**
 * Creates and configures the email transporter
 * Uses Gmail SMTP service with credentials from environment variables
 *
 * @returns {Object} Configured nodemailer transporter
 * @throws {Error} If EMAIL_USER or EMAIL_PASSWORD is not configured
 */
const createTransporter = () => {
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email service is not configured');
  }
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

/**
 * Sends an email notification to property owners when they receive a new inquiry
 * Email includes inquirer details, message, and optional visit scheduling information
 *
 * @param {Object} data - Inquiry notification data
 * @param {string} data.ownerEmail - Email address of the property owner
 * @param {string} data.propertyTitle - Title of the property being inquired about
 * @param {string} data.inquiryType - Type of inquiry (e.g., 'buy-inquiry', 'rent-inquiry')
 * @param {string} data.userName - Name of the person making the inquiry
 * @param {string} data.userEmail - Email of the inquirer
 * @param {string} data.phone - Phone number of the inquirer
 * @param {string} data.message - Inquiry message content
 * @param {string} [data.preferredVisitDate] - Optional preferred visit date
 * @param {string} [data.preferredVisitTime] - Optional preferred visit time
 *
 * @returns {Promise<Object>} Success object with messageId
 * @throws {Error} If email sending fails
 */
const sendInquiryNotification = async (data) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Urban Stay Property" <${process.env.EMAIL_USER}>`,
      to: data.ownerEmail,
      subject: `New ${data.inquiryType} Inquiry for ${data.propertyTitle}`,
      html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
              .info-box { background: #f9fafb; padding: 15px; border-left: 4px solid #2563eb; margin: 15px 0; }
              .label { font-weight: bold; color: #4b5563; }
              .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
            </style>
          </head>
          <body>
            <div class="container">
                <h1>New Property Inquiry</h1>
              <div class="content">
                <p>Hello,</p>
                <p>You have received a new <strong>${data.inquiryType.replace(/-/g, ' ')}</strong> inquiry for your property.</p>
                
                <div class="info-box">
                  <p><span class="label">Property:</span> ${data.propertyTitle}</p>
                  <p><span class="label">Inquiry Type:</span> ${data.inquiryType.replace(/-/g, ' ').toUpperCase()}</p>
                </div>
                
                <h3>Inquirer Details:</h3>
                <div class="info-box">
                  <p><span class="label">Name:</span> ${data.userName}</p>
                  <p><span class="label">Email:</span> ${data.userEmail}</p>
                  <p><span class="label">Phone:</span> ${data.phone}</p>
                </div>
                
                <h3>Message:</h3>
                <div class="info-box">
                  <p>${data.message}</p>
                </div>
                
                ${
                  data.preferredVisitDate
                    ? `
                <h3>Preferred Visit:</h3>
                <div class="info-box">
                  <p><span class="label">Date:</span> ${new Date(data.preferredVisitDate).toLocaleDateString()}</p>
                  ${data.preferredVisitTime ? `<p><span class="label">Time:</span> ${data.preferredVisitTime}</p>` : ''}
                </div>
                `
                    : ''
                }
                
                <p>Please respond to the inquirer as soon as possible.</p>
                <p>
                  <a href="mailto:${data.userEmail}" class="button">Reply via Email</a>
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(' Inquiry notification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(' Error sending email:', error.message);
    throw error;
  }
};

/**
 * Sends a welcome email to newly registered users
 * Email content varies based on user role (seller vs regular user)
 * Includes platform features, getting started guide, and support information
 *
 * @param {Object} data - User registration data
 * @param {string} data.email - User's email address
 * @param {string} data.name - User's full name
 * @param {string} data.role - User's role ('seller' or 'user')
 *
 * @returns {Promise<Object>} Success object with messageId
 * @throws {Error} If email sending fails
 */
const sendWelcomeEmail = async (data) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Urban Stay" <${process.env.EMAIL_USER}>`,
      to: data.email,
      subject: 'Welcome to Urban Stay!',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:20px;background:#f8fafc;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="padding:20px 0;">
                <table width="550" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e2e8f0;">
                  
                  <!-- Header with Logo -->
                  <tr>
                    <td style="padding:30px;text-align:center;border-bottom:3px solid #62c85f;">
                      <h1 style="margin:0;color:#785835;font-size:28px;">Urban Stay</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding:30px;">
                      <p style="margin:0 0 20px;font-size:16px;color:#1e293b;">Hi <strong>${data.name}</strong>,</p>
                      <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.6;">Welcome to Urban Stay! Your account has been created successfully as a <strong>${data.role === 'seller' ? 'Seller' : 'Buyer'}</strong>.</p>
                      
                      <p style="margin:0 0 15px;font-size:14px;color:#475569;font-weight:600;">You can now:</p>
                      <ul style="margin:0 0 25px;padding:0 0 0 20px;color:#475569;font-size:14px;">
                        <li style="margin-bottom:8px;">Browse thousands of properties</li>
                        <li style="margin-bottom:8px;">Save your favorite listings</li>
                        <li style="margin-bottom:8px;">Get instant notifications</li>
                        <li>Connect with ${data.role === 'seller' ? 'our community of buyers' : 'verified sellers and agents'}</li>
                      </ul>
                      
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding:20px 0;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background:#62c85f;color:#ffffff;text-decoration:none;padding:12px 30px;border-radius:4px;display:inline-block;font-weight:600;font-size:14px;">Get Started</a>
                          </td>
                        </tr>
                      </table>
                      
                      <hr style="border:none;border-top:1px solid #e2e8f0;margin:25px 0;">
                      
                      <p style="margin:0;font-size:12px;color:#64748b;">Need help? <a href="mailto:${process.env.EMAIL_USER}" style="color:#785835;text-decoration:none;font-weight:600;">Contact us</a></p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background:#f8fafc;padding:20px 30px;text-align:center;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;">
                      © ${new Date().getFullYear()} Urban Stay. All rights reserved.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error.message);
    throw error;
  }
};

/**
 * Sends a password reset OTP email
 *
 * @param {Object} data - OTP email data
 * @param {string} data.email - User's email address
 * @param {string} data.otp - 6-digit OTP code
 *
 * @returns {Promise<Object>} Success object with messageId
 * @throws {Error} If email sending fails
 */
const sendPasswordResetOtpEmail = async (data) => {
  try {
    const transporter = createTransporter();
    const text = `Your OTP for password reset is ${data.otp}. It is valid for 10 minutes.`;
    const html = buildOtpEmailTemplate({
      title: 'Password Reset OTP',
      message:
        'We received a request to reset your Urban Stay password. Use the OTP below to continue:',
      otp: data.otp,
      footer: 'If you did not request this, you can safely ignore this email.',
    });

    const mailOptions = {
      from: `"UrbanStay.com" <${process.env.EMAIL_USER}>`,
      to: data.email,
      subject: 'Your UrbanStay.com password reset OTP',
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error.message);
    throw error;
  }
};

/**
 * Sends a registration email verification OTP email
 *
 * @param {Object} data - OTP email data
 * @param {string} data.email - User's email address
 * @param {string} data.otp - 6-digit OTP code
 *
 * @returns {Promise<Object>} Success object with messageId
 * @throws {Error} If email sending fails
 */
const sendRegistrationOtpEmail = async (data) => {
  try {
    const transporter = createTransporter();
    const text = `Your Urban Stay registration OTP is ${data.otp}. It expires in 10 minutes.`;
    const html = buildOtpEmailTemplate({
      title: 'Email Verification OTP',
      message:
        'Use the OTP below to verify your email address and continue creating your Urban Stay account:',
      otp: data.otp,
      footer:
        'If you did not start this signup process, no further action is needed.',
    });

    const mailOptions = {
      from: `"Urban Stay" <${process.env.EMAIL_USER}>`,
      to: data.email,
      subject: 'Urban Stay - Verify Your Email',
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Registration OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending registration OTP email:', error.message);
    throw error;
  }
};

/**
 * Sends an email notification to a user when someone replies to their inquiry
 *
 * @param {Object} data
 * @param {string} data.toEmail        - Recipient email
 * @param {string} data.toName         - Recipient name
 * @param {string} data.replierName    - Name of the person who replied
 * @param {string} data.propertyTitle  - Property title
 * @param {string} data.replyMessage   - The reply message content
 * @param {string} data.inquiryId      - Inquiry ID for deep-link
 */
const sendInquiryReplyNotification = async (data) => {
  try {
    const transporter = createTransporter();
    const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/inquiry/${data.inquiryId}`;

    const mailOptions = {
      from: `"Urban Stay Property" <${process.env.EMAIL_USER}>`,
      to: data.toEmail,
      subject: `New reply on your inquiry — ${data.propertyTitle}`,
      html: `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;background:#f5f7fa;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
  <tr><td align="center">
  <table width="540" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <!-- Header -->
    <tr>
      <td style="background:#0f3b52;padding:24px 32px;">
        <h2 style="margin:0;color:#ffffff;font-size:20px;">New Reply on Your Inquiry</h2>
        <p style="margin:4px 0 0;color:#94c9e0;font-size:13px;">Urban Stay Property</p>
      </td>
    </tr>
    <!-- Body -->
    <tr>
      <td style="padding:28px 32px;">
        <p style="margin:0 0 16px;color:#334155;font-size:15px;">Hi <strong>${data.toName}</strong>,</p>
        <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6;">
          <strong>${data.replierName}</strong> has replied to your inquiry about
          <strong>${data.propertyTitle}</strong>.
        </p>

        <!-- Reply bubble -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background:#f0f9ff;border-left:4px solid #0f3b52;border-radius:0 8px 8px 0;padding:14px 18px;">
              <p style="margin:0 0 6px;font-size:12px;color:#64748b;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;">Their reply</p>
              <p style="margin:0;color:#1e293b;font-size:14px;line-height:1.65;">${data.replyMessage}</p>
            </td>
          </tr>
        </table>

        <p style="margin:24px 0 20px;color:#475569;font-size:14px;">Click below to view the full conversation and reply back:</p>

        <a href="${dashboardUrl}"
          style="display:inline-block;background:#d4a574;color:#ffffff;text-decoration:none;padding:12px 26px;border-radius:7px;font-size:14px;font-weight:bold;">
          View Conversation
        </a>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;">
        <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
          You're receiving this because you have an active inquiry on Urban Stay.
          &copy; ${new Date().getFullYear()} Urban Stay Property
        </p>
      </td>
    </tr>
  </table>
  </td></tr>
  </table>
  </body>
  </html>
        `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Inquiry reply notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending reply notification email:', error.message);
    throw error;
  }
};

module.exports = {
  sendInquiryNotification,
  sendInquiryReplyNotification,
  sendWelcomeEmail,
  sendPasswordResetOtpEmail,
  sendRegistrationOtpEmail,
};
