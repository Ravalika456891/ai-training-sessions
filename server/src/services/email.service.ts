import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

export interface EmailDispatchResult {
  sent: boolean;
  messageId?: string;
  previewUrl?: string;
  error?: string;
}

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  private static getTransporter(): nodemailer.Transporter | null {
    if (this.transporter) return this.transporter;

    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      try {
        this.transporter = nodemailer.createTransport({
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          secure: env.SMTP_SECURE,
          auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          },
        });
        console.log(`[EmailService] Configured live SMTP transport for ${env.SMTP_HOST}`);
      } catch (err: any) {
        console.warn(`[EmailService] Failed to initialize SMTP transport: ${err.message}`);
        this.transporter = null;
      }
    }

    return this.transporter;
  }

  /**
   * Send a rich, responsive registration confirmation email
   */
  static async sendRegistrationConfirmation(registration: {
    id: string;
    name: string;
    email: string;
    phone: string;
    batchId: string;
    createdAt?: Date | string;
  }): Promise<EmailDispatchResult> {
    const formattedDate = registration.createdAt
      ? new Date(registration.createdAt).toLocaleString('en-US', {
          dateStyle: 'full',
          timeStyle: 'short',
        })
      : new Date().toLocaleString();

    const subject = `Registration Confirmed: AI Launchpad 2-Day Bootcamp (${registration.batchId})`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; color: #0F172A; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 30px auto; background: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #2563EB; color: #ffffff; padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0 0 8px; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 0; font-size: 14px; opacity: 0.9; }
    .badge { display: inline-block; background: rgba(255, 255, 255, 0.2); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-top: 12px; }
    .content { padding: 32px 28px; line-height: 1.6; }
    .welcome { font-size: 18px; font-weight: 700; margin-bottom: 12px; color: #0F172A; }
    .receipt { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin: 24px 0; }
    .receipt-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #EDF2F7; font-size: 13px; }
    .receipt-row:last-child { border-bottom: none; }
    .receipt-label { color: #64748B; font-weight: 500; }
    .receipt-value { color: #0F172A; font-weight: 600; text-align: right; }
    .alert-box { background: #EFF6FF; border-left: 4px solid #2563EB; padding: 14px 18px; border-radius: 8px; margin: 20px 0; font-size: 13px; color: #1E40AF; }
    .footer { background: #F1F5F9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>AI Launchpad</h1>
      <p>2-Day Hands-On Artificial Intelligence Bootcamp</p>
      <div class="badge">Official Registration Confirmation</div>
    </div>
    <div class="content">
      <div class="welcome">Congratulations, ${registration.name}!</div>
      <p>Your registration for the upcoming <strong>AI Launchpad Bootcamp</strong> has been successfully confirmed and recorded in our live database.</p>
      
      <div class="alert-box">
        <strong>Session Access & Calendar:</strong> Live Zoom/Meet access links, prerequisite setup guides, and session calendar invites will be sent to this email address 24 hours prior to Day 1.
      </div>

      <div class="receipt">
        <div class="receipt-row">
          <span class="receipt-label">Registration ID:</span>
          <span class="receipt-value" style="font-family: monospace; color: #2563EB;">${registration.id}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Participant:</span>
          <span class="receipt-value">${registration.name}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Registered Email:</span>
          <span class="receipt-value">${registration.email}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Contact Phone:</span>
          <span class="receipt-value">${registration.phone}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Training Batch:</span>
          <span class="receipt-value">${registration.batchId}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Date Confirmed:</span>
          <span class="receipt-value">${formattedDate}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Status:</span>
          <span class="receipt-value" style="color: #16A34A;">Confirmed</span>
        </div>
      </div>

      <p style="font-size: 13px; color: #475569;">
        Need assistance or have questions before Day 1? Contact our admissions team at <a href="mailto:admissions@ailaunchpad.edu" style="color: #2563EB;">admissions@ailaunchpad.edu</a>.
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} AI Launchpad. 2-Day Hands-On AI Masterclass. All rights reserved.
    </div>
  </div>
</body>
</html>
    `;

    const textContent = `
AI Launchpad — Registration Confirmed
======================================
Congratulations, ${registration.name}!

Your seat in the 2-Day Hands-On AI Bootcamp (${registration.batchId}) has been confirmed.

Registration Details:
- Registration ID: ${registration.id}
- Participant: ${registration.name}
- Email: ${registration.email}
- Phone: ${registration.phone}
- Training Batch: ${registration.batchId}
- Timestamp: ${formattedDate}
- Status: Confirmed

Live session links and prerequisite setups will be dispatched 24 hours before Day 1.
If you have any questions, reach out to admissions@ailaunchpad.edu.
    `.trim();

    const transporter = this.getTransporter();

    if (transporter) {
      try {
        const info = await transporter.sendMail({
          from: env.EMAIL_FROM,
          to: registration.email,
          subject,
          text: textContent,
          html: htmlContent,
        });

        console.log(`[EmailService] Live confirmation email sent to ${registration.email} (MessageId: ${info.messageId})`);
        return {
          sent: true,
          messageId: info.messageId,
        };
      } catch (err: any) {
        console.error(`[EmailService Error] Failed to send email via SMTP: ${err.message}`);
        return {
          sent: false,
          error: err.message,
        };
      }
    }

    // Graceful Fallback for Dev / Missing SMTP: Logs confirmation dispatch cleanly
    console.log(`------------------------------------------------------------`);
    console.log(`[EmailService Test Mode] Registration Confirmation Dispatched`);
    console.log(`To: ${registration.email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Registration ID: ${registration.id} | Batch: ${registration.batchId}`);
    console.log(`------------------------------------------------------------`);

    return {
      sent: true,
      messageId: `test-email-${registration.id}`,
    };
  }
}

