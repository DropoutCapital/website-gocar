'use client';

import React from 'react';
import { Editor, Frame, useNode } from '@craftjs/core';

// =====================
// Componentes del builder
// =====================
import { Container } from '@/components/builder2/userComponents/Container';
import { Text } from '@/components/builder2/userComponents/Text';
import { Image } from '@/components/builder2/userComponents/Image';
import {
  HeroBasic,
  HeroWithImage,
  HeroWithBackground,
  HeroWithCard,
  HeroCarSearch,
  HeroFeatureCards,
  HeroTestimonial,
  HeroSearchBanner,
  HeroImageDivided,
  HeroWithLogo,
  HeroWelcome,
  HeroWithVideoEmbed,
} from '@/components/builder2/sections/initialfold';
import { HeroMinimalistic } from '@/components/builder2/sections/initialfold/HeroMinimalistic';
import { VehicleGrid } from '@/components/builder2/sections/vehicles';
import { VehicleGrid2 } from '@/components/builder2/sections/vehicles/VehicleGrid2';
import { VehicleCarousel } from '@/components/builder2/sections/vehicles/VehicleCarousel';
import { TraditionalVehicleGrid } from '@/components/builder2/sections/vehicles/TraditionalVehicleGrid';
import { Testimonials } from '@/components/builder2/sections/testimonials';
import { FAQ, WhyChooseUs } from '@/components/builder2/sections/features';
import { TraditionalWhyUs } from '@/components/builder2/sections/features/TraditionalWhyUs';
import { VideoEmbed } from '@/components/builder2/sections/videos/VideoEmbed';
import { ContactCTA } from '@/components/builder2/sections/contact/ContactCTA';
import { TraditionalContactCTA as BuilderTraditionalContactCTA } from '@/components/builder2/sections/contact/TraditionalContactCTA';
import HowToArrive from '@/sections/home/HowToArrive';
import { TraditionalHowToArrive } from '@/components/builder2/sections/contact/TraditionalHowToArrive';
import { FloatingWhatsApp } from '@/components/builder2/sections/contact/FloatingWhatsApp';
// Moderna sections
import { HeroModerno } from '@/components/builder2/sections/moderna/HeroModerno';
import { StatsModerno } from '@/components/builder2/sections/moderna/StatsModerno';
import { TestimonialsModerno } from '@/components/builder2/sections/moderna/TestimonialsModerno';
import { CTAModerno } from '@/components/builder2/sections/moderna/CTAModerno';
import { FooterModerno } from '@/components/builder2/sections/moderna/FooterModerno';
// Premium sections
import { HeroPremium } from '@/components/builder2/sections/premium/HeroPremium';
import { FeatureShowcase } from '@/components/builder2/sections/premium/FeatureShowcase';
import { TestimonialsPremium } from '@/components/builder2/sections/premium/TestimonialsPremium';
import { GalleryPremium } from '@/components/builder2/sections/premium/GalleryPremium';
import { CTAPremium } from '@/components/builder2/sections/premium/CTAPremium';
// Layout sections — rendered by builder, layout conditionally hides its own nav/footer
import { BuilderNavbar } from '@/components/builder2/sections/layout/BuilderNavbar';
import { NavbarSimple } from '@/components/builder2/sections/layout/NavbarSimple';
import { Footer } from '@/components/builder2/sections/layout/Footer';
import { StatsCounter } from '@/components/builder2/sections/marketing/StatsCounter';
import { PromoBanner } from '@/components/builder2/sections/marketing/PromoBanner';
import { AwardsBadges } from '@/components/builder2/sections/marketing/AwardsBadges';
import { TrustBadges } from '@/components/builder2/sections/marketing/TrustBadges';
import { LogoCloud } from '@/components/builder2/sections/marketing/LogoCloud';
import { LogoMarquee } from '@/components/builder2/sections/marketing/LogoMarquee';
import { LogoGrid } from '@/components/builder2/sections/marketing/LogoGrid';
import { PhotoGallery } from '@/components/builder2/sections/media/PhotoGallery';
import { TeamMembers } from '@/components/builder2/sections/team/TeamMembers';

// Form imports
import FinancingForm from '@/components/forms/FinancingForm';
import ConsignmentsForm from '@/components/forms/ConsignmentsForm';
import BuyDirectForm from '@/components/forms/BuyDirectForm';
import WeSearchForm from '@/components/forms/WeSearchForm';
import ContactForm from '@/components/forms/ContactForm';
import useClientStore from '@/store/useClientStore';
import { useTranslation } from '@/i18n/hooks/useTranslation';

// Hook: returns true when viewing in a non-default language (i.e. needs translations)
function useIsTranslated() {
  const { client } = useClientStore();
  const { currentLanguage } = useTranslation();
  const defaultLang = client?.default_language || 'es';
  return !!(client?.has_language_selector && currentLanguage !== defaultLang);
}

// ── Shared helpers — identical colors as admin form embeds ──
interface FormEmbedProps {
  title?: string;
  subtitle?: string;
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
  variant?: string;
  contactEmail?: string;
  contactPhone?: string;
  showEmail?: boolean;
  showPhone?: boolean;
}

function deriveColors(bgColor?: string) {
  const isDark = bgColor && (bgColor.startsWith('#0') || bgColor.startsWith('#1') || bgColor.startsWith('#2'));
  return {
    isDark,
    cardBg: isDark ? '#1c1c1c' : '#ffffff',
    cardBorder: isDark ? '#2a2a2a' : '#e5e7eb',
    infoBg: isDark ? '#1c1c1c' : '#f9fafb',
    subtextColor: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
  };
}

// ── Financing ──
const FinancingFormEmbed = ({ bgColor = '#ffffff', textColor = '#111827', accentColor = '#3b82f6', title, subtitle, contactEmail, contactPhone, showEmail = true, showPhone = true }: FormEmbedProps) => {
  const { connectors } = useNode();
  const { cardBg, cardBorder, infoBg, subtextColor } = deriveColors(bgColor);
  const { client } = useClientStore();
  const finalEmail = contactEmail || client?.contact?.email || '';
  const finalPhone = contactPhone || client?.contact?.phone || '';
  const showContactBlock = showEmail || showPhone;
  return (
    <div ref={(el: HTMLDivElement | null) => { if (el) connectors.connect(el); }} style={{ backgroundColor: bgColor, color: textColor }} className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      {title && <div className="text-center mb-10 max-w-3xl mx-auto"><h1 className="text-3xl sm:text-4xl font-extrabold" style={{ color: textColor }}>{title}</h1>{subtitle && <p className="mt-4 text-lg" style={{ color: subtextColor }}>{subtitle}</p>}</div>}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="rounded-xl shadow-lg p-8 border" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
            <FinancingForm embedded bgColor={cardBg} textColor={textColor} accentColor={accentColor} />
          </div>
          <div className="rounded-xl p-8 border" style={{ backgroundColor: infoBg, borderColor: cardBorder }}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: textColor }}>{'Opciones de financiamiento'}</h2>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3" style={{ color: textColor }}>{'Beneficios'}</h3>
              <ul className="list-disc pl-5 space-y-2">
                {['Aprobaci\u00f3n r\u00e1pida', 'Tasas competitivas', 'Plazos flexibles', 'Sin letra chica'].map((item, i) => (
                  <li key={i} className="text-sm" style={{ color: subtextColor }}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3" style={{ color: textColor }}>{'Requisitos'}</h3>
              <ul className="list-disc pl-5 space-y-2">
                {['C\u00e9dula de identidad', 'Liquidaci\u00f3n de sueldo', 'Comprobante de domicilio', 'Antig\u00fcedad laboral m\u00ednima'].map((item, i) => (
                  <li key={i} className="text-sm" style={{ color: subtextColor }}>{item}</li>
                ))}
              </ul>
            </div>
            {showContactBlock && (
              <div>
                <h3 className="text-lg font-medium mb-3" style={{ color: textColor }}>{'Contacto directo'}</h3>
                <div className="space-y-2">
                  {showEmail && finalEmail && (
                    <p className="text-sm" style={{ color: subtextColor }}>{finalEmail}</p>
                  )}
                  {showPhone && finalPhone && (
                    <p className="text-sm" style={{ color: subtextColor }}>{finalPhone}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Consignments ──
const ConsignmentsFormEmbed = ({ bgColor = '#ffffff', textColor = '#111827', accentColor = '#3b82f6', title, subtitle }: FormEmbedProps) => {
  const { connectors } = useNode();
  const { cardBg, cardBorder, infoBg, subtextColor } = deriveColors(bgColor);
  return (
    <div ref={(el: HTMLDivElement | null) => { if (el) connectors.connect(el); }} style={{ backgroundColor: bgColor, color: textColor }} className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      {title && <div className="text-center mb-10 max-w-3xl mx-auto"><h1 className="text-3xl sm:text-4xl font-extrabold" style={{ color: textColor }}>{title}</h1>{subtitle && <p className="mt-4 text-lg" style={{ color: subtextColor }}>{subtitle}</p>}</div>}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="rounded-xl shadow-lg p-8 border" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
            <ConsignmentsForm embedded bgColor={cardBg} textColor={textColor} accentColor={accentColor} />
          </div>
          <div className="rounded-xl p-8 border" style={{ backgroundColor: infoBg, borderColor: cardBorder }}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: textColor }}>{'\u00bfC\u00f3mo funciona?'}</h2>
            <div className="space-y-5 mb-8">
              {[
                { title: 'Env\u00eda tus datos', desc: 'Completa el formulario con la informaci\u00f3n de tu veh\u00edculo.' },
                { title: 'Evaluaci\u00f3n', desc: 'Nuestro equipo eval\u00faa tu veh\u00edculo y te contactamos.' },
                { title: 'Publicaci\u00f3n', desc: 'Publicamos tu veh\u00edculo en m\u00faltiples plataformas.' },
                { title: 'Venta', desc: 'Gestionamos todo el proceso hasta cerrar la venta.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: accentColor }}>{i + 1}</div>
                  <div><p className="text-sm font-medium" style={{ color: textColor }}>{item.title}</p><p className="text-xs mt-0.5" style={{ color: subtextColor }}>{item.desc}</p></div>
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3" style={{ color: textColor }}>{'Beneficios'}</h3>
              <ul className="list-disc pl-5 space-y-2">
                {['Publicaci\u00f3n en m\u00faltiples plataformas', 'Gesti\u00f3n completa de la venta', 'Mejor precio garantizado'].map((item, i) => (
                  <li key={i} className="text-sm" style={{ color: subtextColor }}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Buy Direct ──
const BuyDirectFormEmbed = ({ bgColor = '#ffffff', textColor = '#111827', accentColor = '#3b82f6', title, subtitle }: FormEmbedProps) => {
  const { connectors } = useNode();
  const { cardBg, cardBorder, infoBg, subtextColor } = deriveColors(bgColor);
  return (
    <div ref={(el: HTMLDivElement | null) => { if (el) connectors.connect(el); }} style={{ backgroundColor: bgColor, color: textColor }} className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      {title && <div className="text-center mb-10 max-w-3xl mx-auto"><h1 className="text-3xl sm:text-4xl font-extrabold" style={{ color: textColor }}>{title}</h1>{subtitle && <p className="mt-4 text-lg" style={{ color: subtextColor }}>{subtitle}</p>}</div>}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="rounded-xl shadow-lg p-8 border" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
            <BuyDirectForm embedded bgColor={cardBg} textColor={textColor} accentColor={accentColor} />
          </div>
          <div className="rounded-xl p-8 border" style={{ backgroundColor: infoBg, borderColor: cardBorder }}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: textColor }}>{'\u00bfC\u00f3mo funciona?'}</h2>
            <div className="space-y-5 mb-8">
              {[
                { title: 'Env\u00eda tus datos', desc: 'Completa el formulario con la informaci\u00f3n de tu veh\u00edculo.' },
                { title: 'Evaluamos', desc: 'Nuestro equipo revisa los datos y eval\u00faa tu veh\u00edculo.' },
                { title: 'Te hacemos una oferta', desc: 'Recibir\u00e1s una oferta justa y transparente.' },
                { title: 'Pago inmediato', desc: 'Si aceptas, realizamos el pago de forma inmediata.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: accentColor }}>{i + 1}</div>
                  <div><p className="text-sm font-medium" style={{ color: textColor }}>{item.title}</p><p className="text-xs mt-0.5" style={{ color: subtextColor }}>{item.desc}</p></div>
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3" style={{ color: textColor }}>{'Beneficios'}</h3>
              <ul className="list-disc pl-5 space-y-2">
                {['Oferta al instante', 'Pago inmediato', 'Sin comisiones ocultas', 'Tr\u00e1mites incluidos'].map((item, i) => (
                  <li key={i} className="text-sm" style={{ color: subtextColor }}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── We Search For You ──
const WeSearchFormEmbed = ({ bgColor = '#ffffff', textColor = '#111827', accentColor = '#3b82f6', title, subtitle }: FormEmbedProps) => {
  const { connectors } = useNode();
  const { cardBg, cardBorder, infoBg, subtextColor } = deriveColors(bgColor);
  return (
    <div ref={(el: HTMLDivElement | null) => { if (el) connectors.connect(el); }} style={{ backgroundColor: bgColor, color: textColor }} className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      {title && <div className="text-center mb-10 max-w-3xl mx-auto"><h1 className="text-3xl sm:text-4xl font-extrabold" style={{ color: textColor }}>{title}</h1>{subtitle && <p className="mt-4 text-lg" style={{ color: subtextColor }}>{subtitle}</p>}</div>}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="rounded-xl shadow-lg p-8 border" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
            <WeSearchForm embedded bgColor={cardBg} textColor={textColor} accentColor={accentColor} />
          </div>
          <div className="rounded-xl p-8 border" style={{ backgroundColor: infoBg, borderColor: cardBorder }}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: textColor }}>{'\u00bfC\u00f3mo funciona?'}</h2>
            <div className="space-y-5 mb-8">
              {[
                { title: 'Cu\u00e9ntanos qu\u00e9 buscas', desc: 'Completa el formulario con tus preferencias y presupuesto.' },
                { title: 'Buscamos por ti', desc: 'Nuestro equipo busca en toda nuestra red de proveedores.' },
                { title: 'Te mostramos opciones', desc: 'Te presentamos las mejores alternativas encontradas.' },
                { title: 'Compra segura', desc: 'Gestionamos la compra con verificaci\u00f3n mec\u00e1nica incluida.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: accentColor }}>{i + 1}</div>
                  <div><p className="text-sm font-medium" style={{ color: textColor }}>{item.title}</p><p className="text-xs mt-0.5" style={{ color: subtextColor }}>{item.desc}</p></div>
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3" style={{ color: textColor }}>{'Beneficios'}</h3>
              <ul className="list-disc pl-5 space-y-2">
                {['B\u00fasqueda personalizada', 'Acceso a red de proveedores', 'Verificaci\u00f3n mec\u00e1nica incluida', 'Garant\u00eda de satisfacci\u00f3n'].map((item, i) => (
                  <li key={i} className="text-sm" style={{ color: subtextColor }}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Contact ──
const ContactFormEmbed = ({ bgColor = '#ffffff', textColor = '#111827', accentColor = '#3b82f6', title, subtitle }: FormEmbedProps) => {
  const { connectors } = useNode();
  const { cardBg, cardBorder, infoBg, subtextColor } = deriveColors(bgColor);
  const { client } = useClientStore();
  return (
    <div ref={(el: HTMLDivElement | null) => { if (el) connectors.connect(el); }} style={{ backgroundColor: bgColor, color: textColor }} className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      {title && <div className="text-center mb-10 max-w-3xl mx-auto"><h1 className="text-3xl sm:text-4xl font-extrabold" style={{ color: textColor }}>{title}</h1>{subtitle && <p className="mt-4 text-lg" style={{ color: subtextColor }}>{subtitle}</p>}</div>}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="rounded-xl shadow-lg p-8 border" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
            <ContactForm embedded bgColor={cardBg} textColor={textColor} accentColor={accentColor} />
          </div>
          <div className="rounded-xl p-8 border" style={{ backgroundColor: infoBg, borderColor: cardBorder }}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: textColor }}>{'Informaci\u00f3n de contacto'}</h2>
            <div className="space-y-6">
              {client?.contact?.phone && <div><h3 className="text-lg font-medium mb-2" style={{ color: textColor }}>{'Tel\u00e9fono'}</h3><p className="text-sm" style={{ color: subtextColor }}>{client.contact.phone}</p></div>}
              {client?.contact?.email && <div><h3 className="text-lg font-medium mb-2" style={{ color: textColor }}>{'Email'}</h3><p className="text-sm" style={{ color: subtextColor }}>{client.contact.email}</p></div>}
              <div><h3 className="text-lg font-medium mb-2" style={{ color: textColor }}>{'Horario de atenci\u00f3n'}</h3><div className="space-y-1"><p className="text-sm" style={{ color: subtextColor }}>{'Lunes a Viernes: 9:00 - 18:00'}</p><p className="text-sm" style={{ color: subtextColor }}>{'S\u00e1bado: 10:00 - 14:00'}</p></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── About ──
interface AboutProps extends FormEmbedProps {
  values?: { title: string; description: string; emoji: string }[];
  teamTitle?: string;
  teamSubtitle?: string;
  members?: { name: string; role: string; imageUrl?: string }[];
  showTeam?: boolean;
}
const AboutContentEmbed = ({
  bgColor = '#ffffff', textColor = '#111827', accentColor = '#3b82f6', title, subtitle,
  values = [], teamTitle = 'Nuestro Equipo', teamSubtitle = '', members = [], showTeam = true,
}: AboutProps) => {
  const { connectors } = useNode();
  const { cardBg, cardBorder, subtextColor } = deriveColors(bgColor);
  const avatarBg = bgColor && (bgColor.startsWith('#0') || bgColor.startsWith('#1') || bgColor.startsWith('#2')) ? '#262626' : '#e5e7eb';
  return (
    <div ref={(el: HTMLDivElement | null) => { if (el) connectors.connect(el); }} style={{ backgroundColor: bgColor, color: textColor }} className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      {title && <div className="text-center mb-10 max-w-3xl mx-auto"><h1 className="text-3xl sm:text-4xl font-extrabold" style={{ color: textColor }}>{title}</h1>{subtitle && <p className="mt-4 text-lg" style={{ color: subtextColor }}>{subtitle}</p>}</div>}
      <div className="max-w-7xl mx-auto">
        {values.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {values.map((card, i) => (
              <div key={i} className="rounded-xl shadow-lg p-8 border text-center" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${accentColor}15` }}>
                  <span className="text-2xl">{card.emoji || '⭐'}</span>
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: textColor }}>{card.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: subtextColor }}>{card.description}</p>
              </div>
            ))}
          </div>
        )}
        {showTeam && members.length > 0 && (
          <>
            <div className="text-center mb-10"><h2 className="text-2xl font-bold mb-2" style={{ color: textColor }}>{teamTitle}</h2>{teamSubtitle && <p className="text-sm" style={{ color: subtextColor }}>{teamSubtitle}</p>}</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {members.map((member, i) => (
                <div key={i} className="rounded-xl shadow-lg p-8 border flex flex-col items-center" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                  {member.imageUrl ? (
                    <img src={member.imageUrl} alt={member.name} className="w-24 h-24 rounded-full mb-4 object-cover" />
                  ) : (
                    <div className="w-24 h-24 rounded-full mb-4" style={{ backgroundColor: avatarBg }} />
                  )}
                  <h3 className="text-lg font-bold" style={{ color: textColor }}>{member.name}</h3>
                  <p className="text-sm mt-1" style={{ color: subtextColor }}>{member.role}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// =====================
// Fallback seguro
// =====================
const Unknown: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <div style={{ display: 'contents' }}>{children}</div>
);
// @ts-ignore
(Unknown as any).craft = {
  displayName: 'Unknown',
  isCanvas: true,
  rules: {},
  props: {},
};

// =====================
// Resolver con Proxy
// =====================
export const baseResolver: Record<string, any> = {
  Container, Text, Image,
  HeroBasic, HeroWithImage, HeroWithBackground, HeroWithCard, HeroCarSearch,
  HeroFeatureCards, HeroTestimonial, HeroSearchBanner, HeroImageDivided,
  HeroWithLogo, HeroWelcome, HeroMinimalistic, HeroWithVideoEmbed,
  VehicleGrid, VehicleGrid2, VehicleCarousel, TraditionalVehicleGrid,
  WhyChooseUs, FAQ, Testimonials, TraditionalWhyUs,
  ContactCTA, TraditionalContactCTA: BuilderTraditionalContactCTA,
  HowToArrive, TraditionalHowToArrive, FloatingWhatsApp,
  VideoEmbed,
  HeroModerno, StatsModerno, TestimonialsModerno, CTAModerno, FooterModerno,
  HeroPremium, FeatureShowcase, TestimonialsPremium, GalleryPremium, CTAPremium,
  BuilderNavbar, NavbarSimple, Footer, StatsCounter, PromoBanner, AwardsBadges, TrustBadges, LogoCloud, LogoMarquee, LogoGrid, PhotoGallery, TeamMembers,
  FinancingFormEmbed, ConsignmentsFormEmbed, BuyDirectFormEmbed, WeSearchFormEmbed, ContactFormEmbed, AboutContentEmbed,
  div: Unknown, p: Unknown, span: Unknown, img: Unknown, Unknown,
};

const resolver = new Proxy(baseResolver, {
  get(target, prop: string) {
    return prop in target ? (target as any)[prop] : Unknown;
  },
});

// =====================
// Error Boundary para Builder
// =====================
class BuilderErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    console.error('[BuilderErrorBoundary] CAUGHT ERROR:', error);
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[BuilderErrorBoundary] Error details:', error, info);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// =====================
// BuilderRenderer
// =====================
export default function BuilderRenderer({
  data,
  themeKey = 'default',
  fallback = null,
}: {
  data: any;
  themeKey?: string;
  fallback?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <BuilderErrorBoundary fallback={fallback || <div />}>
        <Editor key={themeKey} resolver={resolver} enabled={false}>
          <Frame data={data} />
        </Editor>
      </BuilderErrorBoundary>
    </div>
  );
}
