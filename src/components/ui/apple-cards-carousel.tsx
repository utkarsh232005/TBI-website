"use client";
import React, {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Image, { ImageProps } from "next/image";
import { useOutsideClick } from "@/hooks/use-outside-click";

interface CarouselProps {
  items: JSX.Element[];
  initialScroll?: number;
}

type Card = {
  src: string;
  title: string;
  category: string;
  content: React.ReactNode;
};

export const CarouselContext = createContext<{
  onCardClose: (index: number) => void;
  currentIndex: number;
}>({
  onCardClose: () => {},
  currentIndex: 0,
});

export const Carousel = ({ items, initialScroll = 0 }: CarouselProps) => {
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);  const [mounted, setMounted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Add a delay to ensure all components are fully mounted
    const readyTimer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(readyTimer);
  }, []);

  useEffect(() => {
    if (carouselRef.current && mounted && isReady) {
      carouselRef.current.scrollLeft = initialScroll;
      // Add delay to ensure content is rendered and images loaded
      const scrollTimer = setTimeout(() => {
        checkScrollability();
      }, 200);
      return () => clearTimeout(scrollTimer);
    }
  }, [initialScroll, mounted, isReady, items.length]);

  // Force re-render when items change
  useEffect(() => {
    if (mounted && isReady && items.length > 0) {
      const updateTimer = setTimeout(() => {
        checkScrollability();
      }, 300);
      return () => clearTimeout(updateTimer);
    }
  }, [items, mounted, isReady]);
  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // Add small buffer
    }
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
      // Force update after scroll
      setTimeout(checkScrollability, 100);
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
      // Force update after scroll
      setTimeout(checkScrollability, 100);
    }
  };

  // Add resize observer to handle window resize
  useEffect(() => {
    const handleResize = () => {
      setTimeout(checkScrollability, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Force re-render when scrolling stops
  const handleScroll = () => {
    checkScrollability();
  };

  const handleCardClose = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = isMobile() ? 230 : 280; // Square card size
      const gap = isMobile() ? 4 : 8;
      const scrollPosition = (cardWidth + gap) * (index + 1);
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };
  const isMobile = () => {
    return typeof window !== "undefined" && window.innerWidth < 768;
  };

  return (
    <CarouselContext.Provider
      value={{ onCardClose: handleCardClose, currentIndex }}
    >
      <div className="relative w-full overflow-hidden">
        {/* Carousel scroll container */}
        <div
          className="flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth py-10 [scrollbar-width:none] md:py-16 relative z-[1]"
          ref={carouselRef}
          onScroll={handleScroll}
        >          <div
            className={cn(
              "flex flex-row justify-start gap-4 pl-4",
              "mx-auto max-w-7xl", 
            )}
          >
            {items.map((item, index) => (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.4,
                  delay: 0.1 * index,
                  ease: "easeOut",
                }}
                key={`card-${index}`}
                className="rounded-3xl last:pr-[5%] md:last:pr-[33%]"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>        {/* Left vignette effect - sticky to carousel section */}
        <div 
          className={cn(
            "absolute left-0 top-0 bottom-0 z-[70] w-[6%] sm:w-[8%] md:w-[10%] lg:w-[12%] pointer-events-none",
            "bg-gradient-to-r from-background via-background/70 to-transparent"
          )}
        ></div>
        
        {/* Right vignette effect - sticky to carousel section */}
        <div
          className={cn(
            "absolute right-0 top-0 bottom-0 z-[70] w-[6%] sm:w-[8%] md:w-[10%] lg:w-[12%] pointer-events-none", 
            "bg-gradient-to-l from-background via-background/70 to-transparent"
          )}
        ></div>

        {/* Navigation buttons */}
        <div className="mr-10 flex justify-center gap-8 relative z-[10]">
          <button
            className="relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 disabled:opacity-50"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
          >
            <ArrowLeft className="h-5 w-5 text-accent" />
          </button>
          <h2 className="text-center text-lg font-semibold text-accent">Scroll to see more</h2>
          <button
            className="relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 disabled:opacity-50"
            onClick={scrollRight}
            disabled={!canScrollRight}
          >
            <ArrowRight className="h-5 w-5 text-accent" />
          </button>
        </div>
      </div>
    </CarouselContext.Provider>
  );
};

export const Card = ({
  card,
  index,
  layout = false,
}: {
  card: Card;
  index: number;
  layout?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { onCardClose, currentIndex } = useContext(CarouselContext);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useOutsideClick(containerRef, () => handleClose());

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    onCardClose(index);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 h-screen overflow-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 h-full w-full bg-black/80 backdrop-blur-lg"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              ref={containerRef}
              layoutId={layout ? `card-${card.title}` : undefined}
              className="relative z-[60] mx-auto my-10 h-fit max-w-5xl rounded-3xl bg-card p-4 font-sans md:p-10"
            >
              <button
                className="sticky top-4 right-0 ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-accent"
                onClick={handleClose}
              >
                <X className="h-5 w-5 text-accent-foreground" />
              </button>
              <motion.p
                layoutId={layout ? `category-${card.title}` : undefined}
                className="text-base font-medium text-accent"
              >
                {card.category}
              </motion.p>
              <motion.p
                layoutId={layout ? `title-${card.title}` : undefined}
                className="mt-4 text-2xl font-semibold text-foreground md:text-5xl"
              >
                {card.title}
              </motion.p>
              <div className="py-10">{card.content}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>      <motion.button
        layoutId={layout ? `card-${card.title}` : undefined}
        onClick={handleOpen}
        className="relative z-10 flex aspect-square h-60 w-60 flex-col items-start justify-start overflow-hidden rounded-xl bg-card border border-border md:h-64 md:w-64"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        style={{ willChange: "transform" }} // Optimize for animations
      >
        {/* Background image - moved to lowest z-index */}
        <div className="absolute inset-0 z-0 bg-muted/10">
          <BlurImage
            src={card.src}
            alt={card.title}
            width={500}
            height={500}
            className="object-cover"
          />
        </div>
        
        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
        
        {/* Text content */}
        <div className="relative z-30 p-5">
          <motion.p
            layoutId={layout ? `category-${card.category}` : undefined}
            className="text-left font-sans text-sm font-medium text-white md:text-base"
          >
            {card.category}
          </motion.p>
          <motion.p
            layoutId={layout ? `title-${card.title}` : undefined}
            className="mt-2 max-w-xs text-left font-sans text-lg font-semibold [text-wrap:balance] text-white md:text-xl"
          >
            {card.title}
          </motion.p>
        </div>
      </motion.button>
    </>
  );
};

export const BlurImage = ({
  height,
  width,
  src,
  className,
  alt,
  fill,
  ...rest
}: ImageProps) => {
  const [isLoading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;
  
  // Generate fallback URL based on alt text
  const generateFallbackUrl = (text: string) => {
    const initials = text?.substring(0, 2)?.toUpperCase() || "ST";
    return `https://placehold.co/500x500/121212/FFFFFF.png?text=${encodeURIComponent(initials)}`;
  };

  const handleLoad = () => {
    setLoading(false);
    setHasError(false);
    setRetryCount(0);
  };

  const handleError = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      // Small delay before retry
      setTimeout(() => {
        setLoading(true);
      }, 500);
    } else {
      setLoading(false);
      setHasError(true);
    }
  };

  // Use fallback URL if original fails
  const imageSource = hasError && retryCount >= maxRetries 
    ? generateFallbackUrl(alt || "Startup")
    : src;
  
  return (
    <div className="relative w-full h-full bg-muted/20">
      {/* Loading state background with shimmer */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/60">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </div>
      )}
      
      {/* Main image */}
      <Image
        className={cn(
          "h-full w-full transition-all duration-700 ease-out",
          isLoading ? "opacity-0 scale-105 blur-sm" : "opacity-100 scale-100 blur-0",
          hasError && retryCount >= maxRetries ? "opacity-80" : "",
          className,
        )}
        onLoad={handleLoad}
        onError={handleError}
        src={imageSource as string}
        width={width || 500}
        height={height || 500}
        loading="eager" // Critical for above-the-fold content
        alt={alt || "Startup image"}
        priority={true} // High priority loading
        quality={90} // Better image quality
        sizes="(max-width: 768px) 280px, 320px" // Responsive sizing
        {...rest}
      />
      
      {/* Error state overlay */}
      {hasError && retryCount >= maxRetries && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/40 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-4xl font-bold text-muted-foreground/60 mb-2">
              {alt?.substring(0, 2)?.toUpperCase() || "ST"}
            </div>
            <div className="text-xs text-muted-foreground/80">
              Image unavailable
            </div>
          </div>
        </div>
      )}
      
      {/* Retry indicator */}
      {retryCount > 0 && retryCount < maxRetries && (
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Retrying...
        </div>
      )}
    </div>
  );
};
