import type { ContentSection } from '../types/blog';
import { Type, Image as ImageIcon, Code, Quote, List, Table, AlertCircle, Link as LinkIcon, Minus, Heading1, XCircle, Plus, ChevronUp, ChevronDown } from 'lucide-react';

// Sidebar Item Component - Click to add
function SidebarItem({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="group flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20 transition-all duration-200 w-full text-left"
        >
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                <Icon className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-200 flex-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {label}
            </span>
            <Plus className="w-4 h-4 text-indigo-500 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
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
            className={`relative group flex items-start gap-3 p-5 bg-white dark:bg-gray-800 border-2 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer ${isSelected
                    ? 'border-indigo-500 dark:border-indigo-400 ring-4 ring-indigo-100 dark:ring-indigo-900/50 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                }`}
            onClick={onSelect}
        >
            <div className="flex flex-col gap-2">
                <button
                    onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                    disabled={isFirst}
                    className={`p-1.5 rounded-lg transition-all ${isFirst
                            ? 'opacity-20 cursor-not-allowed'
                            : 'hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                        }`}
                    title="Move up"
                >
                    <ChevronUp className="w-4 h-4" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                    disabled={isLast}
                    className={`p-1.5 rounded-lg transition-all ${isLast
                            ? 'opacity-20 cursor-not-allowed'
                            : 'hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                        }`}
                    title="Move down"
                >
                    <ChevronDown className="w-4 h-4" />
                </button>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                        <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {section.type}
                    </span>
                </div>
                <div className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2 leading-relaxed">
                    {'content' in section ? (
                        section.content || <span className="text-gray-400 dark:text-gray-500 italic">Empty content...</span>
                    ) : (
                        <span className="text-gray-400 dark:text-gray-500 italic">Divider</span>
                    )}
                </div>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
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
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4">
                    <Settings className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Select an item to edit its properties</p>
            </div>
        );
    }

    const inputClass = "w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500";
    const labelClass = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2";

    return (
        <div className="p-6 space-y-6 h-full overflow-y-auto">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent capitalize">
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
                            rows={8}
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
                            <option key={l} value={l} className="bg-white dark:bg-gray-800">
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
                        <option value="info" className="bg-white dark:bg-gray-800">Info</option>
                        <option value="warning" className="bg-white dark:bg-gray-800">Warning</option>
                        <option value="success" className="bg-white dark:bg-gray-800">Success</option>
                        <option value="error" className="bg-white dark:bg-gray-800">Error</option>
                    </select>
                </div>
            )}
        </div>
    );
}

// Import Settings icon
import { Settings } from 'lucide-react';

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
        <div className="flex h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
            {/* Sidebar */}
            <div className="w-72 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-xl">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Components
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            Canvas
                        </h2>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                            {sections.length}
                        </span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-3xl mx-auto space-y-4">
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
                            <div className="text-center py-24 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                                <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                    <Code className="w-8 h-8 text-white" />
                                </div>
                                <p className="text-gray-400 dark:text-gray-500 font-medium text-lg">
                                    Click components from the sidebar to start
                                </p>
                                <p className="text-gray-400 dark:text-gray-600 text-sm mt-2">
                                    Build your blog post visually
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Properties Panel */}
            <div className="w-96 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-l border-gray-200 dark:border-gray-700 flex flex-col shadow-xl">
                {selectedSection ? (
                    <PropertiesPanel
                        section={selectedSection}
                        onChange={(updated) => updateSection(selectedIndex, updated)}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 p-8 text-center">
                        <div>
                            <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Settings className="w-8 h-8 text-white" />
                            </div>
                            <p className="font-medium">Select a component</p>
                            <p className="text-sm mt-2">to edit its properties</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
