import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import type { BasePageConfig } from '@/types/page';

interface SectionLayoutProps {
  config: BasePageConfig;
  embedded: boolean;
  controls?: ReactNode;
  children: ReactNode;
}

export default function SectionLayout({ config, embedded, controls, children }: SectionLayoutProps) {
  const columns = config.type === 'publication' ? 'lg:grid-cols-[15rem_minmax(0,1fr)]' : 'lg:grid-cols-[12rem_minmax(0,1fr)]';
  return (
    <div className={`grid items-start gap-y-6 border-t border-neutral-300 pt-6 lg:gap-x-10 ${columns}`}>
      <header>
        <h1 className={`font-serif font-bold text-primary ${embedded ? 'text-2xl' : 'text-4xl'}`}>{config.title}</h1>
        {config.description && (
          <div className="mt-2 text-sm leading-relaxed text-neutral-600">
            <ReactMarkdown>{config.description}</ReactMarkdown>
          </div>
        )}
        {controls}
      </header>
      {children}
    </div>
  );
}
