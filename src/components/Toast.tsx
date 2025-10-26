import { CheckCircle2, XCircle, AlertCircle, X } from "lucide-react";

interface ToastProps {
  type: "success" | "error" | "warning";
  message: string;
  onClose: () => void;
}

export default function Toast({ type, message, onClose }: ToastProps) {
  const styles = {
    success: {
      bg: "bg-green-500/90",
      border: "border-green-500/20",
      icon: CheckCircle2,
    },
    error: {
      bg: "bg-red-500/90",
      border: "border-red-500/20",
      icon: XCircle,
    },
    warning: {
      bg: "bg-yellow-500/90",
      border: "border-yellow-500/20",
      icon: AlertCircle,
    },
  };

  const config = styles[type];
  const Icon = config.icon;

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
      <div
        className={`flex items-center gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm ${config.bg} ${config.border} text-white`}
      >
        <Icon className="w-5 h-5 shrink-0" />
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          onClick={onClose}
          className="shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
