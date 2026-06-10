import HomeSeoContent from '@/components/seo/HomeSeoContent';
import HomeClient from './HomeClient';

export const runtime = 'nodejs';

export default function Home() {
  return (
    <>
      {/* Contenido indexable en el HTML del servidor (el builder es client-side). */}
      <HomeSeoContent />
      <HomeClient />
    </>
  );
}
