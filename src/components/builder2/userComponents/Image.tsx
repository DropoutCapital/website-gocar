import React, { forwardRef } from 'react';
import { useNode } from '@craftjs/core';

interface ImageProps {
  src?: string;
  alt?: string;
  width?: string;
  height?: string;
  padding?: number;
  margin?: number;
  borderRadius?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  align?: 'left' | 'center' | 'right';
}

interface CraftComponent {
  craft: {
    displayName: string;
    props: Record<string, any>;
  };
}

const ImageComponent = forwardRef<HTMLDivElement, ImageProps>(
  (
    {
      src = 'https://via.placeholder.com/300x200',
      alt = 'Image',
      width = '100%',
      height = 'auto',
      padding = 0,
      margin = 0,
      borderRadius = 4,
      objectFit = 'cover',
      align = 'left',
    }: ImageProps,
    ref
  ) => {
    const { connectors, selected } = useNode((state) => ({
      selected: state.events.selected,
    }));

    const marginLeft = align === 'left' ? '0' : 'auto';
    const marginRight = align === 'right' ? '0' : 'auto';

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
          borderRadius: `${borderRadius}px`,
          border: selected ? '1px dashed #1e88e5' : 'none',
        }}
      >
        <img
          src={src}
          alt={alt}
          style={{
            width,
            height,
            display: 'block',
            marginLeft,
            marginRight,
            borderRadius: `${borderRadius}px`,
            objectFit,
          }}
        />
      </div>
    );
  }
);

ImageComponent.displayName = 'Image';

// Add craft property
(ImageComponent as unknown as CraftComponent).craft = {
  displayName: 'Image',
  props: {
    src: 'https://via.placeholder.com/300x200',
    alt: 'Image',
    width: '100%',
    height: 'auto',
    padding: 0,
    margin: 0,
    borderRadius: 4,
    objectFit: 'cover',
    align: 'left',
  },
};

export const Image = ImageComponent as typeof ImageComponent & CraftComponent;
