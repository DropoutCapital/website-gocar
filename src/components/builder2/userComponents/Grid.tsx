import React, { ReactNode } from 'react';
import { useNode } from '@craftjs/core';

type Align = 'stretch' | 'start' | 'center' | 'end';

interface GridProps {
  children?: ReactNode;
  columns?: number;
  gap?: number;
  rowMinHeight?: number;
  background?: string;
  padding?: number;
  margin?: number;
  borderRadius?: number;
  justifyItems?: Align;
  alignItems?: Align;
}

// Render del sitio público para la grilla auto-flujo (espejo de goautos-admin).
export const Grid = ({
  children,
  columns = 3,
  gap = 16,
  rowMinHeight = 100,
  background = 'transparent',
  padding = 16,
  margin = 0,
  borderRadius = 0,
  justifyItems = 'stretch',
  alignItems = 'stretch',
}: GridProps) => {
  const { connectors, selected } = useNode((node) => ({
    selected: node.events.selected,
  }));

  const cols = Math.max(1, Math.min(12, Number(columns) || 1));

  return (
    <div
      ref={(el: HTMLDivElement | null) => { if (el) connectors.connect(el); }}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridAutoRows: `minmax(${rowMinHeight}px, auto)`,
        gap: `${gap}px`,
        background,
        padding: `${padding}px`,
        margin: `${margin}px 0`,
        borderRadius: `${borderRadius}px`,
        justifyItems,
        alignItems,
        minHeight: '80px',
        position: 'relative',
        border: selected ? '2px dashed #666666' : '1px solid transparent',
      }}
    >
      {children}
    </div>
  );
};

Grid.craft = {
  displayName: 'Grid',
  props: {
    columns: 3,
    gap: 16,
    rowMinHeight: 100,
    background: 'transparent',
    padding: 16,
    margin: 0,
    borderRadius: 0,
    justifyItems: 'stretch',
    alignItems: 'stretch',
  },
  rules: { canDrop: () => true },
};
