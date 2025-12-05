import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  size = 'md'
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const variantStyles = {
    danger: {
      icon: 'text-red-500 dark:text-red-400',
      iconBg: 'bg-red-100 dark:bg-red-900/20',
      confirmButton: 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white'
    },
    warning: {
      icon: 'text-amber-500 dark:text-amber-400',
      iconBg: 'bg-amber-100 dark:bg-amber-900/20',
      confirmButton: 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700 text-white'
    },
    info: {
      icon: 'text-blue-500 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/20',
      confirmButton: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white'
    }
  };

  const styles = variantStyles[variant];

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
  }[size];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className={`relative w-full ${maxWidthClass} bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className={`w-14 h-14 rounded-full ${styles.iconBg} flex items-center justify-center mb-4`}>
            <AlertTriangle className={`w-7 h-7 ${styles.icon}`} />
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            {title}
          </h2>

          {/* Message */}
          <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            {message}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleConfirm}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${styles.confirmButton}`}
            >
              {confirmText}
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
