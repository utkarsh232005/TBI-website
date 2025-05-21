
import type { SVGProps } from 'react';

interface InnoNexusLogoProps extends SVGProps<SVGSVGElement> {
  text?: string;
}

export function InnoNexusLogo({ text = "RCEOM-TBI", ...props }: InnoNexusLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 250 50" // Keep viewBox wide enough for "RCEOM-TBI"
      aria-label={`${text} Logo`}
      {...props}
    >
      <text
        x="50%" // Center the text horizontally
        y="35" // Adjust y as needed for vertical alignment
        fontFamily="var(--font-orbitron), sans-serif"
        fontSize="30"
        fontWeight="bold"
        fill="hsl(var(--primary))"
        textAnchor="middle" // Ensure text is centered from its midpoint
      >
        {text}
      </text>
    </svg>
  );
}
