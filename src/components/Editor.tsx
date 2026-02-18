import { useState, useEffect, useRef, useLayoutEffect, forwardRef } from 'react';
import type { ContentSection } from '../types/blog';
import {
    Type, Image as ImageIcon, X, Plus, Trash2,
    Bold, Italic, Strikethrough, Code, Settings, PanelLeftOpen, PanelRightOpen, Copy,
    Quote, List, Table, AlertCircle, Heading1, Minus, ChevronUp, ChevronDown, XCircle, Link as LinkIcon, Maximize2, GripVertical, Youtube, FileText
} from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ConfirmDialog from './ConfirmDialog';
import TableDesigner from './TableDesigner';

// Sidebar categories
const SIDEBAR_CATEGORIES = [
    {
        label: 'Content',
        items: [
            { icon: Type, label: 'Text', type: 'text' },
            { icon: Heading1, label: 'Heading', type: 'heading' },
            { icon: Quote, label: 'Quote', type: 'quote' },
        ],
    },
    {
        label: 'Media',
        items: [
            { icon: ImageIcon, label: 'Image', type: 'image' },
            { icon: Youtube, label: 'YouTube', type: 'youtube' },
        ],
    },
    {
        label: 'Data',
        items: [
            { icon: Code, label: 'Code Block', type: 'code' },
            { icon: List, label: 'List', type: 'list' },
            { icon: Table, label: 'Table', type: 'table' },
        ],
    },
    {
        label: 'Inline',
        items: [
            { icon: LinkIcon, label: 'Link', type: 'link' },
            { icon: AlertCircle, label: 'Alert', type: 'alert' },
            { icon: Minus, label: 'Divider', type: 'divider' },
        ],
    },
];

// Sidebar Item Component
function SidebarItem({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="group flex items-center gap-3 p-2.5 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg hover:border-accent-400 dark:hover:border-accent-500 hover:bg-accent-50 dark:hover:bg-accent-950/30 transition-all w-full text-left active:scale-[0.97]"
        >
            <div className="p-1.5 bg-accent-50 dark:bg-accent-950/50 rounded-md group-hover:bg-accent-100 dark:group-hover:bg-accent-900/50 transition-colors">
                <Icon className="w-3.5 h-3.5 text-accent-600 dark:text-accent-400" />
            </div>
            <span className="font-medium text-surface-600 dark:text-surface-300 flex-1 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors text-sm">
                {label}
            </span>
            <Plus className="w-3.5 h-3.5 text-surface-300 dark:text-surface-600 opacity-0 group-hover:opacity-100 group-hover:text-accent-500 dark:group-hover:text-accent-400 transition-all" />
        </button>
    );
}

// Sortable Item Wrapper
function SortableCanvasItem(props: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 999 : 'auto',
        position: 'relative' as const,
    };

    return (
        <div ref={setNodeRef} style={style} className={`${isDragging ? 'z-50' : ''} ${props.isNew ? 'animate-section-add' : ''}`}>
            <div className="flex items-start gap-2">
                <div
                    {...attributes}
                    {...listeners}
                    className="mt-4 p-1.5 text-surface-300 dark:text-surface-600 hover:text-accent-500 cursor-grab active:cursor-grabbing hover:bg-surface-100 dark:hover:bg-surface-800 rounded transition-colors"
                >
                    <GripVertical className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <CanvasItem {...props} />
                </div>
            </div>
        </div>
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
            case 'youtube': return Youtube;
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
            case 'youtube':
                return section.title || section.videoId || 'No video';
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
            className={`relative group flex items-start gap-3 p-4 bg-white dark:bg-surface-800 border rounded-xl transition-all duration-200 cursor-pointer ${isSelected
                ? 'border-accent-400 dark:border-accent-500 ring-2 ring-accent-100/50 dark:ring-accent-900/30 shadow-glow bg-accent-50/30 dark:bg-accent-950/20'
                : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600 hover:shadow-elevated'
                }`}
            onClick={onSelect}
        >
            <div className="flex flex-col gap-1">
                <button
                    onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                    disabled={isFirst}
                    className={`p-1 rounded transition-colors ${isFirst
                        ? 'opacity-20 cursor-not-allowed'
                        : 'hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'
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
                        : 'hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'
                        }`}
                    title="Move down"
                >
                    <ChevronDown className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-surface-100 dark:bg-surface-700 rounded">
                        <Icon className="w-3.5 h-3.5 text-surface-500 dark:text-surface-400" />
                    </div>
                    <span className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">
                        {section.type}
                    </span>
                    {section.type === 'list' && (
                        <span className="text-xs text-surface-400 dark:text-surface-500">
                            ({section.ordered ? 'ordered' : 'unordered'})
                        </span>
                    )}
                </div>
                <div className="text-sm text-surface-600 dark:text-surface-300 line-clamp-2 leading-relaxed">
                    {getPreview() || <span className="text-surface-400 dark:text-surface-500 italic">Empty...</span>}
                </div>
            </div>

            <div className="flex flex-row gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                    className="p-1.5 text-surface-400 hover:text-accent-500 dark:hover:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-950/30 rounded transition-all active:scale-90"
                    title="Duplicate"
                >
                    <Copy className="w-5 h-5" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-1.5 text-surface-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-all active:scale-90"
                    title="Delete"
                >
                    <XCircle className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

// Image Preview
const ImagePreview = ({ url }: { url: string }) => {
    const [error, setError] = useState(false);
    useEffect(() => { setError(false); }, [url]);
    if (!url) return null;
    return (
        <div className="mt-3 relative aspect-video bg-surface-100 dark:bg-surface-800 rounded-lg overflow-hidden border border-surface-200 dark:border-surface-700 flex items-center justify-center">
            {!error ? (
                <img src={url} alt="Preview" className="w-full h-full object-cover" onError={() => setError(true)} />
            ) : (
                <div className="flex flex-col items-center text-surface-400">
                    <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                    <span className="text-[10px] uppercase tracking-wider font-medium">Invalid Image</span>
                </div>
            )}
        </div>
    );
};

// Auto-resizing Textarea
const AutoResizingTextarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ value, onChange, ...props }, ref) => {
    const defaultRef = useRef<HTMLTextAreaElement>(null);
    const resolvedRef = (ref as React.MutableRefObject<HTMLTextAreaElement>) || defaultRef;
    const [localValue, setLocalValue] = useState(value);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastEmittedValue = useRef(value);

    useEffect(() => {
        if (value !== lastEmittedValue.current && value !== localValue) {
            setLocalValue(value);
            lastEmittedValue.current = value;
            if (timerRef.current) clearTimeout(timerRef.current);
            if (resolvedRef.current) {
                resolvedRef.current.style.height = 'auto';
                resolvedRef.current.style.height = resolvedRef.current.scrollHeight + 'px';
            }
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setLocalValue(val);
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            lastEmittedValue.current = val;
            if (onChange) onChange(e);
        }, 300);
    };

    useLayoutEffect(() => {
        if (resolvedRef.current) {
            resolvedRef.current.style.height = 'auto';
            resolvedRef.current.style.height = resolvedRef.current.scrollHeight + 'px';
        }
    }, []);

    return <textarea ref={resolvedRef} value={localValue} onChange={handleChange} {...props} />;
});

// Properties Panel
function PropertiesPanel({ section, onChange }: { section: ContentSection | null; onChange: (updated: ContentSection) => void }) {
    if (!section) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-surface-50/50 dark:bg-surface-900/50">
                <div className="p-4 bg-white dark:bg-surface-800 rounded-2xl shadow-sm mb-4 border border-surface-200 dark:border-surface-700">
                    <Settings className="w-8 h-8 text-accent-400 dark:text-accent-500" />
                </div>
                <h3 className="font-display font-bold text-surface-900 dark:text-white mb-1">No Selection</h3>
                <p className="text-surface-400 dark:text-surface-500 text-sm max-w-[200px]">Select an element from the canvas to customize its styling and content</p>
            </div>
        );
    }

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [linkPopover, setLinkPopover] = useState<{ isOpen: boolean; text: string; url: string; start: number; end: number } | null>(null);
    const [tableModalOpen, setTableModalOpen] = useState(false);

    const applyFormat = (format: 'bold' | 'italic' | 'strike' | 'code' | 'link') => {
        const textarea = textareaRef.current;
        if (!textarea || !onChange) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selectedText = text.substring(start, end);

        if (format === 'link') {
            setLinkPopover({ isOpen: true, text: selectedText, url: '', start, end });
            return;
        }

        let wrapper = '';
        switch (format) {
            case 'bold': wrapper = '**'; break;
            case 'italic': wrapper = '_'; break;
            case 'strike': wrapper = '~'; break;
            case 'code': wrapper = '`'; break;
        }

        const newText = text.substring(0, start) + wrapper + selectedText + wrapper + text.substring(end);
        onChange({ ...section, content: newText } as any);
        requestAnimationFrame(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(start + wrapper.length, end + wrapper.length);
            }
        });
    };

    const insertLink = () => {
        if (!linkPopover || !textareaRef.current) return;
        const { text, url, start, end } = linkPopover;
        const currentContent = ('content' in section && typeof section.content === 'string') ? section.content : '';
        const linkMarkdown = `[${text || 'link'}](${url || 'https://'})`;
        const newText = currentContent.substring(0, start) + linkMarkdown + currentContent.substring(end);
        onChange({ ...section, content: newText } as any);
        setLinkPopover(null);
        requestAnimationFrame(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                const newCursorPos = start + linkMarkdown.length;
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        });
    };

    const inputClass = "w-full px-3.5 py-2.5 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-accent-500/20 dark:focus:ring-accent-400/20 focus:border-accent-500 dark:focus:border-accent-400 transition-all text-surface-900 dark:text-white text-sm shadow-sm";
    const labelClass = "block text-sm font-medium text-surface-600 dark:text-surface-300 mb-1.5 ml-0.5";

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
        onChange({ ...section, items: section.items.filter((_, i) => i !== index) });
    };

    return (
        <div className="flex flex-col h-full bg-surface-50 dark:bg-surface-900/50">
            {/* Header with accent border */}
            <div className="flex-none px-6 py-4 border-b border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 border-l-2 border-l-accent-400 dark:border-l-accent-500">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent-50 dark:bg-accent-950/30 rounded-lg">
                        <Settings className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-surface-900 dark:text-white capitalize">{section.type} Properties</h3>
                        <p className="text-xs text-surface-400 dark:text-surface-500">Configure visual appearance</p>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {/* Text, Code, Heading content */}
                {(section.type === 'text' || section.type === 'code' || section.type === 'heading') && (
                    <div className={section.type !== 'heading' ? "flex flex-col h-full gap-2" : "space-y-4"}>
                        <div className={section.type !== 'heading' ? "flex-1 flex flex-col min-h-[300px]" : ""}>
                            <div className="flex items-center justify-between mb-2">
                                {section.type === 'code' && (
                                    <div className="flex-1">
                                        <select value={section.language} onChange={(e) => onChange({ ...section, language: e.target.value })} className="w-full px-3 py-1.5 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-sm text-surface-600 dark:text-surface-300 focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500">
                                            <optgroup label="Web">
                                                <option value="javascript">JavaScript</option>
                                                <option value="typescript">TypeScript</option>
                                                <option value="html">HTML</option>
                                                <option value="css">CSS</option>
                                                <option value="jsx">JSX</option>
                                                <option value="tsx">TSX</option>
                                            </optgroup>
                                            <optgroup label="Other">
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
                                {section.type === 'text' && <label className={labelClass}>Content</label>}
                                {section.type === 'text' && (
                                    <div className="flex items-center gap-1 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg p-1 shadow-sm">
                                        <button onClick={() => applyFormat('bold')} className="p-1.5 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-md text-surface-500 dark:text-surface-400 transition-colors active:scale-90" title="Bold"><Bold className="w-4 h-4" /></button>
                                        <button onClick={() => applyFormat('italic')} className="p-1.5 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-md text-surface-500 dark:text-surface-400 transition-colors active:scale-90" title="Italic"><Italic className="w-4 h-4" /></button>
                                        <button onClick={() => applyFormat('strike')} className="p-1.5 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-md text-surface-500 dark:text-surface-400 transition-colors active:scale-90" title="Strikethrough"><Strikethrough className="w-4 h-4" /></button>
                                        <div className="w-px h-4 bg-surface-200 dark:bg-surface-700 mx-1" />
                                        <button onClick={() => applyFormat('code')} className="p-1.5 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-md text-surface-500 dark:text-surface-400 transition-colors active:scale-90" title="Inline Code"><Code className="w-4 h-4" /></button>
                                        <div className="w-px h-4 bg-surface-200 dark:bg-surface-700 mx-1" />
                                        <div className="relative">
                                            <button onClick={() => applyFormat('link')} className={`p-1.5 rounded-md transition-colors active:scale-90 ${linkPopover?.isOpen ? 'bg-accent-100 dark:bg-accent-900/50 text-accent-600 dark:text-accent-400' : 'hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 dark:text-surface-400'}`} title="Link"><LinkIcon className="w-4 h-4" /></button>
                                            {linkPopover?.isOpen && (
                                                <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-white dark:bg-surface-800 rounded-xl shadow-elevated-lg border border-surface-200 dark:border-surface-700 z-50 animate-scale-in">
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-surface-400 mb-1">Text</label>
                                                            <input type="text" value={linkPopover.text} onChange={(e) => setLinkPopover({ ...linkPopover, text: e.target.value })} className="w-full px-2 py-1.5 text-sm bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 dark:text-white" placeholder="Link text" autoFocus />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-surface-400 mb-1">URL</label>
                                                            <input type="text" value={linkPopover.url} onChange={(e) => setLinkPopover({ ...linkPopover, url: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && insertLink()} className="w-full px-2 py-1.5 text-sm bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 dark:text-white" placeholder="https://example.com" />
                                                        </div>
                                                        <div className="flex items-center justify-end gap-2 pt-1">
                                                            <button onClick={() => setLinkPopover(null)} className="px-2 py-1.5 text-xs font-medium text-surface-400 hover:text-surface-700 dark:hover:text-surface-200">Cancel</button>
                                                            <button onClick={insertLink} className="px-3 py-1.5 text-xs font-medium bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors shadow-sm active:scale-95">Add Link</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <AutoResizingTextarea ref={textareaRef} value={section.content} onChange={(e) => onChange({ ...section, content: e.target.value } as any)} className={`${inputClass} font-mono leading-relaxed ${section.type !== 'heading' ? 'flex-1 resize-none overflow-hidden' : ''}`} rows={section.type === 'heading' ? 3 : undefined} placeholder="Enter your content here..." />
                        </div>
                    </div>
                )}

                {section.type === 'heading' && (
                    <div>
                        <label className={labelClass}>Heading Level</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[1, 2, 3, 4, 5, 6].map(l => (
                                <button key={l} onClick={() => onChange({ ...section, level: l as any })} className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all active:scale-95 ${section.level === l ? 'bg-accent-50 border-accent-500 text-accent-700 dark:bg-accent-950/30 dark:border-accent-400 dark:text-accent-300' : 'bg-white border-surface-200 text-surface-500 hover:border-surface-300 dark:bg-surface-800 dark:border-surface-700 dark:text-surface-400 dark:hover:border-surface-600'}`}>H{l}</button>
                            ))}
                        </div>
                    </div>
                )}

                {section.type === 'image' && (
                    <div className="space-y-4">
                        <div>
                            <label className={labelClass}>Image URL</label>
                            <input type="text" value={section.url} onChange={(e) => onChange({ ...section, url: e.target.value })} className={inputClass} placeholder="https://example.com/image.jpg" />
                            <ImagePreview url={section.url} />
                        </div>
                        <div>
                            <label className={labelClass}>Alt Text</label>
                            <input type="text" value={section.alt} onChange={(e) => onChange({ ...section, alt: e.target.value })} className={inputClass} placeholder="Describe the image..." />
                        </div>
                        <div>
                            <label className={labelClass}>Caption (optional)</label>
                            <input type="text" value={section.caption || ''} onChange={(e) => onChange({ ...section, caption: e.target.value })} className={inputClass} placeholder="Image caption..." />
                        </div>
                    </div>
                )}

                {section.type === 'quote' && (
                    <div className="flex flex-col h-full gap-4">
                        <div className="flex-1 flex flex-col min-h-[150px]">
                            <label className={labelClass}>Quote Text</label>
                            <AutoResizingTextarea ref={textareaRef} value={section.content} onChange={(e) => onChange({ ...section, content: e.target.value })} className={`${inputClass} flex-1 resize-none overflow-hidden`} placeholder="Enter the quote..." />
                        </div>
                        <div className="space-y-4 flex-none">
                            <div>
                                <label className={labelClass}>Author (optional)</label>
                                <input type="text" value={section.author || ''} onChange={(e) => onChange({ ...section, author: e.target.value })} className={inputClass} placeholder="Who said this?" />
                            </div>
                            <div>
                                <label className={labelClass}>Source (optional)</label>
                                <input type="text" value={section.source || ''} onChange={(e) => onChange({ ...section, source: e.target.value })} className={inputClass} placeholder="Book, article, etc." />
                            </div>
                        </div>
                    </div>
                )}

                {section.type === 'alert' && (
                    <div className="flex flex-col h-full gap-4">
                        <div className="flex-1 flex flex-col min-h-[150px]">
                            <label className={labelClass}>Alert Content</label>
                            <AutoResizingTextarea ref={textareaRef} value={section.content} onChange={(e) => onChange({ ...section, content: e.target.value })} className={`${inputClass} flex-1 resize-none overflow-hidden`} placeholder="Alert message..." />
                        </div>
                        <div className="flex-none">
                            <label className={labelClass}>Alert Type</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['info', 'success', 'warning', 'error'] as const).map(variant => (
                                    <button key={variant} onClick={() => onChange({ ...section, variant })} className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all border shadow-sm active:scale-95 ${section.variant === variant
                                        ? variant === 'info' ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-400 dark:text-blue-300 ring-1 ring-blue-500/20'
                                            : variant === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-400 dark:text-emerald-300 ring-1 ring-emerald-500/20'
                                                : variant === 'warning' ? 'bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-900/30 dark:border-amber-400 dark:text-amber-300 ring-1 ring-amber-500/20'
                                                    : 'bg-red-50 border-red-500 text-red-700 dark:bg-red-900/30 dark:border-red-400 dark:text-red-300 ring-1 ring-red-500/20'
                                        : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-500 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-700'}`}>{variant.charAt(0).toUpperCase() + variant.slice(1)}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {section.type === 'link' && (
                    <div className="space-y-4">
                        <div><label className={labelClass}>Link Text</label><input type="text" value={section.content} onChange={(e) => onChange({ ...section, content: e.target.value })} className={inputClass} placeholder="Click here" /></div>
                        <div><label className={labelClass}>URL</label><input type="text" value={section.url} onChange={(e) => onChange({ ...section, url: e.target.value })} className={inputClass} placeholder="https://example.com" /></div>
                    </div>
                )}

                {section.type === 'list' && (
                    <div className="space-y-6">
                        <div>
                            <label className={labelClass}>List Type</label>
                            <div className="flex gap-2">
                                <button onClick={() => onChange({ ...section, ordered: false })} className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border shadow-sm active:scale-[0.97] ${!section.ordered ? 'bg-accent-50 border-accent-500 text-accent-700 dark:bg-accent-950/30 dark:border-accent-400 dark:text-accent-300 ring-1 ring-accent-500/20' : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-500 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-700'}`}>• Unordered</button>
                                <button onClick={() => onChange({ ...section, ordered: true })} className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border shadow-sm active:scale-[0.97] ${section.ordered ? 'bg-accent-50 border-accent-500 text-accent-700 dark:bg-accent-950/30 dark:border-accent-400 dark:text-accent-300 ring-1 ring-accent-500/20' : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-500 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-700'}`}>1. Ordered</button>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className={labelClass.replace('mb-1.5', '')}>List Items</label>
                                <button onClick={addListItem} className="px-3 py-1.5 text-xs bg-accent-50 text-accent-600 dark:bg-accent-950/30 dark:text-accent-400 hover:bg-accent-100 dark:hover:bg-accent-900/50 rounded-lg font-medium flex items-center gap-1.5 transition-colors active:scale-95"><Plus className="w-3.5 h-3.5" /> Add</button>
                            </div>
                            <div className="space-y-2.5">
                                {section.items.map((item, index) => (
                                    <div key={index} className="flex gap-2 items-center group">
                                        <span className="flex-none flex items-center justify-center w-6 text-sm text-surface-400 dark:text-surface-500 font-medium">{section.ordered ? `${index + 1}.` : '•'}</span>
                                        <input type="text" value={item} onChange={(e) => updateListItem(index, e.target.value)} className={`${inputClass} flex-1`} placeholder={`Item ${index + 1}`} />
                                        <button onClick={() => removeListItem(index)} className="flex-none p-2 text-surface-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all opacity-0 group-hover:opacity-100 active:scale-90" title="Remove item"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                ))}
                                {section.items.length === 0 && (
                                    <div className="p-4 bg-surface-50 dark:bg-surface-900 rounded-xl border border-dashed border-surface-300 dark:border-surface-600 text-center">
                                        <p className="text-sm text-surface-400 dark:text-surface-500">No items yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {section.type === 'table' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-surface-600 dark:text-surface-300">Table Configuration</h4>
                            <button onClick={() => setTableModalOpen(true)} className="text-xs flex items-center gap-1.5 text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 font-medium bg-accent-50 dark:bg-accent-950/30 px-2.5 py-1.5 rounded-lg transition-colors active:scale-95"><Maximize2 className="w-3.5 h-3.5" />Expand Editor</button>
                        </div>
                        <TableDesigner section={section} onChange={onChange} />
                        {tableModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                                <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in border border-surface-200 dark:border-surface-700">
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-850">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-accent-100 dark:bg-accent-950/50 rounded-lg"><Table className="w-5 h-5 text-accent-600 dark:text-accent-400" /></div>
                                            <div>
                                                <h3 className="font-display text-lg font-bold text-surface-900 dark:text-white">Table Editor</h3>
                                                <p className="text-xs text-surface-400">Advanced table data management</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setTableModalOpen(false)} className="p-2 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-lg text-surface-400 transition-colors active:scale-95"><X className="w-5 h-5" /></button>
                                    </div>
                                    <div className="flex-1 overflow-hidden p-6 bg-white dark:bg-surface-800"><TableDesigner section={section} onChange={onChange} isModal={true} /></div>
                                    <div className="px-6 py-4 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-850 flex justify-end">
                                        <button onClick={() => setTableModalOpen(false)} className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm active:scale-95">Done Editing</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {section.type === 'divider' && (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
                        <div className="w-full text-surface-300 dark:text-surface-600 mb-4 flex items-center gap-4">
                            <span className="h-px bg-current flex-1"></span>
                            <Minus className="w-6 h-6" />
                            <span className="h-px bg-current flex-1"></span>
                        </div>
                        <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Horizontal Divider</p>
                        <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">No configuration needed</p>
                    </div>
                )}

                {section.type === 'youtube' && (
                    <div className="space-y-4">
                        <div><label className={labelClass}>Video ID</label><input type="text" value={section.videoId} onChange={(e) => onChange({ ...section, videoId: e.target.value })} className={inputClass} placeholder="e.g. iDqrgjyv09A" /></div>
                        <div><label className={labelClass}>Video Title</label><input type="text" value={section.title} onChange={(e) => onChange({ ...section, title: e.target.value })} className={inputClass} placeholder="Enter video title..." /></div>
                        <div>
                            <label className={labelClass}>Poster Quality (optional)</label>
                            <select value={section.posterQuality || ''} onChange={(e) => onChange({ ...section, posterQuality: (e.target.value || undefined) as any })} className={inputClass}>
                                <option value="">Default</option>
                                <option value="mqdefault">Medium</option>
                                <option value="hqdefault">High</option>
                                <option value="sddefault">Standard</option>
                                <option value="maxresdefault">Max Resolution</option>
                            </select>
                        </div>
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
    const [newSectionId, setNewSectionId] = useState<string | null>(null);

    useEffect(() => {
        const hasMissingIds = sections.some(s => !s.id);
        if (hasMissingIds) {
            const migrated = sections.map(s => s.id ? s : { ...s, id: crypto.randomUUID() });
            setSections(migrated);
        }
    }, [sections]);

    const createSection = (type: string): ContentSection => {
        const id = crypto.randomUUID();
        switch (type) {
            case 'text': return { id, type: 'text', content: 'New text paragraph' };
            case 'heading': return { id, type: 'heading', content: 'New Heading', level: 2 };
            case 'image': return { id, type: 'image', url: 'https://res.cloudinary.com/mustafakbaser/image/upload/v1764964904/Blog-Builder-App-Screenshot_rtx7ao.webp', alt: 'Placeholder', caption: '' };
            case 'code': return { id, type: 'code', content: 'console.log("Hello World");', language: 'javascript' };
            case 'quote': return { id, type: 'quote', content: 'A wise quote.', author: '', source: '' };
            case 'list': return { id, type: 'list', items: ['Item 1', 'Item 2', 'Item 3'], ordered: false };
            case 'table': return { id, type: 'table', headers: ['Column 1', 'Column 2'], rows: [['Cell 1', 'Cell 2']], caption: '' };
            case 'alert': return { id, type: 'alert', content: 'Important information!', variant: 'info' };
            case 'link': return { id, type: 'link', content: 'Click here', url: 'https://mustafabaser.net' };
            case 'divider': return { id, type: 'divider' };
            case 'youtube': return { id, type: 'youtube', videoId: '', title: '', posterQuality: 'maxresdefault' };
            default: return { id, type: 'text', content: '' };
        }
    };

    const addSection = (type: string) => {
        const newSection = createSection(type);
        setSections([...sections, newSection]);
        onSelect(newSection.id);
        setNewSectionId(newSection.id);
        setTimeout(() => setNewSectionId(null), 400);
    };

    const updateSection = (id: string, updated: ContentSection) => {
        setSections(sections.map(s => s.id === id ? updated : s));
    };

    const confirmDelete = () => {
        if (sectionToDelete === null) return;
        setSections(sections.filter((_, i) => i !== sectionToDelete));
        setSectionToDelete(null);
        onSelect(null);
    };

    const duplicateSection = (index: number) => {
        const newSections = [...sections];
        const sectionToCopy = JSON.parse(JSON.stringify(newSections[index]));
        sectionToCopy.id = crypto.randomUUID();
        newSections.splice(index + 1, 0, sectionToCopy);
        setSections(newSections);
        onSelect(sectionToCopy.id);
        setNewSectionId(sectionToCopy.id);
        setTimeout(() => setNewSectionId(null), 400);
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        const newSections = [...sections];
        [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
        setSections(newSections);
    };

    const moveDown = (index: number) => {
        if (index === sections.length - 1) return;
        const newSections = [...sections];
        [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
        setSections(newSections);
    };

    const selectedSection = sections.find(s => s.id === selectedId) || null;
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = sections.findIndex((s) => s.id === active.id);
            const newIndex = sections.findIndex((s) => s.id === over?.id);
            if (oldIndex !== -1 && newIndex !== -1) {
                setSections(arrayMove(sections, oldIndex, newIndex));
            }
        }
    };

    const handleAddSection = (type: string) => {
        addSection(type);
        setShowSidebar(false);
    };

    const renderSidebarContent = (onAdd: (type: string) => void) => (
        <>
            {SIDEBAR_CATEGORIES.map((category) => (
                <div key={category.label} className="mb-4">
                    <h3 className="px-1 mb-2 text-[11px] font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">{category.label}</h3>
                    <div className="space-y-1.5">
                        {category.items.map((item) => (
                            <SidebarItem key={item.type} icon={item.icon} label={item.label} onClick={() => onAdd(item.type)} />
                        ))}
                    </div>
                </div>
            ))}
        </>
    );

    return (
        <div className="flex h-full bg-surface-50 dark:bg-surface-900 overflow-hidden relative theme-transition">
            <ConfirmDialog isOpen={sectionToDelete !== null} onClose={() => setSectionToDelete(null)} onConfirm={confirmDelete} title="Delete Section" message="Are you sure you want to delete this section? This action cannot be undone." confirmText="Delete" cancelText="Cancel" variant="danger" size="sm" />

            {/* Mobile Sidebar Overlay */}
            {showSidebar && (
                <div className="lg:hidden fixed inset-0 z-40">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSidebar(false)} />
                    <div className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-surface-800 shadow-xl flex flex-col animate-slide-in-left">
                        <div className="px-4 py-3 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
                            <h2 className="font-display text-sm font-bold text-surface-600 dark:text-surface-300 uppercase tracking-wide">Components</h2>
                            <button onClick={() => setShowSidebar(false)} className="p-1 hover:bg-surface-100 dark:hover:bg-surface-700 rounded active:scale-90"><X className="w-5 h-5 text-surface-400" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3">{renderSidebarContent(handleAddSection)}</div>
                    </div>
                </div>
            )}

            {/* Mobile Properties Panel Overlay */}
            {showProperties && selectedSection && (
                <div className="lg:hidden fixed inset-0 z-40">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowProperties(false)} />
                    <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-white dark:bg-surface-800 shadow-xl flex flex-col animate-slide-in-right">
                        <div className="px-4 py-3 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
                            <h2 className="font-display text-sm font-bold text-surface-600 dark:text-surface-300 uppercase tracking-wide">Properties</h2>
                            <button onClick={() => setShowProperties(false)} className="p-1 hover:bg-surface-100 dark:hover:bg-surface-700 rounded active:scale-90"><X className="w-5 h-5 text-surface-400" /></button>
                        </div>
                        <PropertiesPanel section={selectedSection} onChange={(updated) => selectedSection && updateSection(selectedSection.id, updated)} />
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <div className="hidden lg:flex w-64 bg-white dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700 flex-col theme-transition">
                <div className="px-4 py-3 border-b border-surface-200 dark:border-surface-700">
                    <h2 className="font-display text-sm font-bold text-surface-600 dark:text-surface-300 uppercase tracking-wide">Components</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-3">{renderSidebarContent(addSection)}</div>
            </div>

            {/* Canvas */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 theme-transition">
                    <div className="flex items-center justify-between gap-2">
                        <button onClick={() => setShowSidebar(true)} className="lg:hidden p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg border border-surface-200 dark:border-surface-700 text-surface-500 dark:text-surface-400 active:scale-95" title="Add Component"><PanelLeftOpen className="w-4 h-4" /></button>
                        <div className="flex items-center gap-2 flex-1 lg:flex-none">
                            <h2 className="font-display text-sm font-bold text-surface-600 dark:text-surface-300 uppercase tracking-wide hidden sm:block">Canvas</h2>
                            <span className="text-xs text-surface-400 dark:text-surface-500 bg-surface-100 dark:bg-surface-700 px-2 py-0.5 rounded font-medium">{sections.length} {sections.length === 1 ? 'item' : 'items'}</span>
                        </div>
                        <button onClick={() => setShowProperties(true)} className={`lg:hidden p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg border border-surface-200 dark:border-surface-700 text-surface-500 dark:text-surface-400 active:scale-95 ${selectedSection ? 'bg-accent-50 dark:bg-accent-950/30 border-accent-300 dark:border-accent-700' : ''}`} title="Properties"><PanelRightOpen className="w-4 h-4" /></button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 sm:p-6">
                    <div className="max-w-3xl mx-auto space-y-3">
                        {sections.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="relative mb-6">
                                    <div className="w-20 h-20 rounded-2xl bg-accent-50 dark:bg-accent-950 flex items-center justify-center">
                                        <FileText className="w-10 h-10 text-accent-400" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 flex items-center justify-center shadow-sm animate-pulse-soft">
                                        <Plus className="w-4 h-4 text-surface-400" />
                                    </div>
                                </div>
                                <h3 className="font-display font-bold text-lg text-surface-900 dark:text-surface-50 mb-2">Start building your post</h3>
                                <p className="text-sm text-surface-400 dark:text-surface-500 max-w-[260px] mb-6">Pick a component from the sidebar to add your first content block</p>
                                <div className="flex gap-2">
                                    {['text', 'heading', 'image', 'code'].map(type => (
                                        <button key={type} onClick={() => addSection(type)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 hover:bg-accent-50 hover:text-accent-600 dark:hover:bg-accent-950 dark:hover:text-accent-400 transition-all border border-surface-200 dark:border-surface-700 active:scale-95">{type.charAt(0).toUpperCase() + type.slice(1)}</button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={sections} strategy={verticalListSortingStrategy}>
                                    <div className="max-w-3xl mx-auto space-y-4 pb-20">
                                        {sections.map((section, index) => (
                                            <SortableCanvasItem key={section.id} id={section.id} section={section} onDelete={() => setSectionToDelete(index)} onDuplicate={() => duplicateSection(index)} onSelect={() => onSelect(section.id)} onMoveUp={() => moveUp(index)} onMoveDown={() => moveDown(index)} isSelected={selectedId === section.id} isFirst={index === 0} isLast={index === sections.length - 1} isNew={section.id === newSectionId} />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>
                </div>
            </div>

            {/* Desktop Properties Panel */}
            <div className="hidden lg:flex w-96 bg-white dark:bg-surface-800 border-l border-surface-200 dark:border-surface-700 flex-col theme-transition">
                {selectedSection ? (
                    <PropertiesPanel section={selectedSection} onChange={(updated) => selectedSection && updateSection(selectedSection.id, updated)} />
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-surface-50 dark:bg-surface-900/50 p-8 text-center">
                        <div className="max-w-[200px]">
                            <div className="p-4 bg-white dark:bg-surface-800 rounded-2xl shadow-sm mb-4 mx-auto w-16 h-16 flex items-center justify-center border border-surface-200 dark:border-surface-700">
                                <Settings className="w-8 h-8 text-accent-400/50" />
                            </div>
                            <p className="font-display font-bold text-surface-900 dark:text-white mb-1">Properties</p>
                            <p className="text-sm text-surface-400 dark:text-surface-500">Select a component to configure it</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
