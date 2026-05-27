import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dwars Bestelapp',
  description: 'Wekelijkse bestelling bij Cafetaria Dwars'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="nl"><body>{children}</body></html>;
}
