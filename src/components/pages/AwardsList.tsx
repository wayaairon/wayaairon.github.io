import type { CardItem, CardPageConfig } from '@/types/page';
import SectionLayout from './SectionLayout';
import styles from './AwardsList.module.css';

export default function AwardsList({ config, embedded }: { config: CardPageConfig; embedded: boolean }) {
  const awardsByYear = new Map<string, CardItem[]>();
  for (const item of config.items) {
    const year = item.date?.match(/\b\d{4}\b/)?.[0] ?? 'Other';
    const awards = awardsByYear.get(year) ?? [];
    awards.push(item);
    awardsByYear.set(year, awards);
  }

  return (
    <SectionLayout config={config} embedded={embedded}>
      <div className={styles.groups}>
        {Array.from(awardsByYear, ([year, awards]) => (
          <section key={year} aria-label={`Awards in ${year}`}>
            <h2 className={styles.year}>{year}</h2>
            <ol>
              {awards.map((item, index) => (
                <li key={`${item.title}-${index}`} className={styles.entry}>
                  <div className={styles.row}>
                    <strong className="font-semibold text-primary">{item.title}</strong>
                    {item.subtitle && <span className="block text-sm text-neutral-600 sm:inline sm:text-base"><span className="hidden sm:inline">, </span>{item.subtitle}</span>}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </SectionLayout>
  );
}
