import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Habla Cadabra — Spanish Verb Conjugation Trainer',
  description:
    'A fast, mobile-first flashcard trainer for Spanish verb conjugations. Practice present tense with 500+ verbs.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
