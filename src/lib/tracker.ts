import { supabase } from './supabase';

export function trackArticleView(articleId: string, currentViews: number = 0, portalId: string = 'gnext') {
  if (typeof window === 'undefined' || !articleId) return;

  const sessionKey = `viewed_art_${articleId}`;
  if (!sessionStorage.getItem(sessionKey)) {
    sessionStorage.setItem(sessionKey, 'true');

    // Only query Supabase if articleId is a valid UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(articleId);
    if (isUuid) {
      const nextViews = currentViews + 1;
      Promise.resolve(
        supabase.from('articles').update({ views: nextViews }).eq('id', articleId)
      ).catch((err) => console.error('Error updating article views:', err));
    }
  }
}

export function trackPortalVisit(portalId: string) {
  if (typeof window === 'undefined' || !portalId) return;

  const sessionKey = `visited_portal_${portalId}_${new Date().toISOString().slice(0, 10)}`;
  if (!sessionStorage.getItem(sessionKey)) {
    sessionStorage.setItem(sessionKey, 'true');
  }
}

export function getLocalViewsMap(): Record<string, number> {
  return {};
}

export function getLocalPortalVisitsMap(): Record<string, number> {
  return {};
}


