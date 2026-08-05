import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('ErrorBoundary caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 bg-slate-50 dark:bg-slate-950 text-center">
          <div className="w-16 h-16 rounded-2xl bg-danger-500/10 flex items-center justify-center text-danger-500">
            <AlertTriangle size={30} />
          </div>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-white">Application error</h1>
          <p className="text-sm text-slate-500 max-w-md">An unexpected error occurred while rendering this page. Try reloading.</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            <RefreshCw size={16} /> Reload application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
