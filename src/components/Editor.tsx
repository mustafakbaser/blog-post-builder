import type { ContentSection } from '../types/blog';
import { Type, Image as ImageIcon, Code, Quote, List, Table, AlertCircle, Link as LinkIcon, Minus, Heading1, XCircle, Plus, ChevronUp, ChevronDown, Settings } from 'lucide-react';

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
function CanvasItem({ section, onDelete, onSelect, onMoveUp, onMoveDown, isSelected, isFirst, isLast }: {
    section: ContentSection;
    onDelete: () => void;
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
                </div>
                <div className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {'content' in section ? (
                        section.content || <span className="text-slate-400 dark:text-slate-500 italic">Empty content...</span>
                    ) : (
                        <span className="text-slate-400 dark:text-slate-500 italic">Divider</span>
                    )}
                </div>
            </div>

            {/* Delete Button */}
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-all"
                title="Delete"
            >
                <XCircle className="w-5 h-5" />
            </button>
        </div>
    );
}

// Properties Panel Component
function PropertiesPanel({ section, onChange }: { section: ContentSection | null; onChange: (updated: ContentSection) => void }) {
    if (!section) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-xl mb-4">
                    <Settings className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Select an item to edit its properties</p>
            </div>
        );
    }

    const inputClass = "w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-slate-900 dark:text-white text-sm";
    const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5";

    return (
        <div className="p-5 space-y-5 h-full overflow-y-auto">
            <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white capitalize">
                    {section.type} Properties
                </h3>
            </div>

            {'content' in section && (
                <div>
                    <label className={labelClass}>Content</label>
                    {section.type === 'text' || section.type === 'quote' || section.type === 'alert' ? (
                        <textarea
                            value={section.content}
                            onChange={(e) => onChange({ ...section, content: e.target.value } as any)}
                            rows={6}
                            className={`${inputClass} resize-none`}
                            placeholder="Enter your content here..."
                        />
                    ) : (
                        <input
                            type="text"
                            value={section.content}
                            onChange={(e) => onChange({ ...section, content: e.target.value } as any)}
                            className={inputClass}
                            placeholder="Enter content..."
                        />
                    )}
                </div>
            )}

            {section.type === 'heading' && (
                <div>
                    <label className={labelClass}>Heading Level</label>
                    <select
                        value={section.level}
                        onChange={(e) => onChange({ ...section, level: Number(e.target.value) as any })}
                        className={inputClass}
                    >
                        {[1, 2, 3, 4, 5, 6].map(l => (
                            <option key={l} value={l} className="bg-white dark:bg-slate-800">
                                H{l} - Heading {l}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {section.type === 'image' && (
                <>
                    <div>
                        <label className={labelClass}>Image URL</label>
                        <input
                            type="text"
                            value={section.url}
                            onChange={(e) => onChange({ ...section, url: e.target.value })}
                            className={inputClass}
                            placeholder="https://example.com/image.jpg"
                        />
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
                </>
            )}

            {section.type === 'code' && (
                <div>
                    <label className={labelClass}>Programming Language</label>
                    <input
                        type="text"
                        value={section.language}
                        onChange={(e) => onChange({ ...section, language: e.target.value })}
                        className={inputClass}
                        placeholder="javascript, python, etc."
                    />
                </div>
            )}

            {section.type === 'alert' && (
                <div>
                    <label className={labelClass}>Alert Type</label>
                    <select
                        value={section.variant}
                        onChange={(e) => onChange({ ...section, variant: e.target.value as any })}
                        className={inputClass}
                    >
                        <option value="info" className="bg-white dark:bg-slate-800">Info</option>
                        <option value="warning" className="bg-white dark:bg-slate-800">Warning</option>
                        <option value="success" className="bg-white dark:bg-slate-800">Success</option>
                        <option value="error" className="bg-white dark:bg-slate-800">Error</option>
                    </select>
                </div>
            )}
        </div>
    );
}

export default function Editor({ sections, setSections, onSelect, selectedId }: { sections: ContentSection[]; setSections: (s: ContentSection[]) => void; onSelect: (id: string | null) => void; selectedId: string | null }) {

    const createSection = (type: string): ContentSection => {
        switch (type) {
            case 'text': return { type: 'text', content: 'New text paragraph' };
            case 'heading': return { type: 'heading', content: 'New Heading', level: 2 };
            case 'image': return { type: 'image', url: 'https://via.placeholder.com/800x400', alt: 'Placeholder', caption: '' };
            case 'code': return { type: 'code', content: 'console.log("Hello World");', language: 'javascript' };
            case 'quote': return { type: 'quote', content: 'A wise quote.', author: 'Anonymous' };
            case 'list': return { type: 'list', items: ['Item 1', 'Item 2'], ordered: false };
            case 'table': return { type: 'table', headers: ['Col 1', 'Col 2'], rows: [['Cell 1', 'Cell 2']] };
            case 'alert': return { type: 'alert', content: 'Important alert!', variant: 'info' };
            case 'link': return { type: 'link', content: 'Click me', url: '#' };
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

    const deleteSection = (index: number) => {
        const newSections = [...sections];
        newSections.splice(index, 1);
        setSections(newSections);
        if (selectedId === `section-${index}`) onSelect(null);
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

    return (
        <div className="flex h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
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
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                            Canvas
                        </h2>
                        <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                            {sections.length} {sections.length === 1 ? 'item' : 'items'}
                        </span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-3xl mx-auto space-y-3">
                        {sections.map((section, index) => (
                            <CanvasItem
                                key={`section-${index}`}
                                section={section}
                                onDelete={() => deleteSection(index)}
                                onSelect={() => onSelect(`section-${index}`)}
                                onMoveUp={() => moveUp(index)}
                                onMoveDown={() => moveDown(index)}
                                isSelected={selectedId === `section-${index}`}
                                isFirst={index === 0}
                                isLast={index === sections.length - 1}
                            />
                        ))}
                        {sections.length === 0 && (
                            <div className="text-center py-16 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800/50">
                                <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                    <Code className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">
                                    Click components from the sidebar to start
                                </p>
                                <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                                    Build your blog post visually
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Properties Panel */}
            <div className="w-80 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                        Properties
                    </h2>
                </div>
                {selectedSection ? (
                    <PropertiesPanel
                        section={selectedSection}
                        onChange={(updated) => updateSection(selectedIndex, updated)}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500 p-8 text-center">
                        <div>
                            <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Settings className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                            </div>
                            <p className="font-medium text-slate-500 dark:text-slate-400">Select a component</p>
                            <p className="text-sm mt-1 text-slate-400 dark:text-slate-500">to edit its properties</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
