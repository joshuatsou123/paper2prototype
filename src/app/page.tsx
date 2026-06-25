import Link from 'next/link';
import {
  Upload,
  Cpu,
  Code2,
  CheckSquare,
  Database,
  ArrowRight,
  Sparkles,
  BookOpen,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: Cpu,
    title: 'Architecture Breakdown',
    description: 'Get a plain-English explanation of the model architecture with implementation notes.',
  },
  {
    icon: Database,
    title: 'Dataset Guide',
    description: 'Know exactly what datasets to find and how to preprocess them.',
  },
  {
    icon: CheckSquare,
    title: 'Implementation Checklist',
    description: 'Step-by-step checklist covering everything from data loading to evaluation.',
  },
  {
    icon: Code2,
    title: 'PyTorch Starter Code',
    description: 'Ready-to-run skeleton code based on the paper\'s described method.',
  },
  {
    icon: BookOpen,
    title: 'Missing Details Flagged',
    description: 'Know upfront what the paper left vague, so you can plan for it.',
  },
  {
    icon: Zap,
    title: 'Difficulty Score',
    description: 'Easy / Medium / Hard rating so you know what you\'re getting into.',
  },
];

const steps = [
  { icon: Upload, label: 'Upload', desc: 'Drop any AI/ML paper PDF' },
  { icon: Sparkles, label: 'Analyze', desc: 'Claude reads and extracts the method' },
  { icon: Code2, label: 'Build', desc: 'Get your prototype plan & starter code' },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-brand-900 to-slate-900 px-4 py-24 text-center sm:py-32">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl">
          <Badge variant="secondary" className="mb-6 bg-white/10 text-white border-white/20">
            <Sparkles className="h-3 w-3 mr-1" />
            Powered by Claude
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Turn AI research papers
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
              into buildable prototypes.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            Upload a machine learning paper and instantly get a model breakdown, dataset guide,
            implementation checklist, and starter PyTorch code — tailored for students and junior researchers.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/upload">
              <Button size="lg" className="gap-2 text-base shadow-lg shadow-brand-500/30">
                <Upload className="h-5 w-5" />
                Upload a Paper
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/history">
              <Button size="lg" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20 text-base">
                View History
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-slate-200 bg-white px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-slate-900">How it works</h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.label} className="flex flex-col items-center text-center">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100">
                  <step.icon className="h-7 w-7 text-brand-600" />
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{step.label}</h3>
                <p className="mt-1 text-sm text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold text-slate-900">Everything you need to reproduce a paper</h2>
          <p className="mt-2 text-center text-slate-500">
            Paper2Prototype extracts the implementation details researchers often gloss over.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="transition-shadow hover:shadow-md">
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                    <f.icon className="h-5 w-5 text-brand-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">{f.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Example output preview */}
      <section className="border-t border-slate-200 bg-slate-900 px-4 py-16 text-white">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold">Example output</h2>
          <p className="mt-2 text-center text-slate-400 text-sm">
            What you get after uploading a paper
          </p>
          <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-800 p-6 font-mono text-sm space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="opacity-50">title:</span>
              <span>&quot;Attention Is All You Need&quot;</span>
            </div>
            <div className="flex items-start gap-2 text-sky-400">
              <span className="opacity-50 shrink-0">difficulty:</span>
              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-amber-400">Medium</span>
            </div>
            <div className="text-slate-300">
              <span className="text-slate-500">checklist: </span>
              <span>[</span>
            </div>
            <div className="pl-4 space-y-1 text-slate-400">
              <div>&quot;1. Implement multi-head self-attention&quot;,</div>
              <div>&quot;2. Add positional encodings&quot;,</div>
              <div>&quot;3. Stack N=6 encoder/decoder layers&quot;,</div>
              <div className="text-slate-600">&hellip;</div>
            </div>
            <div className="text-slate-300">]</div>
            <div className="text-purple-400">
              <span className="opacity-50">starterCode: </span>
              <span>&quot;import torch\nimport torch.nn as nn\n...&quot;</span>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Link href="/upload">
              <Button size="lg" className="gap-2">
                Try it now — it&apos;s free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
