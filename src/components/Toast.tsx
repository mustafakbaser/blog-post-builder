import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

const Toast = ({ message, type, onClose, duration = 3000 }: ToastProps) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    // Animate progress bar
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
    }, 30);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [duration, onClose]);

  const isSuccess = type === 'success';

  return (
    <div className="fixed top-4 right-4 z-[200] animate-toast-enter">
      <div className={`relative flex items-center gap-3 px-4 py-3 rounded-xl shadow-elevated border backdrop-blur-sm overflow-hidden ${
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
          className={`p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors active:scale-90 ${
            isSuccess
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-red-600 dark:text-red-400'
          }`}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Countdown progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5">
          <div
            className={`h-full transition-none ${
              isSuccess ? 'bg-emerald-500/50' : 'bg-red-500/50'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Toast;
