const nodemailer = require('nodemailer');

/**
 * Email Service for Smart Crop Aid
 * Handles sending welcome emails and other notifications
 */

// Create transporter using SMTP (Gmail)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_APP_PASSWORD,
    },
  });
};

/**
 * Send Welcome Email to newly registered user
 * @param {string} userEmail - User's email address
 * @param {string} userName - User's name
 * @returns {Promise<boolean>} - Success status
 */
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    // Check if email credentials are configured
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_APP_PASSWORD) {
      console.warn('⚠️ Email service not configured. Skipping welcome email.');
      return false;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: 'Smart Crop Aid',
        address: process.env.SMTP_EMAIL,
      },
      to: userEmail,
      subject: '🌾 Welcome to Smart Crop Aid!',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Smart Crop Aid</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
                  
                  <!-- Header with gradient -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 50%, #1e8449 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        🌱 Welcome to Smart Crop Aid
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 24px;">
                        Hello ${userName || 'there'}! 👋
                      </h2>
                      
                      <p style="margin: 0 0 20px 0; color: #34495e; font-size: 16px; line-height: 1.8;">
                        <strong>Welcome to Smart Crop Aid</strong> — your intelligent partner in smarter, more sustainable farming!
                      </p>
                      
                      <p style="margin: 0 0 20px 0; color: #34495e; font-size: 16px; line-height: 1.8;">
                        We're here to help you:
                      </p>
                      
                      <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                        <tr>
                          <td style="padding: 12px 15px; background-color: #e8f8f0; border-radius: 8px; margin-bottom: 10px;">
                            <span style="font-size: 20px;">🔍</span>
                            <span style="color: #27ae60; font-weight: 600; margin-left: 10px;">Monitor Crop Health</span>
                            <p style="margin: 5px 0 0 35px; color: #5d6d7e; font-size: 14px;">Real-time insights for healthier crops</p>
                          </td>
                        </tr>
                        <tr><td style="height: 10px;"></td></tr>
                        <tr>
                          <td style="padding: 12px 15px; background-color: #eaf4fc; border-radius: 8px;">
                            <span style="font-size: 20px;">💧</span>
                            <span style="color: #3498db; font-weight: 600; margin-left: 10px;">Optimize Irrigation</span>
                            <p style="margin: 5px 0 0 35px; color: #5d6d7e; font-size: 14px;">Smart water management solutions</p>
                          </td>
                        </tr>
                        <tr><td style="height: 10px;"></td></tr>
                        <tr>
                          <td style="padding: 12px 15px; background-color: #fef9e7; border-radius: 8px;">
                            <span style="font-size: 20px;">📈</span>
                            <span style="color: #f39c12; font-weight: 600; margin-left: 10px;">Boost Yields</span>
                            <p style="margin: 5px 0 0 35px; color: #5d6d7e; font-size: 14px;">AI-powered recommendations for better harvests</p>
                          </td>
                        </tr>
                      </table>
                      
                      <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 12px; border-left: 4px solid #27ae60; margin-bottom: 25px;">
                        <p style="margin: 0; color: #2c3e50; font-size: 16px; line-height: 1.8; font-style: italic;">
                          "Let's grow healthier crops and a greener future, together!" 🌾
                        </p>
                      </div>
                      
                      <p style="margin: 0; color: #7f8c8d; font-size: 14px; text-align: center;">
                        If you have any questions, feel free to reach out to our support team.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #2c3e50; padding: 25px 30px; border-radius: 0 0 16px 16px; text-align: center;">
                      <p style="margin: 0 0 10px 0; color: #ecf0f1; font-size: 14px;">
                        © ${new Date().getFullYear()} Smart Crop Aid. All rights reserved.
                      </p>
                      <p style="margin: 0; color: #95a5a6; font-size: 12px;">
                        Your intelligent farming companion 🌱
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
Welcome to Smart Crop Aid, ${userName || 'there'}!

Welcome to Smart Crop Aid — your intelligent partner in smarter, more sustainable farming!

We're here to help you:
• Monitor crop health with real-time insights
• Optimize irrigation with smart water management
• Boost yields with AI-powered recommendations

Let's grow healthier crops and a greener future, together!

If you have any questions, feel free to reach out to our support team.

© ${new Date().getFullYear()} Smart Crop Aid. All rights reserved.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully to:', userEmail);
    console.log('Message ID:', info.messageId);
    return true;

  } catch (error) {
    console.error('❌ Error sending welcome email:', error.message);
    // Don't throw error - email failure shouldn't block registration
    return false;
  }
};

module.exports = {
  sendWelcomeEmail,
};
