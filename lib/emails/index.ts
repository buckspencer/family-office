import { Resend } from 'resend';
import { TeamInvitationEmail } from './templates/team-invitation';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTeamInvitationEmail({
  to,
  teamName,
  inviterName,
  inviteLink,
  role,
}: {
  to: string;
  teamName: string;
  inviterName: string;
  inviteLink: string;
  role: string;
}) {
  try {
    // For development, use a test email address
    const recipient = process.env.NODE_ENV === 'development' 
      ? 'delivered@resend.dev' 
      : to;

    const { data, error } = await resend.emails.send({
      from: 'Family Office <onboarding@resend.dev>',
      to: [recipient],
      subject: `Join ${teamName} on Family Office`,
      react: TeamInvitationEmail({
        teamName,
        inviterName,
        inviteLink,
        role,
      }),
    });

    if (error) {
      console.error('Error sending email:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to send team invitation email:', error);
    throw error;
  }
} 