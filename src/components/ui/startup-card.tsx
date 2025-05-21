
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { cn } from "@/lib/utils"; // Added missing import

interface Startup {
  id: string;
  name: string;
  logoUrl: string;
  description: string;
  badgeText: string;
  websiteUrl?: string;
  dataAiHint?: string;
}

interface StartupCardProps {
  startup: Startup;
  className?: string;
}

export default function StartupCard({ startup, className }: StartupCardProps) {
  return (
    <Card className={cn(
      "group relative overflow-hidden bg-card shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30 hover:border-primary/50 rounded-3xl",
      className
    )}>
      <CardHeader className="p-4">
        <div className="relative h-20 w-full mb-4">
          <Image
            src={startup.logoUrl}
            alt={`${startup.name} logo`}
            fill
            style={{ objectFit: 'contain' }}
            className="transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={startup.dataAiHint || "startup logo"}
          />
        </div>
        <CardTitle className="font-orbitron text-xl text-foreground group-hover:text-primary transition-colors text-center">
          {startup.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-3 h-[3.75rem]">{startup.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <Badge variant="outline" className="border-accent text-accent bg-accent/10 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
          {startup.badgeText}
        </Badge>
        {startup.websiteUrl && (
          <a
            href={startup.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
            aria-label={`Visit ${startup.name} website`}
          >
            <ExternalLink size={18} />
          </a>
        )}
      </CardFooter>
    </Card>
  );
}
