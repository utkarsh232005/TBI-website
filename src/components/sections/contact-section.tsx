
"use client";

// This section is largely being replaced by the ApplicationFormDialog for the form part.
// The contact details and map could be moved to a dedicated "Contact Us" page if needed.
// For now, its direct usage on the main page is removed.
// The ContactForm component it used to render is now directly used by ApplicationFormDialog.

import Image from 'next/image';
// import ContactForm from '@/components/ui/contact-form'; // ContactForm is now used by ApplicationFormDialog
import { Mail, Phone, MapPin } from 'lucide-react';

const contactDetails = [
  { Icon: Mail, text: 'apply@innnexus.com', href: 'mailto:apply@innnexus.com' },
  { Icon: Phone, text: '+1 (555) 123-4567', href: 'tel:+15551234567' },
  { Icon: MapPin, text: '123 Innovation Drive, Tech City, CA 90210', href: '#' },
];

export default function ContactSection() {
  // const sectionRef = useRef<HTMLDivElement>(null); // No longer needed for animation triggers here
  // const [isInView, setIsInView] = useState(false); // No longer needed for animation triggers here

  // useEffect logic for IntersectionObserver removed as this section is no longer animated in the same way.

  // const animationClass = (baseClass: string, delay: string) => 
  //   `${baseClass} transition-all duration-700 ease-out ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`
  //   + ` style="transition-delay: ${delay}"`;

  // The form itself is now in a dialog. This component might be repurposed or removed.
  // If you want a static contact info section, you can keep and simplify this.
  // For now, returning a minimal placeholder or null if it's not meant to be displayed.
  return (
    <section id="contact-info" className="py-16 md:py-24 bg-card text-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-orbitron text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-primary">
            Contact Us
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl">
            Have questions? We'd love to hear from you.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h3 className="font-orbitron text-2xl font-semibold mb-6 text-foreground">Our Information</h3>
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
    </section>
  );
}

