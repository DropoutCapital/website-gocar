import React from 'react';
import { useNode } from '@craftjs/core';
import { Facebook, Instagram, Twitter, Youtube, Linkedin, MessageCircle } from 'lucide-react';
import useClientStore from '@/store/useClientStore';
import { normalizeBuilderLink } from '@/utils/functions';

interface FooterLink { text: string; url: string; }
interface FooterColumn { title: string; links: FooterLink[]; }
interface SocialLink { platform: 'facebook' | 'instagram' | 'twitter' | 'youtube' | 'linkedin' | 'whatsapp'; url: string; }

// Empty stays empty (icon hides). WhatsApp accepts a bare phone → https://wa.me/<digits>.
const normalizeSocialUrl = (platform: string, raw: string): string => {
  const v = (raw || '').trim();
  if (!v || v === '#') return '';
  if (platform === 'whatsapp' && !/^https?:\/\//i.test(v)) {
    const digits = v.replace(/[^\d]/g, '');
    return digits ? `https://wa.me/${digits}` : '';
  }
  return v;
};

interface FooterModernoProps {
  companyName?: string; description?: string; columns?: FooterColumn[];
  socialLinks?: SocialLink[]; copyrightText?: string; bgColor?: string; textColor?: string;
  headingColor?: string; accentColor?: string; dividerColor?: string; socialIconBgColor?: string;
}

const SocialIcon = ({ platform, size = 18 }: { platform: string; size?: number }) => {
  switch (platform) {
    case 'facebook': return <Facebook size={size} />;
    case 'instagram': return <Instagram size={size} />;
    case 'twitter': return <Twitter size={size} />;
    case 'youtube': return <Youtube size={size} />;
    case 'linkedin': return <Linkedin size={size} />;
    case 'whatsapp': return <MessageCircle size={size} />;
    default: return <Facebook size={size} />;
  }
};

export const FooterModerno = ({
  companyName = 'GoAutos', description = 'Tu aliado de confianza en la compra de vehículos.',
  columns = [
    { title: 'Empresa', links: [{ text: 'Sobre nosotros', url: '#about' }, { text: 'Equipo', url: '#team' }, { text: 'Contacto', url: '#contact' }] },
    { title: 'Servicios', links: [{ text: 'Financiamiento', url: '#financing' }, { text: 'Garantía', url: '#warranty' }, { text: 'Test Drive', url: '#testdrive' }] },
    { title: 'Legal', links: [{ text: 'Términos y condiciones', url: '#terms' }, { text: 'Política de privacidad', url: '#privacy' }] },
  ],
  socialLinks = [{ platform: 'facebook', url: '' }, { platform: 'instagram', url: '' }, { platform: 'whatsapp', url: '' }],
  copyrightText = '', bgColor = '#0f172a', textColor = '#94a3b8',
  headingColor = '#ffffff', accentColor = '#3b82f6',
  dividerColor = 'rgba(255,255,255,0.08)', socialIconBgColor = 'rgba(255,255,255,0.06)',
}: FooterModernoProps) => {
  const { connectors } = useNode();
  const { client } = useClientStore();

  // Pick logo based on bgColor luminance
  const logoDark = client?.logo_dark || '';
  const logoLight = client?.logo || '';
  const isDarkBg = (() => {
    const c = (bgColor || '').replace('#', '');
    if (c.length !== 6) return false;
    const r = parseInt(c.substring(0, 2), 16) / 255;
    const g = parseInt(c.substring(2, 4), 16) / 255;
    const b = parseInt(c.substring(4, 6), 16) / 255;
    return 0.299 * r + 0.587 * g + 0.114 * b < 0.4;
  })();
  const finalLogoUrl = isDarkBg ? (logoDark || logoLight) : (logoLight || logoDark);
  const currentYear = new Date().getFullYear();
  const finalName = companyName || client?.name || 'Automotora';
  const finalCopyright = copyrightText || `© ${currentYear} ${finalName}. Todos los derechos reservados.`;

  return (
    <div ref={(el: HTMLDivElement | null) => { if (el) connectors.connect(el); }} style={{ backgroundColor: bgColor, color: textColor, position: 'relative' }} className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          <div className="lg:col-span-4">
            {finalLogoUrl ? (
              <img src={finalLogoUrl} alt={finalName} className="h-10 w-auto mb-4 object-contain" />
            ) : (
              <h3 className="text-xl font-semibold mb-4 tracking-tight" style={{ color: headingColor }} dangerouslySetInnerHTML={{ __html: finalName || '' }} />
            )}
            <p className="text-[14px] leading-relaxed mb-6" style={{ color: textColor }} dangerouslySetInnerHTML={{ __html: description || '' }} />
            {(() => {
              const visible = socialLinks
                .map((s) => ({ ...s, url: normalizeSocialUrl(s.platform, s.url) }))
                .filter((s) => s.url);
              if (visible.length === 0) return null;
              return (
                <div className="flex items-center gap-2">
                  {visible.map((social, index) => (
                    <a key={index} href={social.url} target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                      style={{ backgroundColor: socialIconBgColor, color: textColor }}>
                      <SocialIcon platform={social.platform} />
                    </a>
                  ))}
                </div>
              );
            })()}
          </div>
          {columns.map((col, i) => (
            <div key={i} className="lg:col-span-2 lg:col-start-auto">
              <h4 className="text-[13px] font-semibold uppercase tracking-wider mb-5" style={{ color: headingColor }} dangerouslySetInnerHTML={{ __html: col.title || '' }} />
              <ul className="space-y-3">
                {col.links.map((link, j) => (
                  <li key={j}><a href={normalizeBuilderLink(link.url)} className="text-[14px] transition-colors duration-200" style={{ color: textColor }} dangerouslySetInnerHTML={{ __html: link.text || '' }} /></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 pt-8 text-center" style={{ borderTop: `1px solid ${dividerColor}` }}>
          <p className="text-[13px]" style={{ color: `${textColor}99` }} dangerouslySetInnerHTML={{ __html: finalCopyright || '' }} />
        </div>
      </div>
    </div>
  );
};

FooterModerno.craft = {
  displayName: 'FooterModerno',
  props: {
    companyName: 'GoAutos', description: 'Tu aliado de confianza en la compra de vehículos.',
    columns: [
      { title: 'Empresa', links: [{ text: 'Sobre nosotros', url: '#about' }, { text: 'Equipo', url: '#team' }, { text: 'Contacto', url: '#contact' }] },
      { title: 'Servicios', links: [{ text: 'Financiamiento', url: '#financing' }, { text: 'Garantía', url: '#warranty' }, { text: 'Test Drive', url: '#testdrive' }] },
      { title: 'Legal', links: [{ text: 'Términos y condiciones', url: '#terms' }, { text: 'Política de privacidad', url: '#privacy' }] },
    ],
    socialLinks: [{ platform: 'facebook', url: '' }, { platform: 'instagram', url: '' }, { platform: 'whatsapp', url: '' }],
    copyrightText: '', bgColor: '#0f172a', textColor: '#94a3b8',
    headingColor: '#ffffff', accentColor: '#3b82f6',
    dividerColor: 'rgba(255,255,255,0.08)', socialIconBgColor: 'rgba(255,255,255,0.06)',
  },
  rules: { canDrag: () => true, canDrop: () => true, canMoveIn: () => false },
};
