import { format } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { Clock, Calendar, AlertCircle, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { ContentSection, BlogPost } from '../types/blog';

// Mock components since we don't have the full project structure
const CodeBlock = ({ code, language }: { code: string; language: string }) => (
    <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto">
        <code className={`language-${language}`}>{code}</code>
    </pre>
);

const parseMarkdownLinks = (text: string) => {
    // Simple mock implementation
    return text;
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
                return <p className="mb-6 text-gray-800 dark:text-gray-200 leading-relaxed break-words">{parseMarkdownLinks(section.content)}</p>;
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
                        className={`${headingClasses} text-gray-900 dark:text-gray-100 scroll-mt-20 break-words`}
                    >
                        {parseMarkdownLinks(section.content)}
                    </HeadingTag>
                );
            case 'link':
                return (
                    <a href={section.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline break-words mb-6">
                        {section.content} →
                    </a>
                );
            case 'divider':
                return <hr className="my-8 border-t border-gray-200 dark:border-gray-700" />;
            case 'image':
                return (
                    <figure className="my-8">
                        <img src={section.url} alt={section.alt} className="w-full rounded-lg shadow-lg" loading="lazy" />
                        {section.caption && (
                            <figcaption className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                                {section.caption}
                            </figcaption>
                        )}
                    </figure>
                );
            case 'quote':
                return (
                    <blockquote className="my-8 pl-4 border-l-4 border-indigo-500 dark:border-indigo-400">
                        <p className="text-lg italic text-gray-800 dark:text-gray-200 break-words">{parseMarkdownLinks(section.content)}</p>
                        {(section.author || section.source) && (
                            <footer className="mt-2 text-sm text-gray-600 dark:text-gray-400 break-words">
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
                            <li key={index} className="text-gray-800 dark:text-gray-200 break-words">{parseMarkdownLinks(item)}</li>
                        ))}
                    </ListTag>
                );
            case 'table':
                return (
                    <div className="my-8 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            {section.caption && (
                                <caption className="mb-2 text-sm text-gray-600 dark:text-gray-400">{section.caption}</caption>
                            )}
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    {section.headers.map((header, index) => (
                                        <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            {parseMarkdownLinks(header)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {section.rows.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {row.map((cell, cellIndex) => (
                                            <td key={cellIndex} className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200 break-words">
                                                {parseMarkdownLinks(cell)}
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
                    info: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-800 dark:text-blue-200', icon: AlertCircle },
                    warning: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-800 dark:text-yellow-200', icon: AlertTriangle },
                    success: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', text: 'text-green-800 dark:text-green-200', icon: CheckCircle },
                    error: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-800 dark:text-red-200', icon: XCircle },
                }[section.variant];
                const Icon = alertStyles.icon;
                return (
                    <div className={`my-6 p-4 rounded-lg border ${alertStyles.bg} ${alertStyles.border}`}>
                        <div className="flex">
                            <Icon className={`h-5 w-5 ${alertStyles.text} mr-3 flex-shrink-0 mt-0.5`} />
                            <div className={`${alertStyles.text} break-words flex-1`}>{parseMarkdownLinks(section.content)}</div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
            <main className="flex-grow pt-24 pb-16">
                <article className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <header className="max-w-4xl mx-auto text-center mb-12">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                                {post.category}
                            </span>
                            <span className="text-gray-300 dark:text-gray-700">•</span>
                            <span className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <Clock className="w-4 h-4 mr-1.5" />
                                {post.readTime} {content.readTime}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight mb-6 break-words">
                            {post.title}
                        </h1>
                        <div className="flex items-center justify-center gap-4 text-gray-500 dark:text-gray-400 text-sm">
                            <div className="flex items-center">
                                <span className="font-medium text-gray-900 dark:text-gray-200">Mustafa Kürşad BAŞER</span>
                            </div>
                            <span className="text-gray-300 dark:text-gray-700">•</span>
                            <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1.5" />
                                {post.publishedAt ? format(new Date(post.publishedAt), content.publishedAt, { locale: dateLocale }) : 'Tarih yok'}
                            </span>
                        </div>
                    </header>

                    {/* Featured Image */}
                    {post.imageUrl && (
                        <div className="max-w-5xl mx-auto mb-16">
                            <div className="relative aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-gray-900">
                                <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-12 gap-8 lg:gap-12 max-w-7xl mx-auto">
                        {/* Main Content */}
                        <div className="col-span-12 lg:col-span-8 lg:col-start-3">
                            <div className="prose prose-lg prose-indigo dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-lg prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800 dark:prose-pre:bg-gray-900/50 dark:prose-pre:border-gray-800">
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
