'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  title: string;
  content: string;
  className?: string;
  titleClassName?: string;
  children?: React.ReactNode;
}

export function SectionCard({ title, content, className, titleClassName, children }: SectionCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className={cn('relative', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={cn('text-base', titleClassName)}>{title}</CardTitle>
          <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8 shrink-0">
            {copied ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {children ?? (
          <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{content}</p>
        )}
      </CardContent>
    </Card>
  );
}
