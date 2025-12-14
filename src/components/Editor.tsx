import { useState, useEffect, useRef } from 'react';
import type { ContentSection } from '../types/blog';
import {
    Type, Image as ImageIcon, Calendar, Tag, Globe,
    User, FileText, Link as LinkIcon, Clock, Hash,
    Layout, Search, X, Plus, Trash2, GripVertical,
    Bold, Italic, Strikethrough, Code, Settings, PanelLeftOpen, PanelRightOpen, Copy,
    Quote, List, Table, AlertCircle, Heading1, Minus, ChevronUp, ChevronDown, XCircle
} from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

// Sidebar Item Component - Click to add
function SidebarItem({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="group flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all w-full text-left"
        >
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-md group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/50 transition-colors">
                <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 flex-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-sm">
                {label}
            </span>
            <Plus className="w-4 h-4 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-all" />
        </button>
    );
}

// Canvas Item Component
function CanvasItem({ section, onDelete, onDuplicate, onSelect, onMoveUp, onMoveDown, isSelected, isFirst, isLast }: {
    section: ContentSection;
    onDelete: () => void;
    onDuplicate: () => void;
    onSelect: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isSelected: boolean;
    isFirst: boolean;
    isLast: boolean;
}) {
    const getIcon = () => {
        switch (section.type) {
            case 'text': return Type;
            case 'image': return ImageIcon;
            case 'code': return Code;
            case 'quote': return Quote;
            case 'list': return List;
            case 'table': return Table;
            case 'alert': return AlertCircle;
            case 'link': return LinkIcon;
            case 'divider': return Minus;
            case 'heading': return Heading1;
            default: return Type;
        }
    };

    const getPreview = () => {
        switch (section.type) {
            case 'list':
                return section.items.length > 0
                    ? `${section.ordered ? '1.' : '•'} ${section.items[0]}${section.items.length > 1 ? ` (+${section.items.length - 1} more)` : ''}`
                    : 'Empty list...';
            case 'table':
                return `${section.headers.length} columns, ${section.rows.length} rows`;
            case 'divider':
                return 'Horizontal divider';
            case 'image':
                return section.alt || section.url || 'No image';
            default:
                if ('content' in section) {
                    return section.content || 'Empty content...';
                }
                return '';
        }
    };

    const Icon = getIcon();

    return (
        <div
            className={`relative group flex items-start gap-3 p-4 bg-white dark:bg-slate-800 border rounded-lg transition-all cursor-pointer ${isSelected
                ? 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-100 dark:ring-indigo-900/50 shadow-md'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm'
                }`}
            onClick={onSelect}
        >
            {/* Move Controls */}
            <div className="flex flex-col gap-1">
                <button
                    onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                    disabled={isFirst}
                    className={`p-1 rounded transition-colors ${isFirst
                        ? 'opacity-20 cursor-not-allowed'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                    title="Move up"
                >
                    <ChevronUp className="w-4 h-4" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                    disabled={isLast}
                    className={`p-1 rounded transition-colors ${isLast
                        ? 'opacity-20 cursor-not-allowed'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                    title="Move down"
                >
                    <ChevronDown className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded">
                        <Icon className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        {section.type}
                    </span>
                    {section.type === 'list' && (
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                            ({section.ordered ? 'ordered' : 'unordered'})
                        </span>
                    )}
                </div>
                <div className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {getPreview() || <span className="text-slate-400 dark:text-slate-500 italic">Empty...</span>}
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-row gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                    className="p-1.5 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded transition-all"
                    title="Duplicate"
                >
                    <Copy className="w-5 h-5" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-all"
                    title="Delete"
                >
                    <XCircle className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

// Properties Panel Component
const ImagePreview = ({ url }: { url: string }) => {
    const [error, setError] = useState(false);
    useEffect(() => { setError(false); }, [url]);

    if (!url) return null;

    return (
        <div className="mt-3 relative aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center">
            {!error ? (
                <img
                    src={url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => setError(true)}
                />
            ) : (
                <div className="flex flex-col items-center text-slate-400">
                    <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                    <span className="text-[10px] uppercase tracking-wider font-medium">Invalid Image</span>
                </div>
            )}
        </div>
    );
};

function PropertiesPanel({ section, onChange }: { section: ContentSection | null; onChange: (updated: ContentSection) => void }) {
    if (!section) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50/50 dark:bg-slate-900/50">
                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm mb-4 border border-slate-100 dark:border-slate-700">
                    <Settings className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
                </div>
                <h3 className="text-slate-900 dark:text-white font-semibold mb-1">No Selection</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[200px]">Select an element from the canvas to customize its styling and content</p>
            </div>
        );
    }

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const applyFormat = (format: 'bold' | 'italic' | 'strike' | 'code') => {
        const textarea = textareaRef.current;
        if (!textarea || !onChange) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selectedText = text.substring(start, end);

        let wrapper = '';
        switch (format) {
            case 'bold': wrapper = '**'; break;
            case 'italic': wrapper = '_'; break;
            case 'strike': wrapper = '~'; break;
            case 'code': wrapper = '`'; break;
        }

        const newText = text.substring(0, start) + wrapper + selectedText + wrapper + text.substring(end);

        // Update content
        onChange({ ...section, content: newText } as any);

        // Restore focus and selection
        requestAnimationFrame(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(start + wrapper.length, end + wrapper.length);
            }
        });
    };

    const inputClass = "w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all text-slate-900 dark:text-white text-sm shadow-sm";
    const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-0.5";
    const sectionTitleClass = "text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3";



    // List helpers
    const updateListItem = (index: number, value: string) => {
        if (section.type !== 'list') return;
        const newItems = [...section.items];
        newItems[index] = value;
        onChange({ ...section, items: newItems });
    };

    const addListItem = () => {
        if (section.type !== 'list') return;
        onChange({ ...section, items: [...section.items, ''] });
    };

    const removeListItem = (index: number) => {
        if (section.type !== 'list') return;
        const newItems = section.items.filter((_, i) => i !== index);
        onChange({ ...section, items: newItems });
    };

    // Table helpers
    const updateTableHeader = (index: number, value: string) => {
        if (section.type !== 'table') return;
        const newHeaders = [...section.headers];
        newHeaders[index] = value;
        onChange({ ...section, headers: newHeaders });
    };

    const updateTableCell = (rowIndex: number, colIndex: number, value: string) => {
        if (section.type !== 'table') return;
        const newRows = section.rows.map((row, ri) =>
            ri === rowIndex ? row.map((cell, ci) => ci === colIndex ? value : cell) : row
        );
        onChange({ ...section, rows: newRows });
    };

    const addTableColumn = () => {
        if (section.type !== 'table') return;
        const newHeaders = [...section.headers, `Col ${section.headers.length + 1}`];
        const newRows = section.rows.map(row => [...row, '']);
        onChange({ ...section, headers: newHeaders, rows: newRows });
    };

    const removeTableColumn = (colIndex: number) => {
        if (section.type !== 'table' || section.headers.length <= 1) return;
        const newHeaders = section.headers.filter((_, i) => i !== colIndex);
        const newRows = section.rows.map(row => row.filter((_, i) => i !== colIndex));
        onChange({ ...section, headers: newHeaders, rows: newRows });
    };

    const addTableRow = () => {
        if (section.type !== 'table') return;
        const newRow = section.headers.map(() => '');
        onChange({ ...section, rows: [...section.rows, newRow] });
    };

    const removeTableRow = (rowIndex: number) => {
        if (section.type !== 'table') return;
        const newRows = section.rows.filter((_, i) => i !== rowIndex);
        onChange({ ...section, rows: newRows });
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50">
            {/* Header */}
            <div className="flex-none px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                        <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white capitalize">
                            {section.type} Properties
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Configure visual appearance</p>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

                {/* Text, Code, Heading content - Expanded for Text/Code */}
                {(section.type === 'text' || section.type === 'code' || section.type === 'heading') && (
                    <div className={section.type !== 'heading' ? "flex flex-col h-full gap-2" : "space-y-4"}>
                        <div className={section.type !== 'heading' ? "flex-1 flex flex-col min-h-[300px]" : ""}>
                            <div className="flex items-center justify-between mb-2">
                                <label className={labelClass}>Content</label>
                                {/* Text Formatting Toolbar */}
                                {section.type === 'text' && (
                                    <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 shadow-sm">
                                        <button
                                            onClick={() => applyFormat('bold')}
                                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-400 transition-colors"
                                            title="Bold"
                                        >
                                            <Bold className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => applyFormat('italic')}
                                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-400 transition-colors"
                                            title="Italic"
                                        >
                                            <Italic className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => applyFormat('strike')}
                                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-400 transition-colors"
                                            title="Strikethrough"
                                        >
                                            <Strikethrough className="w-4 h-4" />
                                        </button>
                                        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
                                        <button
                                            onClick={() => applyFormat('code')}
                                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-400 transition-colors"
                                            title="Inline Code"
                                        >
                                            <Code className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <textarea
                                ref={textareaRef}
                                value={section.content}
                                onChange={(e) => onChange({ ...section, content: e.target.value } as any)}
                                className={`${inputClass} font-mono leading-relaxed ${section.type !== 'heading' ? 'flex-1 resize-none' : ''}`}
                                rows={section.type === 'heading' ? 3 : undefined}
                                placeholder="Enter your content here..."
                            />
                        </div>
                    </div>
                )}

                {/* Heading Level - Standard */}
                {section.type === 'heading' && (
                    <div>
                        <label className={labelClass}>Heading Level</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[1, 2, 3, 4, 5, 6].map(l => (
                                <button
                                    key={l}
                                    onClick={() => onChange({ ...section, level: l as any })}
                                    className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${section.level === l
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-400 dark:text-indigo-300'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
                                        }`}
                                >
                                    H{l}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Image */}
                {section.type === 'image' && (
                    <div className="space-y-4">
                        <div>
                            <label className={labelClass}>Image URL</label>
                            <input
                                type="text"
                                value={section.url}
                                onChange={(e) => onChange({ ...section, url: e.target.value })}
                                className={inputClass}
                                placeholder="https://example.com/image.jpg"
                            />
                            <ImagePreview url={section.url} />
                        </div>
                        <div>
                            <label className={labelClass}>Alt Text</label>
                            <input
                                type="text"
                                value={section.alt}
                                onChange={(e) => onChange({ ...section, alt: e.target.value })}
                                className={inputClass}
                                placeholder="Describe the image..."
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Caption (optional)</label>
                            <input
                                type="text"
                                value={section.caption || ''}
                                onChange={(e) => onChange({ ...section, caption: e.target.value })}
                                className={inputClass}
                                placeholder="Image caption..."
                            />
                        </div>
                    </div>
                )}

                {/* Code Language */}
                {section.type === 'code' && (
                    <div>
                        <label className={labelClass}>Programming Language</label>
                        <select
                            value={section.language}
                            onChange={(e) => onChange({ ...section, language: e.target.value })}
                            className={inputClass}
                        >
                            <optgroup label="Web Development">
                                <option value="javascript">JavaScript</option>
                                <option value="typescript">TypeScript</option>
                                <option value="html">HTML</option>
                                <option value="css">CSS</option>
                                <option value="jsx">JSX (React)</option>
                                <option value="tsx">TSX (React + TS)</option>
                            </optgroup>
                            <optgroup label="Common">
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                                <option value="csharp">C#</option>
                                <option value="go">Go</option>
                                <option value="rust">Rust</option>
                                <option value="sql">SQL</option>
                                <option value="bash">Bash</option>
                                <option value="json">JSON</option>
                                <option value="markdown">Markdown</option>
                            </optgroup>
                        </select>
                    </div>
                )}

                {/* Quote */}
                {section.type === 'quote' && (
                    <div className="flex flex-col h-full gap-4">
                        <div className="flex-1 flex flex-col min-h-[150px]">
                            <label className={labelClass}>Quote Text</label>
                            <textarea
                                value={section.content}
                                onChange={(e) => onChange({ ...section, content: e.target.value })}
                                className={`${inputClass} flex-1 resize-none`}
                                placeholder="Enter the quote..."
                            />
                        </div>
                        <div className="space-y-4 flex-none">
                            <div>
                                <label className={labelClass}>Author (optional)</label>
                                <input
                                    type="text"
                                    value={section.author || ''}
                                    onChange={(e) => onChange({ ...section, author: e.target.value })}
                                    className={inputClass}
                                    placeholder="Who said this?"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Source (optional)</label>
                                <input
                                    type="text"
                                    value={section.source || ''}
                                    onChange={(e) => onChange({ ...section, source: e.target.value })}
                                    className={inputClass}
                                    placeholder="Book, article, etc."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Alert */}
                {section.type === 'alert' && (
                    <div className="flex flex-col h-full gap-4">
                        <div className="flex-1 flex flex-col min-h-[150px]">
                            <label className={labelClass}>Alert Content</label>
                            <textarea
                                value={section.content}
                                onChange={(e) => onChange({ ...section, content: e.target.value })}
                                className={`${inputClass} flex-1 resize-none`}
                                placeholder="Alert message..."
                            />
                        </div>
                        <div className="flex-none">
                            <label className={labelClass}>Alert Type</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['info', 'success', 'warning', 'error'] as const).map(variant => (
                                    <button
                                        key={variant}
                                        onClick={() => onChange({ ...section, variant })}
                                        className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all border shadow-sm ${section.variant === variant
                                            ? variant === 'info' ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-400 dark:text-blue-300 ring-1 ring-blue-500/20'
                                                : variant === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-400 dark:text-emerald-300 ring-1 ring-emerald-500/20'
                                                    : variant === 'warning' ? 'bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-900/30 dark:border-amber-400 dark:text-amber-300 ring-1 ring-amber-500/20'
                                                        : 'bg-red-50 border-red-500 text-red-700 dark:bg-red-900/30 dark:border-red-400 dark:text-red-300 ring-1 ring-red-500/20'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        {variant.charAt(0).toUpperCase() + variant.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Link */}
                {section.type === 'link' && (
                    <div className="space-y-4">
                        <div>
                            <label className={labelClass}>Link Text</label>
                            <input
                                type="text"
                                value={section.content}
                                onChange={(e) => onChange({ ...section, content: e.target.value })}
                                className={inputClass}
                                placeholder="Click here"
                            />
                        </div>
                        <div>
                            <label className={labelClass}>URL</label>
                            <input
                                type="text"
                                value={section.url}
                                onChange={(e) => onChange({ ...section, url: e.target.value })}
                                className={inputClass}
                                placeholder="https://example.com"
                            />
                        </div>
                    </div>
                )}

                {/* List */}
                {section.type === 'list' && (
                    <div className="space-y-6">
                        <div>
                            <label className={labelClass}>List Type</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onChange({ ...section, ordered: false })}
                                    className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border shadow-sm ${!section.ordered
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-400 dark:text-indigo-300 ring-1 ring-indigo-500/20'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    • Unordered
                                </button>
                                <button
                                    onClick={() => onChange({ ...section, ordered: true })}
                                    className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border shadow-sm ${section.ordered
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-400 dark:text-indigo-300 ring-1 ring-indigo-500/20'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    1. Ordered
                                </button>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className={labelClass.replace('mb-1.5', '')}>List Items</label>
                                <button
                                    onClick={addListItem}
                                    className="px-3 py-1.5 text-xs bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg font-medium flex items-center gap-1.5 transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add
                                </button>
                            </div>
                            <div className="space-y-2.5">
                                {section.items.map((item, index) => (
                                    <div key={index} className="flex gap-2 items-center group">
                                        <span className="flex-none flex items-center justify-center w-6 text-sm text-slate-400 dark:text-slate-500 font-medium">
                                            {section.ordered ? `${index + 1}.` : '•'}
                                        </span>
                                        <input
                                            type="text"
                                            value={item}
                                            onChange={(e) => updateListItem(index, e.target.value)}
                                            className={`${inputClass} flex-1`}
                                            placeholder={`Item ${index + 1}`}
                                        />
                                        <button
                                            onClick={() => removeListItem(index)}
                                            className="flex-none p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            title="Remove item"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {section.items.length === 0 && (
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-center">
                                        <p className="text-sm text-slate-400 dark:text-slate-500">
                                            No items yet.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Table */}
                {section.type === 'table' && (
                    <div className="space-y-6">
                        <div>
                            <label className={labelClass}>Table Caption (optional)</label>
                            <input
                                type="text"
                                value={section.caption || ''}
                                onChange={(e) => onChange({ ...section, caption: e.target.value })}
                                className={inputClass}
                                placeholder="Table description..."
                            />
                        </div>

                        {/* Headers */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className={sectionTitleClass.replace('mb-3', '')}>Columns ({section.headers.length})</span>
                                <button
                                    onClick={addTableColumn}
                                    className="px-3 py-1.5 text-xs bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg font-medium flex items-center gap-1.5 transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add
                                </button>
                            </div>
                            <div className="space-y-2.5">
                                {section.headers.map((header, index) => (
                                    <div key={index} className="flex gap-2 items-center group">
                                        <input
                                            type="text"
                                            value={header}
                                            onChange={(e) => updateTableHeader(index, e.target.value)}
                                            className={`${inputClass} flex-1`}
                                            placeholder={`Header ${index + 1}`}
                                        />
                                        {section.headers.length > 1 && (
                                            <button
                                                onClick={() => removeTableColumn(index)}
                                                className="flex-none p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                title="Remove column"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Rows */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className={sectionTitleClass.replace('mb-3', '')}>Rows ({section.rows.length})</span>
                                <button
                                    onClick={addTableRow}
                                    className="px-3 py-1.5 text-xs bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg font-medium flex items-center gap-1.5 transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add
                                </button>
                            </div>
                            <div className="space-y-3">
                                {section.rows.map((row, rowIndex) => (
                                    <div key={rowIndex} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 group relative">
                                        {/* Action: Delete Row */}
                                        <button
                                            onClick={() => removeTableRow(rowIndex)}
                                            className="absolute -top-2 -right-2 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                                            title="Remove row"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>

                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700">
                                                Row {rowIndex + 1}
                                            </span>
                                        </div>
                                        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${section.headers.length}, 1fr)` }}>
                                            {row.map((cell, colIndex) => (
                                                <input
                                                    key={colIndex}
                                                    type="text"
                                                    value={cell}
                                                    onChange={(e) => updateTableCell(rowIndex, colIndex, e.target.value)}
                                                    className={`${inputClass} text-xs py-2`}
                                                    placeholder={section.headers[colIndex]}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {section.rows.length === 0 && (
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-center">
                                        <p className="text-sm text-slate-400 dark:text-slate-500">
                                            No rows.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Divider - no properties needed */}
                {section.type === 'divider' && (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
                        <div className="w-full text-slate-300 dark:text-slate-600 mb-4 flex items-center gap-4">
                            <span className="h-px bg-current flex-1"></span>
                            <Minus className="w-6 h-6" />
                            <span className="h-px bg-current flex-1"></span>
                        </div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Horizontal Divider
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                            No configuration needed
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Editor({ sections, setSections, onSelect, selectedId }: { sections: ContentSection[]; setSections: (s: ContentSection[]) => void; onSelect: (id: string | null) => void; selectedId: string | null }) {
    const [showSidebar, setShowSidebar] = useState(false);
    const [showProperties, setShowProperties] = useState(false);
    const [sectionToDelete, setSectionToDelete] = useState<number | null>(null);

    const createSection = (type: string): ContentSection => {
        switch (type) {
            case 'text': return { type: 'text', content: 'New text paragraph' };
            case 'heading': return { type: 'heading', content: 'New Heading', level: 2 };
            case 'image': return { type: 'image', url: 'https://via.placeholder.com/800x400', alt: 'Placeholder', caption: '' };
            case 'code': return { type: 'code', content: 'console.log("Hello World");', language: 'javascript' };
            case 'quote': return { type: 'quote', content: 'A wise quote.', author: '', source: '' };
            case 'list': return { type: 'list', items: ['Item 1', 'Item 2', 'Item 3'], ordered: false };
            case 'table': return { type: 'table', headers: ['Column 1', 'Column 2'], rows: [['Cell 1', 'Cell 2']], caption: '' };
            case 'alert': return { type: 'alert', content: 'Important information!', variant: 'info' };
            case 'link': return { type: 'link', content: 'Click here', url: 'https://example.com' };
            case 'divider': return { type: 'divider' };
            default: return { type: 'text', content: '' };
        }
    };

    const addSection = (type: string) => {
        const newSection = createSection(type);
        setSections([...sections, newSection]);
        onSelect(`section-${sections.length}`);
    };

    const updateSection = (index: number, updated: ContentSection) => {
        const newSections = [...sections];
        newSections[index] = updated;
        setSections(newSections);
    };

    const confirmDelete = () => {
        if (sectionToDelete === null) return;
        const newSections = [...sections];
        newSections.splice(sectionToDelete, 1);
        setSections(newSections);
        if (selectedId === `section-${sectionToDelete}`) onSelect(null);
        setSectionToDelete(null);
    };

    const deleteSection = (index: number) => {
        setSectionToDelete(index);
    };

    const duplicateSection = (index: number) => {
        const newSections = [...sections];
        const sectionToCopy = JSON.parse(JSON.stringify(newSections[index]));
        newSections.splice(index + 1, 0, sectionToCopy);
        setSections(newSections);
        onSelect(`section-${index + 1}`);
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        const newSections = [...sections];
        [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
        setSections(newSections);
        onSelect(`section-${index - 1}`);
    };

    const moveDown = (index: number) => {
        if (index === sections.length - 1) return;
        const newSections = [...sections];
        [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
        setSections(newSections);
        onSelect(`section-${index + 1}`);
    };

    const selectedIndex = selectedId ? parseInt(selectedId.replace('section-', '')) : -1;
    const selectedSection = selectedIndex >= 0 ? sections[selectedIndex] : null;

    const handleAddSection = (type: string) => {
        addSection(type);
        setShowSidebar(false);
    };

    return (
        <div className="flex h-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={sectionToDelete !== null}
                onClose={() => setSectionToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Section"
                message="Are you sure you want to delete this section? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                size="sm"
            />

            {/* Mobile Sidebar Overlay */}
            {showSidebar && (
                <div className="lg:hidden fixed inset-0 z-40">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowSidebar(false)} />
                    <div className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-800 shadow-xl flex flex-col animate-in slide-in-from-left duration-200">
                        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                                Components
                            </h2>
                            <button onClick={() => setShowSidebar(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            <SidebarItem icon={Type} label="Text" onClick={() => handleAddSection('text')} />
                            <SidebarItem icon={Heading1} label="Heading" onClick={() => handleAddSection('heading')} />
                            <SidebarItem icon={ImageIcon} label="Image" onClick={() => handleAddSection('image')} />
                            <SidebarItem icon={Code} label="Code Block" onClick={() => handleAddSection('code')} />
                            <SidebarItem icon={Quote} label="Quote" onClick={() => handleAddSection('quote')} />
                            <SidebarItem icon={List} label="List" onClick={() => handleAddSection('list')} />
                            <SidebarItem icon={Table} label="Table" onClick={() => handleAddSection('table')} />
                            <SidebarItem icon={AlertCircle} label="Alert" onClick={() => handleAddSection('alert')} />
                            <SidebarItem icon={LinkIcon} label="Link" onClick={() => handleAddSection('link')} />
                            <SidebarItem icon={Minus} label="Divider" onClick={() => handleAddSection('divider')} />
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Properties Panel Overlay */}
            {showProperties && selectedSection && (
                <div className="lg:hidden fixed inset-0 z-40">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowProperties(false)} />
                    <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-white dark:bg-slate-800 shadow-xl flex flex-col animate-in slide-in-from-right duration-200">
                        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                                Properties
                            </h2>
                            <button onClick={() => setShowProperties(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <PropertiesPanel
                            section={selectedSection}
                            onChange={(updated) => updateSection(selectedIndex, updated)}
                        />
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <div className="hidden lg:flex w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex-col">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                        Components
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    <SidebarItem icon={Type} label="Text" onClick={() => addSection('text')} />
                    <SidebarItem icon={Heading1} label="Heading" onClick={() => addSection('heading')} />
                    <SidebarItem icon={ImageIcon} label="Image" onClick={() => addSection('image')} />
                    <SidebarItem icon={Code} label="Code Block" onClick={() => addSection('code')} />
                    <SidebarItem icon={Quote} label="Quote" onClick={() => addSection('quote')} />
                    <SidebarItem icon={List} label="List" onClick={() => addSection('list')} />
                    <SidebarItem icon={Table} label="Table" onClick={() => addSection('table')} />
                    <SidebarItem icon={AlertCircle} label="Alert" onClick={() => addSection('alert')} />
                    <SidebarItem icon={LinkIcon} label="Link" onClick={() => addSection('link')} />
                    <SidebarItem icon={Minus} label="Divider" onClick={() => addSection('divider')} />
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="flex items-center justify-between gap-2">
                        {/* Mobile Toggle Buttons */}
                        <button
                            onClick={() => setShowSidebar(true)}
                            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"
                            title="Add Component"
                        >
                            <PanelLeftOpen className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-2 flex-1 lg:flex-none">
                            <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide hidden sm:block">
                                Canvas
                            </h2>
                            <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                                {sections.length} {sections.length === 1 ? 'item' : 'items'}
                            </span>
                        </div>

                        <button
                            onClick={() => setShowProperties(true)}
                            className={`lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 ${selectedSection ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700' : ''}`}
                            title="Properties"
                        >
                            <PanelRightOpen className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 sm:p-6">
                    <div className="max-w-3xl mx-auto space-y-3">
                        {sections.map((section, index) => (
                            <CanvasItem
                                key={`section-${index}`}
                                section={section}
                                onDelete={() => deleteSection(index)}
                                onDuplicate={() => duplicateSection(index)}
                                onSelect={() => onSelect(`section-${index}`)}
                                onMoveUp={() => moveUp(index)}
                                onMoveDown={() => moveDown(index)}
                                isSelected={selectedId === `section-${index}`}
                                isFirst={index === 0}
                                isLast={index === sections.length - 1}
                            />
                        ))}
                        {sections.length === 0 && (
                            <div className="text-center py-12 sm:py-16 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800/50">
                                <div className="p-3 sm:p-4 bg-slate-100 dark:bg-slate-700 rounded-xl w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 flex items-center justify-center">
                                    <Code className="w-6 h-6 sm:w-8 sm:h-8 text-slate-500 dark:text-slate-400" />
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base">
                                    <span className="lg:hidden">Tap </span>
                                    <span className="hidden lg:inline">Click components from the sidebar to </span>
                                    <PanelLeftOpen className="w-4 h-4 inline lg:hidden mx-1" />
                                    <span className="lg:hidden"> to add components</span>
                                    <span className="hidden lg:inline">start</span>
                                </p>
                                <p className="text-slate-400 dark:text-slate-500 text-xs sm:text-sm mt-1">
                                    Build your blog post visually
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Desktop Properties Panel */}
            <div className="hidden lg:flex w-96 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex-col">
                {selectedSection ? (
                    <PropertiesPanel
                        section={selectedSection}
                        onChange={(updated) => updateSection(selectedIndex, updated)}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 p-8 text-center">
                        <div className="max-w-[200px]">
                            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm mb-4 mx-auto w-16 h-16 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                                <Settings className="w-8 h-8 text-indigo-500/50 dark:text-indigo-400/50" />
                            </div>
                            <p className="font-semibold text-slate-900 dark:text-white mb-1">Properties</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Select a component to configure it</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
