
// src/app/mentors/page.tsx
import MentorCard, { type Mentor } from '@/components/ui/mentor-card';
import MainNavbar from '@/components/ui/main-navbar'; // Corrected import
import Footer from '@/components/ui/footer';

const mentorsData: Mentor[] = [
  {
    id: '1',
    name: 'Prabodh Halde',
    designation: 'Head Regulatory Affairs, Marico',
    description: "Dr. Prabodh Halde, an esteemed professional, leads Marico's regulatory affairs division, leveraging over 30 years of expertise in food processing technology to spearhead innovation and excellence in the field.",
    areaOfMentorship: 'Technology',
    email: 'prabodh1972@gmail.com',
    avatarUrl: 'https://placehold.co/100x100/7DF9FF/121212.png?text=PH',
    backgroundImageUrl: 'https://placehold.co/400x600/121212/1E1E1E.png',
    dataAiHintAvatar: 'professional male food technologist',
    dataAiHintBackground: 'modern office technology'
  },
  {
    id: '2',
    name: 'Goutam Dutta',
    designation: 'Senior Advisory Solution Architect, IBM',
    description: "Mr. Goutam Dutta, an esteemed Senior Advisory Solution Architect at IBM, leverages an impressive 24 years of industry experience to provide cutting-edge solutions, embodying a legacy of excellence in technology innovation and strategic advisory.",
    areaOfMentorship: 'Product Development',
    email: 'duttagoutam@hotmail.com',
    avatarUrl: 'https://placehold.co/100x100/7DF9FF/121212.png?text=GD',
    backgroundImageUrl: 'https://placehold.co/400x600/1A1A1A/2D2D2D.png',
    dataAiHintAvatar: 'corporate male architect',
    dataAiHintBackground: 'abstract tech design'
  },
  {
    id: '3',
    name: 'Vaibhav Girmil',
    designation: 'Senior Manager, Punjab National Bank',
    description: "Mr. Vaibhav Girmil is an accomplished Senior Manager at PNB, with 12 years of expertise in treasury operations and foreign exchange management. He's adept at navigating complex financial landscapes with finesse and precision.",
    areaOfMentorship: 'Finance',
    email: 'vaibhav.girmil07@gmail.com',
    avatarUrl: 'https://placehold.co/100x100/7DF9FF/121212.png?text=VG',
    backgroundImageUrl: 'https://placehold.co/400x600/1E1E1E/3A3A3A.png',
    dataAiHintAvatar: 'bank manager finance expert',
    dataAiHintBackground: 'financial charts graphs'
  },
  {
    id: '4',
    name: 'Deepak Jha',
    designation: 'Product Manager, Lightbeam AI',
    description: "A seasoned Product Manager at LightBeam AI, boasting a decade of diverse experience in AI, Security, Privacy, Marketing, Healthcare, Social Media, and Fashion industries.",
    areaOfMentorship: 'Early Stage Ideation', // Standardized from "Consultancy Domain"
    email: 'djdx21@gmail.com',
    avatarUrl: 'https://placehold.co/100x100/7DF9FF/121212.png?text=DJ',
    backgroundImageUrl: 'https://placehold.co/400x600/121212/1E1E1E.png',
    dataAiHintAvatar: 'product manager AI tech',
    dataAiHintBackground: 'AI neural network'
  },
  {
    id: '5',
    name: 'Sarika Narayan',
    designation: 'Independent Business Consultant',
    description: "Ms. Sarika Narayan, an independent business consultant, leverages over two decades of experience in driving business planning and strategy, net margin realization, and product development and marketing. Specializing in empowering low-income artisan enterprises, she pioneers sustainable growth and market expansion strategies.",
    areaOfMentorship: 'Business Strategy',
    email: 'sarikanarayan@yahoo.com',
    avatarUrl: 'https://placehold.co/100x100/7DF9FF/121212.png?text=SN',
    backgroundImageUrl: 'https://placehold.co/400x600/1A1A1A/2D2D2D.png',
    dataAiHintAvatar: 'female business consultant',
    dataAiHintBackground: 'strategy planning whiteboard'
  },
];

export default function MentorsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-poppins">
      <MainNavbar />
      <main className="flex-grow py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="font-orbitron text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-primary">
              Meet Our Mentors
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl">
              Guiding visionaries to success with expert mentorship and industry insights.
            </p>
          </div>

          {mentorsData && mentorsData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10">
              {mentorsData.map((mentor) => (
                <MentorCard key={mentor.id} mentor={mentor} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-lg">
              No mentors to display at the moment. Please check back later.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
