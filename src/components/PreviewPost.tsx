import { format } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { Clock, Calendar, AlertCircle, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { ContentSection, BlogPost } from '../types/blog';
import YouTubeEmbed from './YouTubeEmbed';

// Mock components since we don't have the full project structure
const CodeBlock = ({ code, language }: { code: string; language: string }) => (
    <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto border border-slate-800">
        <code className={`language-${language} text-sm`}>{code}</code>
    </pre>
);

// Simple markdown parser for inline styles
const parseMarkdown = (text: string) => {
    // Split by patterns: code, link, bold, italic, strikethrough
    // Order matters: code first, then link to prevent bold/italic inside link url being parsed incorrectly
    const parts = text.split(/(`[^`]+`|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|_[^_]+_|~[^~]+~)/g);

    return parts.map((part, index) => {
        // Code: `text`
        if (part.startsWith('`') && part.endsWith('`')) {
            return (
                <code key={index} className="px-1.5 py-0.5 mx-0.5 rounded-md bg-slate-800 text-red-400 font-mono text-sm font-medium">
                    {part.slice(1, -1)}
                </code>
            );
        }
        // Link: [text](url)
        if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
            const matches = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
            if (matches) {
                return (
                    <a
                        key={index}
                        href={matches[2]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                        {parseMarkdown(matches[1])}
                    </a>
                );
            }
        }
        // Bold: **text**
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
        }
        // Italic: _text_
        if (part.startsWith('_') && part.endsWith('_')) {
            return <em key={index} className="italic">{part.slice(1, -1)}</em>;
        }
        // Strikethrough: ~text~
        if (part.startsWith('~') && part.endsWith('~')) {
            return <del key={index} className="line-through opacity-70">{part.slice(1, -1)}</del>;
        }
        // Normal text
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
                return <p className="mb-6 text-slate-700 dark:text-slate-300 leading-relaxed break-words">{parseMarkdown(section.content)}</p>;
            case 'code':
                return <CodeBlock code={section.content} language={section.language} />;
            case 'heading':
                const HeadingTag = `h${section.level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
                const headingClasses = {
                    1: 'text-4xl font-bold mb-8',
                    2: 'text-3xl font-bold mb-6',
                    3: 'text-2xl font-bold mb-4',
                    4: 'text-xl font-bold mb-4',
                    5: 'text-lg font-bold mb-3',
                    6: 'text-base font-bold mb-3',
                }[section.level];
                return (
                    <HeadingTag id={section.content.toLowerCase().replace(/\s+/g, '-')}
                        className={`${headingClasses} text-slate-900 dark:text-white scroll-mt-20 break-words`}
                    >
                        {parseMarkdown(section.content)}
                    </HeadingTag>
                );
            case 'link':
                return (
                    <a href={section.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline break-words mb-6">
                        {section.content} →
                    </a>
                );
            case 'divider':
                return <hr className="my-8 border-t border-slate-200 dark:border-slate-700" />;
            case 'image':
                return (
                    <figure className="my-8">
                        <img src={section.url} alt={section.alt} className="w-full rounded-lg shadow-md" loading="lazy" />
                        {section.caption && (
                            <figcaption className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400">
                                {section.caption}
                            </figcaption>
                        )}
                    </figure>
                );
            case 'quote':
                return (
                    <blockquote className="my-8 pl-4 border-l-4 border-indigo-500 dark:border-indigo-400">
                        <p className="text-lg italic text-slate-700 dark:text-slate-300 break-words">{parseMarkdown(section.content)}</p>
                        {(section.author || section.source) && (
                            <footer className="mt-2 text-sm text-slate-500 dark:text-slate-400 break-words">
                                {section.author && <span className="font-medium">{section.author}</span>}
                                {section.author && section.source && <span className="mx-1">•</span>}
                                {section.source && <cite>{section.source}</cite>}
                            </footer>
                        )}
                    </blockquote>
                );
            case 'list':
                const ListTag = section.ordered ? 'ol' : 'ul';
                return (
                    <ListTag className={`my-6 pl-6 space-y-2 ${section.ordered ? 'list-decimal' : 'list-disc'}`}>
                        {section.items.map((item, index) => (
                            <li key={index} className="text-slate-700 dark:text-slate-300 break-words">{parseMarkdown(item)}</li>
                        ))}
                    </ListTag>
                );
            case 'table':
                return (
                    <div className="my-8 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            {section.caption && (
                                <caption className="mb-2 text-sm text-slate-500 dark:text-slate-400">{section.caption}</caption>
                            )}
                            <thead className="bg-slate-50 dark:bg-slate-800">
                                <tr>
                                    {section.headers.map((header, index) => (
                                        <th key={index} className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                            {parseMarkdown(header)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                                {section.rows.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        {row.map((cell, cellIndex) => (
                                            <td key={cellIndex} className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 break-words">
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
                    <div className={`my-6 p-4 rounded-lg border ${alertStyles.bg} ${alertStyles.border}`}>
                        <div className="flex">
                            <Icon className={`h-5 w-5 ${alertStyles.text} mr-3 flex-shrink-0 mt-0.5`} />
                            <div className={`${alertStyles.text} break-words flex-1`}>{parseMarkdown(section.content)}</div>
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
        <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900">
            <main className="flex-grow pt-16 pb-16">
                <article className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <header className="max-w-4xl mx-auto text-center mb-12">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-sm font-medium border border-indigo-100 dark:border-indigo-900">
                                {post.category}
                            </span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="inline-flex items-center text-sm text-slate-500 dark:text-slate-400">
                                <Clock className="w-4 h-4 mr-1.5" />
                                {post.readTime} {content.readTime}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight mb-6 break-words">
                            {post.title}
                        </h1>
                        <div className="flex items-center justify-center gap-4 text-slate-500 dark:text-slate-400 text-sm">
                            <div className="flex items-center">
                                <span className="font-medium text-slate-900 dark:text-slate-200">Mustafa Kürşad BAŞER</span>
                            </div>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1.5" />
                                {post.publishedAt ? format(new Date(post.publishedAt), content.publishedAt, { locale: dateLocale }) : 'Tarih yok'}
                            </span>
                        </div>
                    </header>

                    {/* Featured Image */}
                    {post.imageUrl && (
                        <div className="max-w-5xl mx-auto mb-16">
                            <div className="relative aspect-[21/9] rounded-xl overflow-hidden shadow-lg bg-slate-100 dark:bg-slate-800">
                                <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-12 gap-8 lg:gap-12 max-w-7xl mx-auto">
                        {/* Main Content */}
                        <div className="col-span-12 lg:col-span-8 lg:col-start-3">
                            <div className="prose prose-lg prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-md prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800">
                                {post.content.map((section, index) => (
                                    <div key={index}>
                                        {renderContent(section)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </article>
            </main>
        </div>
    );
}
