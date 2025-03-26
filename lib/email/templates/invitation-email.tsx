import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface InvitationEmailProps {
  invitationUrl: string;
  teamName: string;
  inviterName?: string;
  role: string;
}

export const InvitationEmail = ({
  invitationUrl,
  teamName,
  inviterName = 'A team member',
  role,
}: InvitationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Join {teamName} on Family Office</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Join {teamName} on Family Office</Heading>
          <Text style={text}>
            {inviterName} has invited you to join their team on Family Office as a {role.toLowerCase()}.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={invitationUrl}>
              Accept Invitation
            </Button>
          </Section>
          <Text style={text}>
            If you don't want to join the team, you can safely ignore this email.
          </Text>
          <Text style={text}>
            Or copy and paste this URL into your browser:{' '}
            <Link href={invitationUrl} style={link}>
              {invitationUrl}
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
};

const h1 = {
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.25',
  marginBottom: '24px',
  color: '#1a1a1a',
};

const text = {
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '16px 0',
  color: '#3c3c3c',
};

const buttonContainer = {
  margin: '24px 0',
};

const button = {
  backgroundColor: '#000000',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px',
};

const link = {
  color: '#067df7',
  textDecoration: 'none',
};

export const renderInvitationEmail = async (props: InvitationEmailProps) => {
  const { render } = await import('@react-email/render');
  return render(<InvitationEmail {...props} />);
}; 