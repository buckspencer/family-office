import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface TeamInvitationEmailProps {
  teamName: string;
  inviterName: string;
  inviteLink: string;
  role: string;
}

export const TeamInvitationEmail = ({
  teamName,
  inviterName,
  inviteLink,
  role,
}: TeamInvitationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Join {teamName} on Family Office</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Join {teamName}</Heading>
          <Text style={text}>
            {inviterName} has invited you to join {teamName} as a {role} on Family Office.
          </Text>
          <Text style={text}>
            Family Office is a platform for managing your family's financial and administrative needs.
          </Text>
          <Button
            style={button}
            href={inviteLink}
          >
            Accept Invitation
          </Button>
          <Text style={footer}>
            If you didn't request this invitation, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default TeamInvitationEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '580px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
};

const button = {
  backgroundColor: '#f97316',
  borderRadius: '9999px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px 20px',
};

const footer = {
  color: '#898989',
  fontSize: '14px',
  marginTop: '24px',
}; 