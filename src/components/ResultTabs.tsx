'use client';

import { useState } from 'react';
import { Check, Copy, BookOpen, Cpu, Database, Dumbbell, Code2, AlertTriangle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SectionCard } from '@/components/SectionCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { parseJsonField } from '@/lib/utils';
import type { PaperResult } from '@/types/paper';

interface ResultTabsProps {
  paper: PaperResult;
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative rounded-xl bg-slate-900 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700">
        <span className="text-xs font-medium text-slate-400">Python · PyTorch</span>
        <Button variant="ghost" size="sm" onClick={copy} className="h-7 text-slate-400 hover:text-white hover:bg-slate-700 gap-1.5">
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm text-slate-100 font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function ChecklistCard({ items, title }: { items: string[]; title: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(items.map((s, i) => `${i + 1}. ${s}`).join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <Button variant="ghost" size="icon" onClick={copy} className="h-8 w-8">
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ol className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-700">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-600">
                {i + 1}
              </span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

function MissingCard({ items }: { items: string[] }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(items.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            Missing or Unclear Details
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={copy} className="h-8 w-8">
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-amber-900">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function ResultTabs({ paper }: ResultTabsProps) {
  const checklist = parseJsonField<string[]>(paper.implementationChecklist, []);
  const missing = parseJsonField<string[]>(paper.missingDetails, []);

  return (
    <Tabs defaultValue="overview">
      <TabsList className="mb-2">
        <TabsTrigger value="overview">
          <BookOpen className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="architecture">
          <Cpu className="h-4 w-4" />
          Architecture
        </TabsTrigger>
        <TabsTrigger value="dataset">
          <Database className="h-4 w-4" />
          Dataset
        </TabsTrigger>
        <TabsTrigger value="training">
          <Dumbbell className="h-4 w-4" />
          Training
        </TabsTrigger>
        <TabsTrigger value="code">
          <Code2 className="h-4 w-4" />
          Code
        </TabsTrigger>
        <TabsTrigger value="missing">
          <AlertTriangle className="h-4 w-4" />
          Missing Details
        </TabsTrigger>
      </TabsList>

      {/* Overview */}
      <TabsContent value="overview">
        <div className="grid gap-4 md:grid-cols-2">
          <SectionCard title="Research Problem" content={paper.mainProblem} />
          <SectionCard title="Simple Summary" content={paper.summary} />
          <SectionCard title="Key Contribution" content={paper.keyContribution} className="md:col-span-2" />
          <ChecklistCard items={checklist} title="Implementation Checklist" />
          <SectionCard title="Difficulty Reasoning" content={paper.reasonForDifficulty} />
        </div>
      </TabsContent>

      {/* Architecture */}
      <TabsContent value="architecture">
        <div className="grid gap-4">
          <SectionCard title="Model Architecture" content={paper.architecture} />
        </div>
      </TabsContent>

      {/* Dataset */}
      <TabsContent value="dataset">
        <div className="grid gap-4 md:grid-cols-2">
          <SectionCard title="Dataset Requirements" content={paper.datasetRequirements} />
          <SectionCard title="Preprocessing Steps" content={paper.preprocessingSteps} />
        </div>
      </TabsContent>

      {/* Training */}
      <TabsContent value="training">
        <div className="grid gap-4 md:grid-cols-2">
          <SectionCard title="Training Procedure" content={paper.trainingProcedure} />
          <SectionCard title="Loss Function" content={paper.lossFunction} />
          <SectionCard title="Evaluation Metrics" content={paper.evaluationMetrics} />
        </div>
      </TabsContent>

      {/* Code */}
      <TabsContent value="code">
        <div className="grid gap-4">
          <SectionCard title="PyTorch Starter Code" content={paper.starterCode}>
            <CodeBlock code={paper.starterCode} />
          </SectionCard>
        </div>
      </TabsContent>

      {/* Missing Details */}
      <TabsContent value="missing">
        <div className="grid gap-4">
          {missing.length > 0 ? (
            <MissingCard items={missing} />
          ) : (
            <p className="text-sm text-slate-500">No missing details were identified.</p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
