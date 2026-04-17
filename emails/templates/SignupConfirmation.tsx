import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Img,
} from '@react-email/components'

interface SignupConfirmationEmailProps {
  confirmLink: string
  baseUrl?: string
  email: string
}

const LOGO_URL = 'https://miked.live/og-image.png'

export const SignupConfirmationEmail: React.FC<SignupConfirmationEmailProps> = ({
  confirmLink,
  baseUrl = 'https://miked.live',
  email,
}) => (
  <Html>
    <Head />
    <Preview>Confirm your Miked.live account</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Row>
            <div style={logoContainer}>
              <Img src={LOGO_URL} alt="Miked.live" style={logo} />
              <Text style={logoText}>
                Miked<span style={{ color: '#4f46e5' }}>.live</span>
              </Text>
            </div>
          </Row>
        </Section>

        <Section style={content}>
          <Text style={greeting}>Welcome to Miked.live!</Text>

          <Text style={paragraph}>
            Thanks for signing up. Click the button below to confirm your email address and activate your account:
          </Text>

          <Section style={ctaContainer}>
            <Button style={button} href={confirmLink}>
              Confirm email
            </Button>
          </Section>

          <Text style={{ ...paragraph, fontSize: '13px', color: '#94a3b8' }}>
            This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
          </Text>

          <Text style={closing}>
            Looking forward to seeing your stage plots!<br />– Rik
          </Text>
        </Section>

        <Hr style={hr} />

        <Section style={footer}>
          <Text style={footerText}>
            Questions?{' '}
            <Link href={`${baseUrl}/contact`} style={footerLink}>Get in touch</Link>
            {' '}or{' '}
            <Link href="https://twitter.com/Woesnos" style={footerLink}>reach out on X</Link>
          </Text>
          <Text style={footerText}>
            <Link href={`${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}`} style={footerLink}>
              Unsubscribe from emails
            </Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

const main: React.CSSProperties = {
  backgroundColor: '#0f172a',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
}
const container: React.CSSProperties = { maxWidth: '600px', margin: '0 auto' }
const header: React.CSSProperties = { backgroundColor: '#1e293b', padding: '30px 20px', textAlign: 'center', borderRadius: '12px 12px 0 0' }
const logoContainer: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }
const logo: React.CSSProperties = { width: '60px', height: '60px', display: 'block' }
const logoText: React.CSSProperties = { color: '#ffffff', fontSize: '28px', fontWeight: 'bold', margin: '0' }
const content: React.CSSProperties = { backgroundColor: '#1e293b', padding: '40px', borderRadius: '0 0 12px 12px' }
const greeting: React.CSSProperties = { color: '#ffffff', fontSize: '18px', fontWeight: '600', margin: '0 0 20px 0' }
const paragraph: React.CSSProperties = { color: '#cbd5e1', fontSize: '16px', lineHeight: '1.6', margin: '0 0 20px 0' }
const ctaContainer: React.CSSProperties = { textAlign: 'center', margin: '30px 0' }
const button: React.CSSProperties = { backgroundColor: '#4f46e5', color: '#ffffff', padding: '12px 32px', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', fontSize: '16px', display: 'inline-block' }
const closing: React.CSSProperties = { color: '#94a3b8', fontSize: '16px', lineHeight: '1.6', margin: '30px 0 0 0', fontStyle: 'italic' }
const hr: React.CSSProperties = { borderColor: '#334155', margin: '40px 0' }
const footer: React.CSSProperties = { paddingTop: '20px' }
const footerText: React.CSSProperties = { color: '#64748b', fontSize: '13px', lineHeight: '1.6', margin: '0 0 8px 0' }
const footerLink: React.CSSProperties = { color: '#60a5fa', textDecoration: 'none' }
