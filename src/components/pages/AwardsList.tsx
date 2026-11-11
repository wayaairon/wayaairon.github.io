import { ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { CardPageConfig } from '@/types/page';
import SectionLayout from './SectionLayout';
import styles from './AwardsList.module.css';

export default function AwardsList({ config, embedded }: { config: CardPageConfig; embedded: boolean }) {
  return (
    <SectionLayout config={config} embedded={embedded}>
      <ol className="min-w-0">
        {config.items.map((item, index) => {
          const hasDetails = Boolean(item.content || item.tags?.length);
          const label = (
            <>
              <span className="min-w-0">
                <strong className="font-semibold text-primary">{item.title}</strong>
                {item.subtitle && <span className="block text-sm text-neutral-600 sm:inline sm:text-base"><span className="hidden sm:inline">, </span>{item.subtitle}</span>}
              </span>
              <span className="flex items-center gap-1.5 pt-0.5 text-sm tabular-nums text-neutral-500">
                {item.date}
                {hasDetails && <ChevronDown size={13} aria-hidden="true" className="group-open:rotate-180 motion-safe:transition-transform" />}
              </span>
            </>
          );

          return (
            <li key={`${item.date}-${item.title}-${index}`} className={styles.entry}>
              {hasDetails ? (
                <details className="group">
                  <summary className={`${styles.row} cursor-pointer rounded-sm outline-offset-2 hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-accent`}>
                    {label}
                  </summary>
                  <div className="pb-3 pl-1 pr-5 text-sm leading-relaxed text-neutral-600 [&_a]:underline">
                    {item.content && <ReactMarkdown>{item.content}</ReactMarkdown>}
                    {item.tags?.length ? <p className="mt-1">{item.tags.join(' · ')}</p> : null}
                  </div>
                </details>
              ) : <div className={styles.row}>{label}</div>}
            </li>
          );
        })}
      </ol>
    </SectionLayout>
  );
}
