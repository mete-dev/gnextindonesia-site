import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Copy, Check, Home, Bug } from "lucide-react";
import { logCentralizedError } from "../lib/errorLogger";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
  showDetails: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
    showDetails: false
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    logCentralizedError(error, errorInfo?.componentStack || '', 'ErrorBoundary');
  }

  private handleCopyError = () => {
    const errorDetails = `Error: ${this.state.error?.message}\nStack: ${this.state.error?.stack}\nComponent Stack: ${this.state.errorInfo?.componentStack}\nURL: ${typeof window !== 'undefined' ? window.location.href : ''}\nTime: ${new Date().toISOString()}`;
    navigator.clipboard.writeText(errorDetails).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    }).catch(err => {
      console.error('Failed to copy error details:', err);
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 sm:p-6 text-neutral-100 font-sans">
          <div className="max-w-xl w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in">
            {/* Header Icon & Title */}
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 shrink-0">
                <AlertTriangle size={28} />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-500/10 text-rose-400 rounded-md text-[10px] font-extrabold uppercase tracking-widest border border-rose-500/20">
                  <Bug size={12} />
                  <span>Sistem Menemukan Masalah</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
                  Gagal Memuat Halaman
                </h1>
                <p className="text-xs sm:text-sm text-neutral-400">
                  Terjadi kendala teknis saat memproses tampilan ini. Laporan error telah dicatat secara otomatis ke log pemantauan studio.
                </p>
              </div>
            </div>

            {/* Error Message Box */}
            <div className="bg-neutral-950 rounded-2xl border border-neutral-800 p-4 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">
                Pesan Kesalahan:
              </span>
              <p className="font-mono text-xs text-rose-300 break-words font-medium">
                {this.state.error?.message || 'Unknown runtime error'}
              </p>
            </div>

            {/* Collapsible Tech Details */}
            <div>
              <button
                type="button"
                onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                className="text-xs text-neutral-400 hover:text-white underline underline-offset-4 transition-colors font-medium"
              >
                {this.state.showDetails ? 'Sembunyikan Detail Teknis' : 'Tampilkan Detail Stack Trace'}
              </button>

              {this.state.showDetails && (
                <div className="mt-3 p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 font-mono text-[11px] text-neutral-400 max-h-48 overflow-y-auto leading-relaxed space-y-2">
                  {this.state.error?.stack && (
                    <div>
                      <span className="text-amber-400 font-bold block mb-1">Stack Trace:</span>
                      <pre className="whitespace-pre-wrap break-all">{this.state.error.stack}</pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div className="pt-2 border-t border-neutral-800">
                      <span className="text-amber-400 font-bold block mb-1">Component Stack:</span>
                      <pre className="whitespace-pre-wrap break-all">{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neutral-800">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={this.handleReload}
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-white text-neutral-900 rounded-xl text-xs font-bold hover:bg-neutral-200 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <RefreshCw size={14} />
                  <span>Muat Ulang Halaman</span>
                </button>
                <button
                  type="button"
                  onClick={this.handleGoHome}
                  className="px-4 py-2.5 bg-neutral-800 text-neutral-200 hover:text-white hover:bg-neutral-700 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <Home size={14} />
                  <span>Beranda</span>
                </button>
              </div>

              <button
                type="button"
                onClick={this.handleCopyError}
                className="px-3.5 py-2 bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border border-neutral-700/60"
                title="Salin rincian error untuk dilaporkan"
              >
                {this.state.copied ? (
                  <>
                    <Check size={14} className="text-emerald-400" />
                    <span className="text-emerald-400">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Salin Laporan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
