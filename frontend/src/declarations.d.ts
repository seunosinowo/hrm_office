declare module '*.css';
declare module '*.scss';
declare module '*.sass';
declare module '*.less';

// SVG React component imports (vite-plugin-svgr)
declare module '*.svg?react' {
  import { FC, SVGProps } from 'react';
  export const ReactComponent: FC<SVGProps<SVGSVGElement>>;
  const ReactComponentDefault: FC<SVGProps<SVGSVGElement>>;
  export default ReactComponentDefault;
}

// Plain SVG imports as URL
declare module '*.svg' {
  const src: string;
  export default src;
}