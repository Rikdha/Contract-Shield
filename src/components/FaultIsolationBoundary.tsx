import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  sectionTitle?: string;
  sectionCode?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class FaultIsolationBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[FaultIsolation] Error trapped in section ${this.props.sectionTitle || 'unknown'}:`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div 
          className="p-6 rounded-lg bg-[#fbfaf7] border border-rose-300 shadow-xs text-stone-900 space-y-3"
          style={{ fontFamily: "'Times New Roman', Times, 'Newsreader', Georgia, serif" }}
        >
          <div className="flex items-center space-x-2 text-rose-900">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <h3 className="font-bold text-sm">
              Fault Isolated in {this.props.sectionTitle || 'Section'}
            </h3>
            {this.props.sectionCode && (
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300 font-bold">
                {this.props.sectionCode}
              </span>
            )}
          </div>
          <p className="text-xs text-stone-600 leading-relaxed font-serif italic">
            An isolated exception occurred within this module. Neighboring sections, contracts, and application state remain unaffected.
          </p>
          {this.state.error && (
            <pre className="p-3 rounded bg-[#f5f2eb] border border-rose-200 text-[11px] font-mono text-rose-950 overflow-x-auto max-h-32">
              {this.state.error.message || String(this.state.error)}
            </pre>
          )}
          <div className="pt-1">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded bg-stone-900 text-[#f6f4ef] text-xs font-bold hover:bg-stone-800 transition shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry / Recover Module</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
