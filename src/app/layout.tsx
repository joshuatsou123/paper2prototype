import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Paper2Prototype — Turn AI research papers into buildable prototypes',
  description:
    'Upload a machine learning paper and get a model breakdown, dataset guide, implementation checklist, and starter PyTorch code.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-400">
          Paper2Prototype — built with Claude & Next.js
        </footer>
      </body>
    </html>
  );
}
