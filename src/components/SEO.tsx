import React from 'react';
import { usePageMeta, UsePageMetaProps } from '../hooks/usePageMeta';

export interface SEOProps extends UsePageMetaProps {}

export function SEO(props: SEOProps) {
  const { PageMeta } = usePageMeta(props);
  return <PageMeta />;
}

export default SEO;
