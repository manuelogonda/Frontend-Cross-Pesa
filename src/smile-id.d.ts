import React from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'smart-camera-web': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        [key: string]: unknown;
      };
    }
  }
}