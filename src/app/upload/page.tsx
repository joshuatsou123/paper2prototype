import { FileUpload } from '@/components/FileUpload';
import { Brain, Clock, Shield } from 'lucide-react';

export const metadata = {
  title: 'Upload Paper — Paper2Prototype',
};

const hints = [
  { icon: Clock, text: 'Processing takes 30–60 seconds depending on paper length' },
  { icon: Brain, text: 'Works best with AI/ML papers that describe a concrete method' },
  { icon: Shield, text: 'Max file size is 10 MB. Scanned/image-only PDFs may not extract well' },
];

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Upload a Research Paper</h1>
        <p className="mt-3 text-slate-500">
          Drop a PDF and we&apos;ll generate a complete prototype plan with starter code.
        </p>
      </div>

      <FileUpload />

      <div className="mt-8 space-y-2">
        {hints.map((h) => (
          <div key={h.text} className="flex items-start gap-2.5 text-sm text-slate-500">
            <h.icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <span>{h.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
