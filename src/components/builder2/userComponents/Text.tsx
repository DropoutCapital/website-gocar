import React, { forwardRef } from 'react';
import { useNode } from '@craftjs/core';

export type TextAlignType = 'left' | 'center' | 'right' | 'justify';

interface TextProps {
  text?: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: TextAlignType;
  color?: string;
  background?: string;
  padding?: number;
  margin?: number;
}

interface CraftComponent {
  craft: {
    displayName: string;
    props: Record<string, any>;
    related?: {
      toolbar?: React.ComponentType<any>;
    };
  };
}

const TextComponent = forwardRef<HTMLDivElement, TextProps>(
  (
    {
      text = 'Edit me',
      fontSize = 16,
      fontWeight = 'normal',
      textAlign = 'left' as TextAlignType,
      color = '#000000',
      background = 'transparent',
      padding = 10,
      margin = 5,
    }: TextProps,
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
          margin: `${margin}px 0`,
          background,
          borderRadius: '4px',
          border: selected ? '1px dashed #1e88e5' : '1px dashed transparent',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: `${fontSize}px`,
            fontWeight,
            textAlign,
            color,
          }}
          dangerouslySetInnerHTML={{ __html: text || '' }}
        />
      </div>
    );
  }
);

TextComponent.displayName = 'Text';

// Add craft property
(TextComponent as unknown as CraftComponent).craft = {
  displayName: 'Text',
  props: {
    text: 'Edit me',
    fontSize: 16,
    fontWeight: 'normal',
    textAlign: 'left',
    color: '#000000',
    background: 'transparent',
    padding: 10,
    margin: 5,
  },
};

export const Text = TextComponent as typeof TextComponent & CraftComponent;
