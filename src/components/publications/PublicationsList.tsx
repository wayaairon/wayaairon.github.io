'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    BookOpenIcon,
    ClipboardDocumentIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import { Publication } from '@/types/publication';
import { PublicationPageConfig } from '@/types/page';
import SectionLayout from '@/components/pages/SectionLayout';
import { useMessages } from '@/lib/i18n/useMessages';
import FormattedBibTeXText from './FormattedBibTeXText';

interface PublicationsListProps {
    config: PublicationPageConfig;
    publications: Publication[];
    embedded?: boolean;
}

const resourceClass = 'inline-flex items-center rounded border border-neutral-300 px-2 py-1 text-xs font-medium text-primary hover:bg-neutral-100 aria-expanded:bg-neutral-100';

function publicationVenue(pub: Publication) {
    const venue = pub.journal || pub.conference || '';
    const hasYear = venue.split(/\D+/).includes(String(pub.year));
    const venueAndYear = hasYear ? venue : [venue, pub.year].filter(Boolean).join(' · ');
    return [venueAndYear, pub.note].filter(Boolean).join(' · ');
}

export default function PublicationsList({ config, publications, embedded = false }: PublicationsListProps) {
    const messages = useMessages();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
    const [selectedType, setSelectedType] = useState<string | 'all'>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [expandedBibtexId, setExpandedBibtexId] = useState<string | null>(null);
    const [expandedAbstractId, setExpandedAbstractId] = useState<string | null>(null);

    // Extract unique years and types for filters
    const years = useMemo(() => {
        const uniqueYears = Array.from(new Set(publications.map(p => p.year)));
        return uniqueYears.sort((a, b) => b - a);
    }, [publications]);

    const types = useMemo(() => {
        const uniqueTypes = Array.from(new Set(publications.map(p => p.type)));
        return uniqueTypes.sort();
    }, [publications]);

    // Filter publications
    const filteredPublications = useMemo(() => {
        return publications.filter(pub => {
            const matchesSearch =
                pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pub.authors.some(author => author.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                pub.journal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pub.conference?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesYear = selectedYear === 'all' || pub.year === selectedYear;
            const matchesType = selectedType === 'all' || pub.type === selectedType;

            return matchesSearch && matchesYear && matchesType;
        });
    }, [publications, searchQuery, selectedYear, selectedType]);

    const controls = (
        <div className="mt-5 max-w-sm space-y-2">
            <div className="relative">
                <MagnifyingGlassIcon aria-hidden="true" className="absolute left-2.5 top-2.5 size-4 text-neutral-500" />
                <input
                    type="search"
                    aria-label={messages.publications.searchPlaceholder}
                    placeholder={messages.publications.searchPlaceholder}
                    value={searchQuery}
                    onChange={event => setSearchQuery(event.target.value)}
                    className="h-9 w-full rounded border border-neutral-300 bg-background pl-8 pr-2 text-sm text-primary focus-visible:outline-accent"
                />
            </div>
            <button
                aria-expanded={showFilters}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1.5 py-1 text-sm text-neutral-600 hover:text-primary"
            >
                <FunnelIcon className="size-4" />{messages.publications.filters}
            </button>
            {showFilters && (
                <div className="grid gap-2 text-sm text-neutral-600">
                    <label>
                        {messages.publications.year}
                        <select aria-label={messages.publications.year} className="mt-1 block w-full rounded border border-neutral-300 bg-background p-1 text-primary" value={selectedYear}
                            onChange={event => setSelectedYear(event.target.value === 'all' ? 'all' : Number(event.target.value))}>
                            <option value="all">{messages.common.all}</option>
                            {years.map(year => <option key={year} value={year}>{year}</option>)}
                        </select>
                    </label>
                    <label>
                        {messages.publications.type}
                        <select aria-label={messages.publications.type} className="mt-1 block w-full rounded border border-neutral-300 bg-background p-1 text-primary" value={selectedType}
                            onChange={event => setSelectedType(event.target.value)}>
                            <option value="all">{messages.common.all}</option>
                            {types.map(type => <option key={type} value={type}>{type.replace('-', ' ')}</option>)}
                        </select>
                    </label>
                </div>
            )}
        </div>
    );

    return (
        <SectionLayout config={config} embedded={embedded} controls={controls}>
            <div className="min-w-0 divide-y divide-neutral-200">
                {filteredPublications.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500">
                        {messages.publications.noResults}
                    </div>
                ) : (
                    filteredPublications.map(pub => (
                        <article key={pub.id} className="py-6 first:pt-0">
                            <div className="flex flex-col md:flex-row gap-6">
                                {pub.preview && (
                                    <div className="w-full md:w-48 flex-shrink-0">
                                        <div className="aspect-video md:aspect-[4/3] relative rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                                            <Image
                                                src={`/papers/${pub.preview}`}
                                                alt={pub.title}
                                                fill
                                                className="object-contain"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="mb-2 text-sm font-semibold text-[#896529] dark:text-accent">
                                        {publicationVenue(pub)}
                                    </p>
                                    <h2 className={`${embedded ? 'text-xl' : 'text-2xl'} mb-2 font-serif font-bold leading-tight text-primary`}>
                                        <FormattedBibTeXText nodes={pub.titleNodes} fallback={pub.title} />
                                    </h2>
                                    <p className={`${embedded ? "text-sm" : "text-base"} text-neutral-600 dark:text-neutral-400 mb-2`}>
                                        {pub.authors.map((author, idx) => (
                                            <span key={idx}>
                                                <span className={`${author.isHighlighted ? 'font-semibold text-primary' : ''} ${author.isCoAuthor ? `underline underline-offset-4 ${author.isHighlighted ? 'decoration-accent' : 'decoration-neutral-400'}` : ''}`}>
                                                    {author.name}
                                                </span>
                                                {author.isCorresponding && (
                                                    <sup className={`ml-0 ${author.isHighlighted ? 'text-accent' : 'text-neutral-600 dark:text-neutral-400'}`}>†</sup>
                                                )}
                                                {idx < pub.authors.length - 1 && ', '}
                                            </span>
                                        ))}
                                    </p>
                                    {pub.description && (
                                        <p className="text-sm text-neutral-600 dark:text-neutral-500 mb-3 leading-relaxed">
                                            {pub.description}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap gap-2">
                                        {pub.url && (
                                            <a
                                                href={pub.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={resourceClass}
                                            >
                                                <DocumentTextIcon className="h-3 w-3 mr-1.5" />
                                                PDF
                                            </a>
                                        )}
                                        {pub.doi && (
                                            <a
                                                href={`https://doi.org/${pub.doi}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={resourceClass}
                                            >
                                                DOI
                                            </a>
                                        )}
                                        {pub.code && (
                                            <a
                                                href={pub.code}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={resourceClass}
                                            >
                                                {messages.publications.code}
                                            </a>
                                        )}
                                        {pub.abstract && (
                                            <button
                                                onClick={() => setExpandedAbstractId(expandedAbstractId === pub.id ? null : pub.id)}
                                                aria-expanded={expandedAbstractId === pub.id}
                                                className={resourceClass}
                                            >
                                                <DocumentTextIcon className="h-3 w-3 mr-1.5" />
                                                {messages.publications.abstract}
                                            </button>
                                        )}
                                        {pub.bibtex && (
                                            <button
                                                onClick={() => setExpandedBibtexId(expandedBibtexId === pub.id ? null : pub.id)}
                                                aria-expanded={expandedBibtexId === pub.id}
                                                className={resourceClass}
                                            >
                                                <BookOpenIcon className="h-3 w-3 mr-1.5" />
                                                {messages.publications.bibtex}
                                            </button>
                                        )}
                                    </div>

                                    <AnimatePresence>
                                        {expandedAbstractId === pub.id && pub.abstract ? (
                                            <motion.div
                                                key="abstract"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="overflow-hidden mt-4"
                                            >
                                                <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
                                                    <p className="text-sm text-neutral-600 dark:text-neutral-500 leading-relaxed">
                                                        {pub.abstract}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ) : null}
                                        {expandedBibtexId === pub.id && pub.bibtex ? (
                                            <motion.div
                                                key="bibtex"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="overflow-hidden mt-4"
                                            >
                                                <div className="relative bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
                                                    <pre className="text-xs text-neutral-600 dark:text-neutral-500 overflow-x-auto whitespace-pre-wrap break-all pr-7 font-mono">
                                                        {pub.bibtex}
                                                    </pre>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(pub.bibtex || '');
                                                        }}
                                                        className="absolute top-2 right-2 p-1.5 rounded-md bg-white dark:bg-neutral-700 text-neutral-500 hover:text-accent shadow-sm border border-neutral-200 dark:border-neutral-600 transition-colors"
                                                        title={messages.common.copyToClipboard}
                                                    >
                                                        <ClipboardDocumentIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ) : null}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </article>
                    ))
                )}
            </div>
        </SectionLayout>
    );
}
