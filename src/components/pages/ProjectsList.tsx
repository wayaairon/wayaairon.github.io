import ReactMarkdown from 'react-markdown';
import type { CardPageConfig } from '@/types/page';
import SectionLayout from './SectionLayout';

export default function ProjectsList({ config, embedded }: { config: CardPageConfig; embedded: boolean }) {
  return (
    <SectionLayout config={config} embedded={embedded}>
      <div className="grid min-w-0 items-start gap-x-8 gap-y-6 md:grid-cols-2">
        {config.items.map((project, index) => (
          <article key={`${project.title}-${index}`} className="min-w-0 border-t border-neutral-200 pt-3">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-semibold leading-snug text-primary">
                {project.link ? <a className="underline underline-offset-4" href={project.link}>{project.title}</a> : project.title}
              </h2>
              {project.date && <span className="shrink-0 text-xs tabular-nums text-neutral-600">{project.date}</span>}
            </div>
            {project.subtitle && <p className="mt-1 text-sm font-medium text-[#896529] dark:text-accent">{project.subtitle}</p>}
            {project.content && (
              <div className="mt-2 text-sm leading-relaxed text-neutral-600 [&_strong]:text-primary [&_a]:underline">
                <ReactMarkdown>{project.content}</ReactMarkdown>
              </div>
            )}
            {project.tags?.length ? <p className="mt-3 text-xs leading-relaxed text-neutral-500">{project.tags.join(' · ')}</p> : null}
          </article>
        ))}
      </div>
    </SectionLayout>
  );
}
