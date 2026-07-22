import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Dwars Bestelapp',
  description: 'Bestel jouw lunch eenvoudig bij Cafetaria Dwars.',
  applicationName: 'Dwars',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Dwars'
  },
  formatDetection: {
    telephone: false
  }
};

export const viewport: Viewport = {
  themeColor: '#c24a2e',
  colorScheme: 'light dark'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}