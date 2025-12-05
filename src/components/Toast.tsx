import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

const Toast = ({ message, type, onClose, duration = 3000 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const isSuccess = type === 'success';

  return (
    <div className="fixed top-4 right-4 z-[200] animate-in slide-in-from-top-5 duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-sm ${
        isSuccess
          ? 'bg-emerald-50/95 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700'
          : 'bg-red-50/95 dark:bg-red-900/30 border-red-200 dark:border-red-700'
      }`}>
        {isSuccess ? (
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        ) : (
          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
        )}

        <p className={`text-sm font-medium ${
          isSuccess
            ? 'text-emerald-900 dark:text-emerald-100'
            : 'text-red-900 dark:text-red-100'
        }`}>
          {message}
        </p>

        <button
          onClick={onClose}
          className={`p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
            isSuccess
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-red-600 dark:text-red-400'
          }`}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
