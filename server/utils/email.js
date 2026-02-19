/**
 * Email Service Module
 * Handles all email notifications for the UrbanStay.com platform
 * Uses Nodemailer with Gmail SMTP for sending emails
 * 
 * @module utils/email
 * @requires nodemailer
 */

const nodemailer = require('nodemailer');

/**
 * Creates and configures the email transporter
 * Uses Gmail SMTP service with credentials from environment variables
 * 
 * @returns {Object} Configured nodemailer transporter
 * @throws {Error} If EMAIL_USER or EMAIL_PASSWORD is not configured
 */
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error("Email service is not configured");
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
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
              
              ${data.preferredVisitDate ? `
              <h3>Preferred Visit:</h3>
              <div class="info-box">
                <p><span class="label">Date:</span> ${new Date(data.preferredVisitDate).toLocaleDateString()}</p>
                ${data.preferredVisitTime ? `<p><span class="label">Time:</span> ${data.preferredVisitTime}</p>` : ''}
              </div>
              ` : ''}
              
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
      from: `"UrbanStay.com" <${process.env.EMAIL_USER}>`,
      to: data.email,
      subject: 'Welcome to UrbanStay.com!',
      html: `
      <!DOCTYPE html>
<html>
<body style="margin:0;background:#f5f7fa;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
<tr>
<td align="center">

<table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:28px;">

<tr>
<td align="center">
<h2 style="margin:0;color:#0f172a;">Welcome to UrbanStay</h2>
<p style="margin:8px 0 20px;color:#64748b;font-size:14px;">
Find your perfect property easily
</p>
</td>
</tr>

<tr>
<td style="font-size:15px;color:#334155;line-height:1.6;">
Hello <strong>${data.name}</strong>,<br><br>

Thanks for joining UrbanStay. Your account as a 
<strong>${data.role}</strong> is now ready.
</td>
</tr>

<tr>
<td style="padding-top:18px;">
<strong style="color:#0f172a;">What you can do:</strong>

<ul style="margin-top:10px;padding-left:18px;color:#475569;">
<li>Browse verified properties</li>
<li>Save favourite listings</li>
<li>Contact property owners</li>
<li>Get property alerts</li>
</ul>

</td>
</tr>

<tr>
<td align="center" style="padding:25px 0;">
<a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}"
style="background:#0ea5a4;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:6px;display:inline-block;font-size:14px;">
Start Exploring
</a>
</td>
</tr>

<tr>
<td style="border-top:1px solid #e5e7eb;padding-top:18px;font-size:12px;color:#94a3b8;text-align:center;">
Need help? Contact
<a href="mailto:${process.env.EMAIL_USER}" style="color:#0ea5a4;text-decoration:none;">
${process.env.EMAIL_USER}
</a><br><br>
© ${new Date().getFullYear()} UrbanStay
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

    const mailOptions = {
      from: `"UrbanStay.com" <${process.env.EMAIL_USER}>`,
      to: data.email,
      subject: "Your UrbanStay.com password reset OTP",
      text: `Your OTP for password reset is ${data.otp}. It is valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="margin: 0 0 12px;">Password Reset OTP</h2>
          <p>Your OTP for password reset is:</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${data.otp}</p>
          <p>This code is valid for 10 minutes. If you did not request this, you can ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset OTP email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending OTP email:", error.message);
    throw error;
  }
};

module.exports = {
  sendInquiryNotification,
  sendWelcomeEmail,
  sendPasswordResetOtpEmail,
};