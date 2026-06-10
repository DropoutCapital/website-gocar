'use client';

import { Suspense } from 'react';
import TraditionalContactCTA from '@/sections/home/ContactCTA';
import WelcomeSection from '@/sections/home/WelcomeSection';
import WhyUs from '@/sections/home/WhyUs';
import NewVehiclesSection from '@/sections/vehicles/new-vehicles-section';
import BuilderPageWrapper from '@/components/builder2/BuilderPageWrapper';

const HowToArrive = require('@/sections/home/HowToArrive').default;

function TraditionalContent() {
  return (
    <div className="pt-16">
      <WelcomeSection />
      <NewVehiclesSection minimal />
      <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800/30" />}>
        <HowToArrive />
      </Suspense>
      <WhyUs />
      <TraditionalContactCTA />
    </div>
  );
}

export default function HomeClient() {
  return <BuilderPageWrapper slug="home" fallback={<TraditionalContent />} />;
}
