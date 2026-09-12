import { supabase } from './supabase';

export const logAudit = async (userName: string, action: 'CREATE' | 'UPDATE' | 'DELETE' | 'REPORT' | 'BACKUP' | 'RESTORE', resource: string, details: string = '') => {
  try {
    await supabase.from('audit_logs').insert([{
      user_name: userName,
      action,
      resource,
      details
    }]);
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
};
