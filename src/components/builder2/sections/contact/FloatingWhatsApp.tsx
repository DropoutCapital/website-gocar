'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import { Icon } from '@iconify/react';
import useClientStore from '@/store/useClientStore';
import { buildWhatsAppUrl } from '@/utils/contact-utils';

type Position = 'right' | 'left';
type Size = 'sm' | 'md' | 'lg';

interface FloatingWhatsAppProps {
  phoneOverride?: string;
  message?: string;
  position?: Position;
  bottomOffset?: number;
  size?: Size;
  bgColor?: string;
  iconColor?: string;
  showTooltip?: boolean;
  tooltipText?: string;
  hideOnMobile?: boolean;
  hideOnDesktop?: boolean;
}

const SIZE_MAP: Record<Size, { btn: number; icon: number }> = {
  sm: { btn: 48, icon: 22 },
  md: { btn: 56, icon: 28 },
  lg: { btn: 64, icon: 32 },
};

export const FloatingWhatsApp = ({
  phoneOverride,
  message = 'Hola, me interesa saber más sobre sus vehículos disponibles.',
  position = 'right',
  bottomOffset = 24,
  size = 'md',
  bgColor = '#25D366',
  iconColor = '#ffffff',
  showTooltip = false,
  tooltipText = '¿Tienes dudas? Escríbenos',
  hideOnMobile = false,
  hideOnDesktop = false,
}: FloatingWhatsAppProps) => {
  const { connectors } = useNode(() => ({}));
  const client = useClientStore((s) => s.client);

  const phoneSource = phoneOverride?.trim() || client?.contact?.phone || '';
  const url = buildWhatsAppUrl(phoneSource, message);
  if (!url) return null;

  const dims = SIZE_MAP[size] || SIZE_MAP.md;

  const visibilityClass = [
    hideOnMobile ? 'hidden md:flex' : 'flex',
    hideOnDesktop ? 'md:hidden' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const positionStyle: React.CSSProperties =
    position === 'left'
      ? { left: 24, bottom: bottomOffset }
      : { right: 24, bottom: bottomOffset };

  return (
    <div
      ref={(el: HTMLDivElement | null) => {
        if (el) connectors.connect(el);
      }}
      className={`fixed z-[60] ${visibilityClass} flex-col items-end`}
      style={positionStyle}
    >
      {showTooltip && tooltipText && (
        <div
          className='mb-2 px-3 py-2 rounded-xl text-sm font-medium shadow-lg whitespace-nowrap'
          style={{
            backgroundColor: '#ffffff',
            color: '#111827',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {tooltipText}
        </div>
      )}
      <a
        href={url}
        target='_blank'
        rel='noopener noreferrer'
        aria-label='Contactar por WhatsApp'
        style={{
          width: dims.btn,
          height: dims.btn,
          backgroundColor: bgColor,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        className='hover:scale-105 hover:shadow-xl'
      >
        <Icon
          icon='logos:whatsapp-icon'
          width={dims.icon}
          height={dims.icon}
          style={{ color: iconColor }}
        />
      </a>
    </div>
  );
};

FloatingWhatsApp.craft = {
  displayName: 'FloatingWhatsApp',
  props: {
    message: 'Hola, me interesa saber más sobre sus vehículos disponibles.',
    position: 'right',
    bottomOffset: 24,
    size: 'md',
    bgColor: '#25D366',
    iconColor: '#ffffff',
    showTooltip: false,
    tooltipText: '¿Tienes dudas? Escríbenos',
    hideOnMobile: false,
    hideOnDesktop: false,
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
  },
};
