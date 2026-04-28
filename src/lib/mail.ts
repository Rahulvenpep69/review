import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendInviteEmail = async (email: string, name: string, role: string) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is missing. Email not sent.");
    return;
  }

  try {
    await resend.emails.send({
      from: "MEDIA360 <onboarding@resend.dev>",
      to: email,
      subject: "You've been invited to join MEDIA360",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #3b82f6;">Welcome to MEDIA360</h2>
          <p>Hi ${name},</p>
          <p>You have been invited to join the team as a <strong>${role}</strong>.</p>
          <p>You can now log in to the dashboard to start managing customer reputation and AI replies.</p>
          <div style="margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      `,
    });
    console.log(`Invite email sent to ${email}`);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};
