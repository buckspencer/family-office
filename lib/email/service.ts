import { Resend } from 'resend';
import { renderVerificationEmail } from './templates/verification-email';
import { renderInvitationEmail } from './templates/invitation-email';

if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing RESEND_API_KEY environment variable');
}

if (!process.env.NEXT_PUBLIC_APP_URL) {
  throw new Error('Missing NEXT_PUBLIC_APP_URL environment variable');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async ({
  email,
  name,
  token,
}: {
  email: string;
  name?: string;
  token: string;
}) => {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
  
  try {
    console.log('Sending verification email to:', email);
    console.log('Verification URL:', verificationUrl);
    
    const emailHtml = await renderVerificationEmail({ verificationUrl, name });
    
    const data = await resend.emails.send({
      from: 'Family Office <onboarding@resend.dev>',
      to: email,
      subject: 'Verify your email address',
      html: emailHtml,
      replyTo: 'support@phronemalabs.com'
    });

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // Return a more specific error message
    if (error instanceof Error) {
      return { 
        success: false, 
        error: {
          message: error.message,
          name: error.name
        }
      };
    }
    
    return { 
      success: false, 
      error: {
        message: 'Failed to send verification email',
        name: 'UnknownError'
      }
    };
  }
};

export const sendInvitationEmail = async ({
  email,
  teamName,
  inviterName,
  role,
  invitationId,
}: {
  email: string;
  teamName: string;
  inviterName?: string;
  role: string;
  invitationId: number;
}) => {
  const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sign-up?inviteId=${invitationId}`;
  
  try {
    console.log('Sending invitation email to:', email);
    console.log('Invitation URL:', invitationUrl);
    
    const emailHtml = await renderInvitationEmail({ 
      invitationUrl,
      teamName,
      inviterName,
      role,
    });
    
    const data = await resend.emails.send({
      from: 'Family Office <onboarding@resend.dev>',
      to: email,
      subject: `Join ${teamName} on Family Office`,
      html: emailHtml,
      replyTo: 'support@phronemalabs.com'
    });

    console.log('Invitation email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send invitation email:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // Return a more specific error message
    if (error instanceof Error) {
      return { 
        success: false, 
        error: {
          message: error.message,
          name: error.name
        }
      };
    }
    
    return { 
      success: false, 
      error: {
        message: 'Failed to send invitation email',
        name: 'UnknownError'
      }
    };
  }
}; 