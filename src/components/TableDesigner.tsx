import { Fragment } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import type { ContentSection } from '../types/blog';
interface TableDesignerProps {
    section: ContentSection;
    onChange: (updated: ContentSection) => void;
    isModal?: boolean;
}

export default function TableDesigner({ section, onChange, isModal = false }: TableDesignerProps) {

    if (section.type !== 'table') return null;

    const updateTableHeader = (index: number, value: string) => {
        const newHeaders = [...section.headers];
        newHeaders[index] = value;
        onChange({ ...section, headers: newHeaders });
    };

    const updateTableCell = (rowIndex: number, colIndex: number, value: string) => {
        const newRows = [...section.rows];
        newRows[rowIndex] = [...newRows[rowIndex]];
        newRows[rowIndex][colIndex] = value;
        onChange({ ...section, rows: newRows });
    };

    const addTableColumn = () => {
        onChange({
            ...section,
            headers: [...section.headers, `Column ${section.headers.length + 1}`],
            rows: section.rows.map(row => [...row, ''])
        });
    };

    const removeTableColumn = (index: number) => {
        if (section.headers.length <= 1) return;
        onChange({
            ...section,
            headers: section.headers.filter((_, i) => i !== index),
            rows: section.rows.map(row => row.filter((_, i) => i !== index))
        });
    };

    const addTableRow = () => {
        onChange({
            ...section,
            rows: [...section.rows, new Array(section.headers.length).fill('')]
        });
    };

    const removeTableRow = (rowIndex: number) => {
        const newRows = section.rows.filter((_, i) => i !== rowIndex);
        onChange({ ...section, rows: newRows });
    };

    const containerClasses = isModal
        ? "flex-1 overflow-hidden flex flex-col min-h-0 border border-surface-200 dark:border-surface-700 rounded-xl"
        : "relative border border-surface-200 dark:border-surface-700 rounded-xl overflow-hidden bg-white dark:bg-surface-900 shadow-sm";

    const scrollContainerClasses = isModal
        ? "overflow-auto flex-1 custom-scrollbar p-6 bg-surface-50 dark:bg-surface-900/50"
        : "overflow-x-auto custom-scrollbar";

    return (
        <div className={isModal ? "space-y-4 h-full flex flex-col" : "space-y-6"}>
            {!isModal && (
                <div>
                    <label className="block text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-2">Table Caption</label>
                    <input
                        type="text"
                        value={section.caption || ''}
                        onChange={(e) => onChange({ ...section, caption: e.target.value })}
                        className="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-700 dark:text-surface-200 focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 hover:border-surface-300 dark:hover:border-surface-600 transition-all placeholder:text-surface-400"
                        placeholder="Table description..."
                    />
                </div>
            )}

            <div className={`flex flex-col gap-3 ${isModal ? 'flex-1 min-h-0' : 'h-full'}`}>
                <div className="flex items-center justify-between flex-none">
                    <span className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Table Data</span>
                    <div className="flex gap-2">
                        <button
                            onClick={addTableColumn}
                            className="px-3 py-1.5 text-xs bg-accent-50 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400 hover:bg-accent-100 dark:hover:bg-accent-900/50 rounded-lg font-medium flex items-center gap-1.5 transition-colors active:scale-95"
                        >
                            <Plus className="w-3.5 h-3.5" /> Col
                        </button>
                        <button
                            onClick={addTableRow}
                            className="px-3 py-1.5 text-xs bg-accent-50 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400 hover:bg-accent-100 dark:hover:bg-accent-900/50 rounded-lg font-medium flex items-center gap-1.5 transition-colors active:scale-95"
                        >
                            <Plus className="w-3.5 h-3.5" /> Row
                        </button>
                    </div>
                </div>

                {/* Scrollable Data Grid Container */}
                <div className={containerClasses}>
                    <div
                        className={scrollContainerClasses}
                    >
                        <div className={isModal ? "min-w-max mx-auto" : "min-w-max p-4"}>
                            <div
                                className="grid gap-x-2 gap-y-3"
                                style={{
                                    gridTemplateColumns: `40px ${section.headers.map(() => 'minmax(180px, 1fr)').join(' ')} 40px`
                                }}
                            >
                                {/* Header Row */}
                                <div className="flex items-center justify-center font-mono text-xs text-surface-400">#</div>
                                {section.headers.map((header, index) => (
                                    <div key={`h-${index}`} className="relative group">
                                        <input
                                            type="text"
                                            value={header}
                                            onChange={(e) => updateTableHeader(index, e.target.value)}
                                            className="w-full px-3 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-sm font-semibold text-surface-700 dark:text-surface-200 focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all placeholder:font-normal"
                                            placeholder={`Header ${index + 1}`}
                                        />
                                        {section.headers.length > 1 && (
                                            <button
                                                onClick={() => removeTableColumn(index)}
                                                className="absolute -top-2 -right-2 p-1 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-400 hover:text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                                                title="Remove Column"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <div className="w-10"></div> {/* Spacer for Row Action */}

                                {/* Data Rows */}
                                {section.rows.map((row, rowIndex) => (
                                    <Fragment key={rowIndex}>
                                        {/* Row Index */}
                                        <div className="flex items-center justify-center font-mono text-xs text-surface-400 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
                                            {rowIndex + 1}
                                        </div>

                                        {/* Cells */}
                                        {row.map((cell, colIndex) => (
                                            <input
                                                key={`c-${rowIndex}-${colIndex}`}
                                                type="text"
                                                value={cell}
                                                onChange={(e) => updateTableCell(rowIndex, colIndex, e.target.value)}
                                                className="w-full px-3 py-2 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-sm text-surface-600 dark:text-surface-300 focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all"
                                                placeholder="..."
                                            />
                                        ))}

                                        {/* Row Action */}
                                        <div className="flex items-center justify-center">
                                            <button
                                                onClick={() => removeTableRow(rowIndex)}
                                                className="flex items-center justify-center w-8 h-8 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors active:scale-95"
                                                title="Delete Row"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </Fragment>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                {!isModal && (
                    <p className="text-xs text-surface-400 dark:text-surface-500 px-1">
                        Headers are editable. Scroll horizontally for more columns.
                    </p>
                )}
            </div>
        </div>
    );
}
