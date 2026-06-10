'use client';
import React, { useEffect, useState } from 'react';
import { Editor, Frame } from '@craftjs/core';
import lz from 'lzutf8';
import { supabase } from '@/lib/supabase';
import useClientStore from '@/store/useClientStore';
import useThemeStore from '@/store/useThemeStore';

export const runtime = 'nodejs';

// === User components ===
import { Container } from '@/components/builder2/userComponents/Container';
import { Text } from '@/components/builder2/userComponents/Text';
import { Image } from '@/components/builder2/userComponents/Image';
import { Button } from '@/components/builder2/userComponents/Button';
import { Heading } from '@/components/builder2/userComponents/Heading';
import { Divider } from '@/components/builder2/userComponents/Divider';
import { Spacer } from '@/components/builder2/userComponents/Spacer';
import { SocialLinks } from '@/components/builder2/userComponents/SocialLinks';
import { Icon } from '@/components/builder2/userComponents/Icon';

// === Hero / Initial fold ===
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
  HeroMega,
} from '@/components/builder2/sections/initialfold';
import { HeroMinimalistic } from '@/components/builder2/sections/initialfold/HeroMinimalistic';

// === Vehicles ===
import { VehicleGrid } from '@/components/builder2/sections/vehicles';
import { VehicleGrid2 } from '@/components/builder2/sections/vehicles/VehicleGrid2';
import { VehicleCarousel } from '@/components/builder2/sections/vehicles/VehicleCarousel';
import { TraditionalVehicleGrid } from '@/components/builder2/sections/vehicles/TraditionalVehicleGrid';

// === Features ===
import { FAQ, WhyChooseUs } from '@/components/builder2/sections/features';
import { TraditionalWhyUs } from '@/components/builder2/sections/features/TraditionalWhyUs';
import { Testimonials } from '@/components/builder2/sections/testimonials';

// === Contact ===
import { ContactCTA } from '@/components/builder2/sections/contact/ContactCTA';
import { TraditionalContactCTA } from '@/components/builder2/sections/contact/TraditionalContactCTA';
import HowToArrive from '@/sections/home/HowToArrive';
import { TraditionalHowToArrive } from '@/components/builder2/sections/contact/TraditionalHowToArrive';

// === Videos ===
import { VideoEmbed } from '@/components/builder2/sections/videos/VideoEmbed';

// === Marketing / Media / Team ===
import { StatsCounter } from '@/components/builder2/sections/marketing/StatsCounter';
import { PromoBanner } from '@/components/builder2/sections/marketing/PromoBanner';
import { PhotoGallery } from '@/components/builder2/sections/media/PhotoGallery';
import { TeamMembers } from '@/components/builder2/sections/team/TeamMembers';

// === Moderna sections ===
import { HeroModerno } from '@/components/builder2/sections/moderna/HeroModerno';
import { StatsModerno } from '@/components/builder2/sections/moderna/StatsModerno';
import { TestimonialsModerno } from '@/components/builder2/sections/moderna/TestimonialsModerno';
import { CTAModerno } from '@/components/builder2/sections/moderna/CTAModerno';
import { FooterModerno as FooterModernoReal } from '@/components/builder2/sections/moderna/FooterModerno';

// === Premium sections ===
import { HeroPremium } from '@/components/builder2/sections/premium/HeroPremium';
import { FeatureShowcase } from '@/components/builder2/sections/premium/FeatureShowcase';
import { TestimonialsPremium } from '@/components/builder2/sections/premium/TestimonialsPremium';
import { GalleryPremium } from '@/components/builder2/sections/premium/GalleryPremium';
import { CTAPremium } from '@/components/builder2/sections/premium/CTAPremium';

// === Form imports — render REAL forms on the website ===
import FinancingForm from '@/components/forms/FinancingForm';
import ConsignmentsForm from '@/components/forms/ConsignmentsForm';
import BuyDirectForm from '@/components/forms/BuyDirectForm';
import WeSearchForm from '@/components/forms/WeSearchForm';
import ContactForm from '@/components/forms/ContactForm';

// === Form embed wrappers — pass builder props to real forms ===
interface FormEmbedProps {
  title?: string;
  subtitle?: string;
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
}

const FormEmbedWrapper = ({ title, subtitle, bgColor, textColor, accentColor, children }: FormEmbedProps & { children: React.ReactNode }) => {
  const isDark = bgColor && (bgColor.startsWith('#0') || bgColor.startsWith('#1') || bgColor.startsWith('#2'));
  const subtextColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';

  return (
    <div
      className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {title && (
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold" style={{ color: textColor }}>{title}</h1>
          {subtitle && <p className="mt-4 text-lg" style={{ color: subtextColor }}>{subtitle}</p>}
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
};

const FinancingFormEmbed = (props: FormEmbedProps) => (
  <FormEmbedWrapper {...props}><FinancingForm bgColor={props.bgColor} textColor={props.textColor} accentColor={props.accentColor} /></FormEmbedWrapper>
);
const ConsignmentsFormEmbed = (props: FormEmbedProps) => (
  <FormEmbedWrapper {...props}><ConsignmentsForm bgColor={props.bgColor} textColor={props.textColor} accentColor={props.accentColor} /></FormEmbedWrapper>
);
const BuyDirectFormEmbed = (props: FormEmbedProps) => (
  <FormEmbedWrapper {...props}><BuyDirectForm bgColor={props.bgColor} textColor={props.textColor} accentColor={props.accentColor} /></FormEmbedWrapper>
);
const WeSearchFormEmbed = (props: FormEmbedProps) => (
  <FormEmbedWrapper {...props}><WeSearchForm bgColor={props.bgColor} textColor={props.textColor} accentColor={props.accentColor} /></FormEmbedWrapper>
);
const ContactFormEmbed = (props: FormEmbedProps) => (
  <FormEmbedWrapper {...props}><ContactForm title={props.title} subtitle={props.subtitle} bgColor={props.bgColor} textColor={props.textColor} accentColor={props.accentColor} /></FormEmbedWrapper>
);
const AboutContentEmbed = ({ title, subtitle, bgColor, textColor }: { title?: string; subtitle?: string; bgColor?: string; textColor?: string }) => (
  <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" style={{ backgroundColor: bgColor, color: textColor }}>
    {title && (
      <div className="text-center mb-10 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold">{title}</h1>
        {subtitle && <p className="mt-4 text-lg opacity-60">{subtitle}</p>}
      </div>
    )}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      <div className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <span className="text-xl">🎯</span>
        </div>
        <h3 className="font-semibold mb-2">Nuestra Misión</h3>
        <p className="text-sm opacity-70">Ofrecer la mejor experiencia en la compra y venta de vehículos.</p>
      </div>
      <div className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <span className="text-xl">🤝</span>
        </div>
        <h3 className="font-semibold mb-2">Confianza</h3>
        <p className="text-sm opacity-70">Transparencia y honestidad en cada transacción.</p>
      </div>
      <div className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
          <span className="text-xl">⭐</span>
        </div>
        <h3 className="font-semibold mb-2">Excelencia</h3>
        <p className="text-sm opacity-70">Calidad y servicio premium en todo lo que hacemos.</p>
      </div>
    </div>
  </div>
);

// === Nav/Footer — render the REAL builder components ===
import { BuilderNavbar as BuilderNavbarReal } from '@/components/builder2/sections/layout/BuilderNavbar';
import { Footer as FooterReal } from '@/components/builder2/sections/layout/Footer';
import { FooterModerno as FooterModernoReal2 } from '@/components/builder2/sections/moderna/FooterModerno';

// ---------- Fallback seguro (con .craft) ----------
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

// ---------- Resolver completo (alineado con admin Builder2.tsx) ----------
const baseResolver: Record<string, any> = {
  // User components
  Container, Text, Image, Button, Heading, Divider, Spacer, SocialLinks, Icon,
  // Hero sections
  HeroBasic, HeroWithImage, HeroWithBackground, HeroWithCard, HeroCarSearch,
  HeroFeatureCards, HeroTestimonial, HeroSearchBanner, HeroImageDivided,
  HeroWithLogo, HeroWelcome, HeroMinimalistic, HeroMega,
  // Vehicle sections
  VehicleGrid, VehicleGrid2, VehicleCarousel, TraditionalVehicleGrid,
  // Feature sections
  WhyChooseUs, FAQ, Testimonials, TraditionalWhyUs,
  // Contact sections
  ContactCTA, TraditionalContactCTA, HowToArrive, TraditionalHowToArrive,
  // Media
  VideoEmbed,
  // Layout — render real builder nav/footer
  BuilderNavbar: BuilderNavbarReal,
  Footer: FooterReal,
  FooterModerno: FooterModernoReal2,
  StatsCounter, PromoBanner, PhotoGallery, TeamMembers,
  // Moderna sections
  HeroModerno, StatsModerno, TestimonialsModerno, CTAModerno,
  // Premium sections
  HeroPremium, FeatureShowcase, TestimonialsPremium, GalleryPremium, CTAPremium,
  // Form embeds — REAL forms
  FinancingFormEmbed, ConsignmentsFormEmbed, BuyDirectFormEmbed,
  WeSearchFormEmbed, ContactFormEmbed, AboutContentEmbed,
  // Fallbacks
  div: Unknown, p: Unknown, span: Unknown, img: Unknown, Unknown,
};

const resolver = new Proxy(baseResolver, {
  get(target, prop: string) {
    return prop in target ? (target as any)[prop] : Unknown;
  },
});

// ---------- Sanitizador: blinda cualquier nodo roto ----------
function sanitizeCraftState(state: any) {
  if (!state || typeof state !== 'object') return state;

  const ensureType = (node: any) => {
    if (!node) return node;
    const resolvedName = node?.type?.resolvedName;
    if (!resolvedName || !(resolvedName in baseResolver)) {
      node.type = { resolvedName: 'Unknown' };
      node.displayName = 'Unknown';
    }
    return node;
  };

  if (state.nodes && typeof state.nodes === 'object') {
    const originalNodes = state.nodes as Record<string, any>;
    const validIds = Object.keys(originalNodes).filter((id) => {
      const n = originalNodes[id];
      return n && typeof n === 'object';
    });

    const sanitizedMap: Record<string, any> = {};
    for (const id of validIds) {
      sanitizedMap[id] = ensureType({ ...originalNodes[id] });
    }

    for (const id of Object.keys(sanitizedMap)) {
      const node = sanitizedMap[id];
      if (Array.isArray(node.nodes)) {
        node.nodes = node.nodes.filter((childId: string) =>
          validIds.includes(childId)
        );
      }
      if (node.linkedNodes && typeof node.linkedNodes === 'object') {
        const ln: Record<string, string> = node.linkedNodes;
        for (const key of Object.keys(ln)) {
          if (!validIds.includes(ln[key])) delete ln[key];
        }
        node.linkedNodes = ln;
      }
    }
    return { ...state, nodes: sanitizedMap };
  }

  const next: any = { ...state };
  for (const key of Object.keys(next)) {
    if (key === 'ROOT' || key.startsWith('node')) {
      next[key] = ensureType({ ...next[key] });
    }
  }
  return next;
}

export default function WebsitePage() {
  const { client, isLoading: isClientLoading } = useClientStore();
  const { theme } = useThemeStore();
  const [json, setJson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dualStateRef = React.useRef<{ light: string; dark: string } | null>(null);

  useEffect(() => {
    const fetchState = async () => {
      if (!client?.id) return;
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('client_website_config')
          .select('elements_structure, color_scheme')
          .eq('client_id', client.id)
          .single();

        if (error) throw error;

        if (!data?.elements_structure) {
          setError('No hay estado guardado para este cliente.');
        } else {
          const raw = String(data.elements_structure);

          // Detect dual-theme envelope (v2 format)
          let compressedData = raw;
          try {
            const envelope = JSON.parse(raw);
            if (envelope?.v === 2) {
              dualStateRef.current = { light: envelope.light, dark: envelope.dark };
              const activeTheme = theme || (data.color_scheme === 'DARK' ? 'dark' : 'light');
              compressedData = activeTheme === 'dark' ? envelope.dark : envelope.light;
            }
          } catch {
            // Legacy single-theme format
          }

          const decompressed = JSON.parse(
            lz.decompress(lz.decodeBase64(compressedData))
          );
          const sanitized = sanitizeCraftState(decompressed);
          setJson(sanitized);
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar el estado');
      } finally {
        setIsLoading(false);
      }
    };

    if (client?.id) {
      fetchState();
    } else if (!isClientLoading) {
      setIsLoading(false);
    }
  }, [client?.id, isClientLoading]);

  // Swap builder state when user toggles theme
  useEffect(() => {
    if (!dualStateRef.current) return;
    const compressed = theme === 'dark' ? dualStateRef.current.dark : dualStateRef.current.light;
    if (!compressed) return;
    try {
      const decompressed = JSON.parse(lz.decompress(lz.decodeBase64(compressed)));
      const sanitized = sanitizeCraftState(decompressed);
      setJson(sanitized);
    } catch {}
  }, [theme]);

  if (isLoading) return <div className="p-8 text-center">Cargando vista previa…</div>;
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  if (!json) return <div className="p-8 text-center">No hay contenido para mostrar.</div>;

  return (
    <div className="min-h-screen">
      <Editor key={theme} resolver={resolver} enabled={false}>
        <div>
          <Frame data={json} />
        </div>
      </Editor>
    </div>
  );
}
