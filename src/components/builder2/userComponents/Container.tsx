import React, { ReactNode, forwardRef } from 'react';
import { useNode } from '@craftjs/core';

type ContentAlign = 'stretch' | 'left' | 'center' | 'right';

interface ContainerProps {
  children?: ReactNode;
  background?: string;
  padding?: number;
  margin?: number;
  borderRadius?: number;
  shadow?: boolean;
  contentAlign?: ContentAlign;
  fullWidth?: boolean;
}

interface CraftComponent {
  craft: {
    displayName: string;
    props: Record<string, any>;
    rules: {
      canDrop: () => boolean;
    };
  };
}

const ALIGN_MAP: Record<Exclude<ContentAlign, 'stretch'>, string> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};

const ContainerComponent = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      children,
      background = '#f5f5f5',
      padding = 20,
      margin = 0,
      borderRadius = 4,
      shadow = false,
      contentAlign = 'stretch',
      fullWidth = false,
    }: ContainerProps,
    ref
  ) => {
    const { connectors, selected } = useNode((state) => ({
      selected: state.events.selected,
    }));

    const alignStyle =
      contentAlign && contentAlign !== 'stretch'
        ? { display: 'flex', flexDirection: 'column' as const, alignItems: ALIGN_MAP[contentAlign] }
        : {};

    // "Ancho completo": contenido pega a los bordes laterales.
    const horizontalPadding = fullWidth ? 0 : padding;

    return (
      <div
        ref={(node) => {
          if (node) {
            connectors.connect(node);
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }
        }}
        style={{
          paddingTop: `${padding}px`,
          paddingBottom: `${padding}px`,
          paddingLeft: `${horizontalPadding}px`,
          paddingRight: `${horizontalPadding}px`,
          background,
          minHeight: '80px',
          margin: `${margin}px 0`,
          borderRadius: fullWidth ? '0px' : `${borderRadius}px`,
          boxShadow: shadow ? '0 3px 6px rgba(0,0,0,0.1)' : 'none',
          position: 'relative',
          border: selected ? '1px dashed #1e88e5' : '1px solid transparent',
          ...alignStyle,
        }}
      >
        {children}
      </div>
    );
  }
);

ContainerComponent.displayName = 'Container';

// Add craft property
(ContainerComponent as unknown as CraftComponent).craft = {
  displayName: 'Container',
  props: {
    background: '#f5f5f5',
    padding: 20,
    margin: 0,
    borderRadius: 4,
    shadow: false,
    contentAlign: 'stretch',
    fullWidth: false,
  },
  rules: { canDrop: () => true },
};

export const Container = ContainerComponent as typeof ContainerComponent &
  CraftComponent;
