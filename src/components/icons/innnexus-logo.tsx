import type { SVGProps } from 'react';

export function InnoNexusLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      aria-label="RCEOM-TBI Logo"
      {...props}
    >
      <text
        x="10"
        y="35"
        fontFamily="var(--font-orbitron), sans-serif"
        fontSize="30"
        fontWeight="bold"
        fill="hsl(var(--primary))"
      >
        RCEOM-TBI
      </text>
    </svg>
  );
}
