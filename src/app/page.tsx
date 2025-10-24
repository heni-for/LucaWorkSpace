import { LandingHeader } from '@/components/landing/header';
import { LandingHero } from '@/components/landing/hero';
import { LandingFeatures } from '@/components/landing/features';
import { LandingArchitecture } from '@/components/landing/architecture';
import { LandingBusiness } from '@/components/landing/business';
import { LandingFooter } from '@/components/landing/footer';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
        <Separator className="my-16" />
        <LandingArchitecture />
        <Separator className="my-16" />
        <LandingBusiness />
      </main>
      <LandingFooter />
    </div>
  );
}
