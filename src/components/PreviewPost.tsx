import { format } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { Clock, Calendar, AlertCircle, AlertTriangle, CheckCircle, XCircle, FileText } from 'lucide-react';
import type { ContentSection, BlogPost } from '../types/blog';
import YouTubeEmbed from './YouTubeEmbed';

// Code block with file-tab look
const CodeBlock = ({ code, language }: { code: string; language: string }) => (
    <div className="my-8 rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700 shadow-sm">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-800 dark:bg-surface-950 border-b border-surface-700">
            <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="ml-2 text-xs font-mono font-medium text-surface-400 uppercase tracking-wider">{language}</span>
        </div>
        <pre className="bg-surface-900 dark:bg-surface-950 text-surface-100 p-5 overflow-x-auto">
            <code className={`language-${language} text-sm font-mono leading-relaxed`}>{code}</code>
        </pre>
    </div>
);

// Simple markdown parser for inline styles
const parseMarkdown = (text: string) => {
    const parts = text.split(/(`[^`]+`|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|_[^_]+_|~[^~]+~)/g);

    return parts.map((part, index) => {
        if (part.startsWith('`') && part.endsWith('`')) {
            return (
                <code key={index} className="px-1.5 py-0.5 mx-0.5 rounded-md bg-surface-100 dark:bg-surface-800 text-accent-700 dark:text-accent-300 font-mono text-sm font-medium">
                    {part.slice(1, -1)}
                </code>
            );
        }
        if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
            const matches = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
            if (matches) {
                return (
                    <a
                        key={index}
                        href={matches[2]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-600 dark:text-accent-400 hover:underline font-medium"
                    >
                        {parseMarkdown(matches[1])}
                    </a>
                );
            }
        }
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="font-bold text-surface-900 dark:text-white">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('_') && part.endsWith('_')) {
            return <em key={index} className="italic">{part.slice(1, -1)}</em>;
        }
        if (part.startsWith('~') && part.endsWith('~')) {
            return <del key={index} className="line-through opacity-70">{part.slice(1, -1)}</del>;
        }
        return part;
    });
};

const blogPostContent = {
    tr: {
        readTime: 'dk okuma',
        similarPosts: 'Benzer Yazılar',
        publishedAt: 'd MMMM yyyy',
        timeFormat: 'HH:mm',
    },
    en: {
        readTime: 'min read',
        similarPosts: 'Similar Posts',
        publishedAt: 'MMMM d, yyyy',
        timeFormat: 'HH:mm',
    },
};

interface PreviewPostProps {
    post: BlogPost;
    language?: 'tr' | 'en';
}

export default function PreviewPost({ post, language = 'tr' }: PreviewPostProps) {
    const content = blogPostContent[language];
    const dateLocale = language === 'tr' ? tr : enUS;

    function renderContent(section: ContentSection) {
        switch (section.type) {
            case 'text':
                return <p className="mb-6 text-surface-700 dark:text-surface-200 leading-[1.85] break-words text-[17px]">{parseMarkdown(section.content)}</p>;
            case 'code':
                return <CodeBlock code={section.content} language={section.language} />;
            case 'heading':
                const HeadingTag = `h${section.level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
                const headingClasses = {
                    1: 'text-3xl font-extrabold mb-8',
                    2: 'text-2xl font-bold mb-6 pl-4 border-l-[3px] border-accent-400 dark:border-accent-500',
                    3: 'text-xl font-bold mb-4',
                    4: 'text-lg font-bold mb-4',
                    5: 'text-base font-bold mb-3',
                    6: 'text-sm font-bold mb-3 uppercase tracking-wider',
                }[section.level];
                return (
                    <HeadingTag id={section.content.toLowerCase().replace(/\s+/g, '-')}
                        className={`${headingClasses} font-display text-surface-900 dark:text-white scroll-mt-20 break-words tracking-tight`}
                    >
                        {parseMarkdown(section.content)}
                    </HeadingTag>
                );
            case 'link':
                return (
                    <a href={section.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent-600 dark:text-accent-400 hover:underline break-words mb-6 font-medium text-[17px]">
                        {section.content} <span className="text-xs">→</span>
                    </a>
                );
            case 'divider':
                return (
                    <div className="my-10 flex items-center justify-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-surface-300 dark:bg-surface-600" />
                        <div className="w-1.5 h-1.5 rounded-full bg-surface-300 dark:bg-surface-600" />
                        <div className="w-1.5 h-1.5 rounded-full bg-surface-300 dark:bg-surface-600" />
                    </div>
                );
            case 'image':
                return (
                    <figure className="my-8 -mx-2 sm:mx-0">
                        <img src={section.url} alt={section.alt} className="w-full rounded-xl shadow-md" loading="lazy" />
                        {section.caption && (
                            <figcaption className="mt-3 text-center text-sm text-surface-500 dark:text-surface-400 italic">
                                {section.caption}
                            </figcaption>
                        )}
                    </figure>
                );
            case 'quote':
                return (
                    <blockquote className="my-8 pl-6 border-l-[3px] border-accent-400 dark:border-accent-500">
                        <p className="text-xl font-display italic text-surface-600 dark:text-surface-300 break-words leading-relaxed">{parseMarkdown(section.content)}</p>
                        {(section.author || section.source) && (
                            <footer className="mt-3 text-sm text-surface-500 dark:text-surface-400 break-words not-italic">
                                {section.author && <span className="font-semibold">{section.author}</span>}
                                {section.author && section.source && <span className="mx-2">—</span>}
                                {section.source && <cite className="italic">{section.source}</cite>}
                            </footer>
                        )}
                    </blockquote>
                );
            case 'list':
                const ListTag = section.ordered ? 'ol' : 'ul';
                return (
                    <ListTag className={`my-6 pl-6 space-y-2.5 ${section.ordered ? 'list-decimal' : 'list-disc'} marker:text-surface-400 dark:marker:text-surface-500`}>
                        {section.items.map((item, index) => (
                            <li key={index} className="text-surface-700 dark:text-surface-200 break-words text-[17px] leading-[1.85]">{parseMarkdown(item)}</li>
                        ))}
                    </ListTag>
                );
            case 'table':
                return (
                    <div className="my-8 overflow-x-auto rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm">
                        <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
                            {section.caption && (
                                <caption className="px-6 py-3 text-sm text-surface-500 dark:text-surface-400 text-left">{section.caption}</caption>
                            )}
                            <thead className="bg-surface-50 dark:bg-surface-800">
                                <tr>
                                    {section.headers.map((header, index) => (
                                        <th key={index} className="px-6 py-3.5 text-left text-xs font-semibold text-surface-600 dark:text-surface-300 uppercase tracking-wider">
                                            {parseMarkdown(header)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-surface-900 divide-y divide-surface-100 dark:divide-surface-800">
                                {section.rows.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                                        {row.map((cell, cellIndex) => (
                                            <td key={cellIndex} className="px-6 py-4 text-sm text-surface-700 dark:text-surface-200 break-words">
                                                {parseMarkdown(cell)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'alert':
                const alertStyles = {
                    info: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-900', text: 'text-blue-800 dark:text-blue-300', icon: AlertCircle },
                    warning: { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-900', text: 'text-amber-800 dark:text-amber-300', icon: AlertTriangle },
                    success: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-900', text: 'text-emerald-800 dark:text-emerald-300', icon: CheckCircle },
                    error: { bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-900', text: 'text-red-800 dark:text-red-300', icon: XCircle },
                }[section.variant];
                const Icon = alertStyles.icon;
                return (
                    <div className={`my-6 p-4 rounded-xl border ${alertStyles.bg} ${alertStyles.border}`}>
                        <div className="flex">
                            <Icon className={`h-5 w-5 ${alertStyles.text} mr-3 flex-shrink-0 mt-0.5`} />
                            <div className={`${alertStyles.text} break-words flex-1 text-[15px] leading-relaxed`}>{parseMarkdown(section.content)}</div>
                        </div>
                    </div>
                );
            case 'youtube':
                return (
                    <div className="my-8">
                        <YouTubeEmbed
                            videoId={section.videoId}
                            title={section.title}
                            posterQuality={section.posterQuality}
                        />
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div className="py-8 sm:py-12 px-4 sm:px-6">
            <article className="max-w-4xl mx-auto bg-white dark:bg-surface-900 rounded-2xl shadow-elevated overflow-hidden border border-surface-200/60 dark:border-surface-800">

                {/* Hero Image — full bleed inside card */}
                {post.imageUrl && (
                    <div className="relative aspect-[2/1] overflow-hidden bg-surface-100 dark:bg-surface-800">
                        <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                )}

                {/* Header */}
                <header className="px-6 sm:px-10 lg:px-16 pt-10 pb-8 text-center">
                    <div className="flex items-center justify-center gap-3 mb-5">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-accent-50 dark:bg-accent-950/50 text-accent-600 dark:text-accent-400 text-sm font-medium border border-accent-100 dark:border-accent-900">
                            {post.category}
                        </span>
                        <span className="text-surface-300 dark:text-surface-600">·</span>
                        <span className="inline-flex items-center text-sm text-surface-500 dark:text-surface-400">
                            <Clock className="w-3.5 h-3.5 mr-1.5" />
                            {post.readTime} {content.readTime}
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-surface-900 dark:text-white tracking-tight leading-[1.2] mb-5 break-words">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-center gap-3 text-surface-500 dark:text-surface-400 text-sm">
                        <span className="font-medium text-surface-700 dark:text-surface-200">Mustafa Kürşad BAŞER</span>
                        <span className="text-surface-300 dark:text-surface-600">·</span>
                        <span className="flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-1.5" />
                            {post.publishedAt ? format(new Date(post.publishedAt), content.publishedAt, { locale: dateLocale }) : 'Tarih yok'}
                        </span>
                    </div>

                    {/* Divider */}
                    <div className="mt-8 border-t border-surface-100 dark:border-surface-800" />
                </header>

                {/* Content */}
                <div className="px-6 sm:px-10 lg:px-16 pb-16">
                    {post.content.length > 0 ? (
                        <div>
                            {post.content.map((section, index) => (
                                <div key={index}>
                                    {renderContent(section)}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-16 text-center">
                            <FileText className="w-12 h-12 text-surface-200 dark:text-surface-700 mx-auto mb-4" />
                            <p className="text-surface-400 dark:text-surface-500 text-sm">
                                Start adding content in the Editor tab to see your preview here.
                            </p>
                        </div>
                    )}
                </div>
            </article>
        </div>
    );
}
