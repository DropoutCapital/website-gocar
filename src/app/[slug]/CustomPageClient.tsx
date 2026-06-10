'use client';

import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import BuilderPageWrapper from '@/components/builder2/BuilderPageWrapper';

export default function CustomPageClient() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';

  if (!slug) {
    notFound();
    return null;
  }

  return (
    <BuilderPageWrapper
      slug={slug}
      fallback={<NotFoundFallback />}
    />
  );
}

function NotFoundFallback() {
  notFound();
  return null;
}
