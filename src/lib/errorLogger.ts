import { logAudit } from './audit';

export interface AppErrorPayload {
  message: string;
  name: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
}

export const logCentralizedError = async (
  error: Error,
  componentStack?: string,
  context: string = 'React ErrorBoundary'
): Promise<AppErrorPayload> => {
  const payload: AppErrorPayload = {
    message: error.message || 'Unknown runtime error',
    name: error.name || 'Error',
    stack: error.stack,
    componentStack,
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    timestamp: new Date().toISOString()
  };

  // 1. Console log for development / browser inspection
  console.error(`[CentralizedErrorLogger] ${context}:`, error, { componentStack });

  // 2. Persist recent runtime errors to SessionStorage for debugging
  try {
    if (typeof sessionStorage !== 'undefined') {
      const existing = JSON.parse(sessionStorage.getItem('app_runtime_errors') || '[]');
      existing.unshift(payload);
      sessionStorage.setItem('app_runtime_errors', JSON.stringify(existing.slice(0, 20)));
    }
  } catch (e) {
    // Ignore storage quota errors
  }

  // 3. Persist error to Supabase audit logs
  try {
    const detailsSummary = JSON.stringify({
      type: payload.name,
      message: payload.message,
      path: typeof window !== 'undefined' ? window.location.pathname : '',
      time: payload.timestamp,
      stackSnippet: payload.stack ? payload.stack.slice(0, 350) : ''
    });
    await logAudit('System (ErrorBoundary)', 'REPORT', `Crash: ${payload.message.slice(0, 60)}`, detailsSummary);
  } catch (err) {
    console.warn('Failed to dispatch error payload to audit log:', err);
  }

  return payload;
};
