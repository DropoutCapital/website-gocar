import React, { ReactNode, forwardRef } from 'react';
import { useNode } from '@craftjs/core';

interface ContainerProps {
  children?: ReactNode;
  background?: string;
  padding?: number;
  margin?: number;
  borderRadius?: number;
  shadow?: boolean;
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

const ContainerComponent = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      children,
      background = '#f5f5f5',
      padding = 20,
      margin = 0,
      borderRadius = 4,
      shadow = false,
    }: ContainerProps,
    ref
  ) => {
    const { connectors, selected } = useNode((state) => ({
      selected: state.events.selected,
    }));

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
          padding: `${padding}px`,
          background,
          minHeight: '80px',
          margin: `${margin}px 0`,
          borderRadius: `${borderRadius}px`,
          boxShadow: shadow ? '0 3px 6px rgba(0,0,0,0.1)' : 'none',
          position: 'relative',
          border: selected ? '1px dashed #1e88e5' : '1px solid transparent',
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
  },
  rules: { canDrop: () => true },
};

export const Container = ContainerComponent as typeof ContainerComponent &
  CraftComponent;
