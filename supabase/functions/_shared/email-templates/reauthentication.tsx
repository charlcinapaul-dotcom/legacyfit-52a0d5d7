/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your LegacyFit verification code.</Preview>
    <Body style={main}>
      <Container style={container}>
        <div style={logoWrap}>
          <Img
            src="https://utfexhdncajccdpvquky.supabase.co/storage/v1/object/public/email-assets/legacyfit-logo.png"
            alt="LegacyFit"
            width="160"
            style={logo}
          />
        </div>
        <div style={divider} />
        <Heading style={h1}>Verify your identity.</Heading>
        <Text style={text}>Use the code below to confirm your LegacyFit account:</Text>
        <div style={codeBox}>
          <Text style={codeStyle}>{token}</Text>
        </div>
        <Text style={footer}>
          This code expires shortly. If you didn't request this, you can safely ignore this email.
        </Text>
        <Text style={tagline}>Seasoned. Strong. Still Moving.</Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, "Times New Roman", serif' }
const container = { maxWidth: '520px', margin: '0 auto', padding: '40px 32px', backgroundColor: '#ffffff' }
const logoWrap = { textAlign: 'center' as const, marginBottom: '24px' }
const logo = { display: 'inline-block' }
const divider = { borderTop: '2px solid #D4AF37', marginBottom: '32px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1a1a1a', margin: '0 0 20px', letterSpacing: '0.5px' }
const text = { fontSize: '15px', color: '#444444', lineHeight: '1.7', margin: '0 0 20px' }
const codeBox = { background: '#f9f6ed', border: '1px solid #D4AF37', borderRadius: '6px', padding: '20px', textAlign: 'center' as const, margin: '24px 0' }
const codeStyle = { fontFamily: 'Courier, monospace', fontSize: '32px', fontWeight: 'bold' as const, color: '#1a1a1a', margin: '0', letterSpacing: '6px' }
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 8px', lineHeight: '1.5' }
const tagline = { fontSize: '11px', color: '#D4AF37', margin: '0', letterSpacing: '2px', textTransform: 'uppercase' as const }
