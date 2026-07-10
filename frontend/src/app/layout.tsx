import type { Metadata } from 'next';
import '@/styles/tokens.css';

export const metadata: Metadata = {
  title: 'MSME Financial Health Card',
  description: 'Consent-driven alternate-data credit decision support for MSME financial inclusion',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
