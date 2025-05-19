"use client";

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import ContactForm from '@/components/ui/contact-form';
import { Mail, Phone, MapPin } from 'lucide-react';

const contactDetails = [
  { Icon: Mail, text: 'apply@innnexus.com', href: 'mailto:apply@innnexus.com' },
  { Icon: Phone, text: '+1 (555) 123-4567', href: 'tel:+15551234567' },
  { Icon: MapPin, text: '123 Innovation Drive, Tech City, CA 90210', href: '#' },
];

export default function ContactSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const animationClass = (baseClass: string, delay: string) => 
    `${baseClass} transition-all duration-700 ease-out ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`
    + ` style="transition-delay: ${delay}"`; // Inline style for delay

  return (
    <section id="contact" ref={sectionRef} className="py-16 md:py-24 bg-card text-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-12 md:mb-16 ${animationClass('', '0ms')}`}>
          <h2 className="font-orbitron text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-primary">
            Join InnoNexus
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl">
            Ready to turn your vision into reality? Apply for our incubation program or get in touch.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div className={`${animationClass('space-y-8', '200ms')}`}>
            <div>
              <h3 className="font-orbitron text-2xl font-semibold mb-6 text-foreground">Application Form</h3>
              <ContactForm />
            </div>
          </div>

          <div className={`${animationClass('space-y-8', '400ms')}`}>
            <div>
              <h3 className="font-orbitron text-2xl font-semibold mb-6 text-foreground">Contact Information</h3>
              <ul className="space-y-4">
                {contactDetails.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <item.Icon className="h-6 w-6 mr-3 mt-1 text-primary flex-shrink-0" />
                    <a 
                      href={item.href} 
                      className="text-muted-foreground hover:text-primary transition-colors"
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-orbitron text-2xl font-semibold mt-10 mb-6 text-foreground">Our Location</h3>
              <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg border border-border">
                <Image
                  src="https://placehold.co/600x400/121212/7DF9FF.png?text=InnoNexus+HQ"
                  alt="Map showing InnoNexus location"
                  width={600}
                  height={400}
                  className="w-full h-full object-cover"
                  data-ai-hint="map dark"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
