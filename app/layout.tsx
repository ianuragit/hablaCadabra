import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Habla Cadabra',
  description: 'Spanish Verb Conjugation Trainer',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
