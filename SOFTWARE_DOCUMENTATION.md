# RCOEM-TBI Website - Software Documentation

## 🚀 Project Overview

**Project Name:** RCOEM-TBI (Ramdeobaba College of Engineering & Management - Technology Business Incubator)  
**Version:** 0.1.0  
**Framework:** Next.js 15.2.3  
**Language:** TypeScript  
**Development Date:** June 2025  

RCOEM-TBI is a modern, full-stack web application designed for a Technology Business Incubator. The platform serves as a comprehensive ecosystem for startup incubation, featuring application management, mentor networking, startup showcasing, and administrative controls.

## 🏗️ Architecture & Technology Stack

### **Frontend Technologies**
- **Framework:** Next.js 15.2.3 with App Router
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS 3.4.1 with custom design system
- **Component Library:** Radix UI primitives with custom shadcn/ui components
- **Animations:** Framer Motion 11.18.2, GSAP 3.12.5
- **UI Enhancements:** Magic UI components (Aurora Text, Animated Beam, Interactive Buttons)
- **Icons:** Lucide React 0.475.0, Tabler Icons
- **Form Handling:** React Hook Form 7.54.2 with Zod validation
- **State Management:** React Context API with custom hooks

### **Backend & Database**
- **Backend:** Firebase Suite (v11.9.1)
  - **Authentication:** Firebase Auth with email/password
  - **Database:** Cloud Firestore (NoSQL)
  - **Storage:** Firebase Storage for file uploads
  - **Functions:** Firebase Cloud Functions (for automated workflows)
- **AI Integration:** Google AI Genkit 1.8.0 for application processing
- **Email Service:** Resend 3.4.0 for notification emails
- **File Processing:** Base64 encoding for document storage

### **Development Tools**
- **Build Tool:** Next.js with Turbopack for development
- **Linting:** ESLint with Next.js configuration
- **Package Manager:** npm
- **Development Server:** Custom port 9002
- **Environment:** Node.js with environment variables

## 🌟 Core Features & Functionality

### **1. Landing Page & Public Interface**
- **Hero Section:** Animated gradient background with GSAP text animations
- **Features Section:** Bento grid layout showcasing TBI services
- **About Section:** RCOEM-specific information with animated counters
- **Team Section:** Professional team member profiles
- **Startup Showcase:** Dynamic carousel of featured startups with modal details
- **Testimonials:** Modern testimonial carousel with company logos
- **Responsive Design:** Mobile-first approach with dark theme support

### **2. Application Management System**
- **Campus Status Selection:** Bifurcated application flow for campus/off-campus applicants
- **Comprehensive Form:** Multi-step application with file upload support
- **Form Fields:**
  - Personal information (name, email, phone, LinkedIn)
  - Company details (name, email, founder information)
  - Startup details (idea description, target audience, uniqueness)
  - Categorization (domain, sector, legal status dropdowns)
  - Document upload (pitch deck, business plan)
- **Real-time Validation:** Zod schema validation with error handling
- **File Handling:** Base64 encoding for secure document storage

### **3. User Management & Authentication**
- **Professional Interactive Login Interface:**
  - **Advanced gradient backgrounds** with glassmorphism design and backdrop blur
  - **Animated tab switching** with spring-based transitions and scale effects
  - **Interactive micro-animations** including icon rotation and button scaling
  - **Professional hover effects** with ripple animations and gradient overlays
  - **Responsive design** optimized for all device sizes with touch-friendly interactions
  - **Accessibility features** including keyboard navigation and focus states
- **Enhanced Tab System:**
  - **Custom tab components** with variant-based styling (user vs admin)
  - **Animated content transitions** with smooth fade and scale effects
  - **Visual feedback systems** including glow effects and color-coded gradients
  - **Professional iconography** with Users and Shield icons for clear role distinction
- **Multi-role Authentication:**
  - **Users:** Accepted applicants with dashboard access
  - **Admins:** Full system management capabilities
- **Firebase Auth Integration:** Secure authentication with session management
- **User Onboarding:** Progressive onboarding with password change and profile completion
- **Profile Management:** Editable user profiles with notification preferences
- **Enhanced UX Features:**
  - Real-time form validation with visual feedback
  - Loading states with animated spinners
  - Error handling with toast notifications
  - Gradient button effects with bottom highlighting
  - Professional sound and visual feedback for interactions

### **4. Admin Dashboard**
- **Application Processing:**
  - View all submissions with detailed information
  - Accept/reject applications with automated user creation
  - Real-time status updates and processing history
- **Startup Management:**
  - CRUD operations for featured startups
  - Bulk import functionality from predefined data
  - Logo upload with fallback handling
- **Analytics Dashboard:**
  - Application statistics and charts
  - KPI tracking (acceptance rates, revenue metrics)
  - Data visualization using Recharts
- **Settings Management:**
  - Admin credential updates
  - System configuration options

### **5. Startup Showcase System**
- **Featured Startups Display:** Marquee carousel with hover effects
- **Detailed Modal Views:** Comprehensive startup information
- **Logo Management:** Automatic fallback for missing images
- **Filtering & Search:** Dynamic search and categorization
- **Website Integration:** Direct links to startup websites

### **6. Mentor Network (Implementation Ready)**
- **Mentor Profiles:** Detailed mentor information and expertise
- **Request System:** User-initiated mentorship requests
- **Admin Approval:** Two-stage approval process (admin + mentor)
- **Email Notifications:** Automated notification system

### **7. Event Management**
- **Event Creation:** Admin-managed event system
- **Event Display:** Public event listing with registration
- **Status Management:** Pending, approved, rejected status workflow

## 🗄️ Database Schema

### **Firestore Collections**

#### **1. ContactSubmission Collection**
```typescript
interface ContactSubmission {
  id: string;
  // Personal Information
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  companyEmail: string;
  
  // Startup Details
  founderNames: string;
  founderBio: string;
  startupIdea: string;
  targetAudience: string;
  problemSolving: string;
  uniqueness: string;
  currentStage: string;
  
  // Categorization
  domain: string; // HealthTech, EdTech, FinTech, etc.
  sector: string; // Technology, Healthcare, Education, etc.
  legalStatus: string; // Registered, Not Registered, etc.
  
  // Additional Information
  natureOfInquiry: string;
  portfolioUrl?: string;
  teamInfo?: string;
  linkedinUrl: string;
  
  // Files & Documents
  attachmentBase64?: string;
  attachmentName?: string;
  
  // System Fields
  campusStatus: 'campus' | 'off-campus';
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: Timestamp;
  processedByAdminAt?: Timestamp;
  firebaseUid?: string; // Linked Firebase Auth UID for accepted users
}
```

#### **2. Users Collection**
```typescript
interface User {
  uid: string; // Firebase Auth UID
  email: string;
  name: string;
  status: 'active' | 'inactive';
  role: 'user' | 'admin';
  submissionId: string; // Reference to ContactSubmission
  
  // Profile Information
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  linkedin?: string;
  
  // Onboarding Status
  onboardingCompleted: boolean;
  onboardingProgress: {
    passwordChanged: boolean;
    profileCompleted: boolean;
    notificationsConfigured: boolean;
    completed: boolean;
    passwordChangedAt?: Timestamp;
    profileCompletedAt?: Timestamp;
    notificationsConfiguredAt?: Timestamp;
    completedAt?: Timestamp;
  };
  
  // Preferences
  notificationPreferences: {
    emailNotifications: boolean;
    updatedAt?: Timestamp;
  };
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### **3. Startups Collection**
```typescript
interface Startup {
  id: string;
  name: string;
  logoUrl: string;
  description: string;
  websiteUrl?: string;
  
  // Categorization
  funnelSource: string;
  session: string;
  monthYearOfIncubation: string;
  status: string;
  legalStatus: string;
  
  // Contact Information
  rknecEmailId: string;
  emailId: string;
  mobileNumber: string;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
```

#### **4. Admin Configuration**
```typescript
// admin_config/main_credentials
interface AdminCredentials {
  email: string;
  password: string; // Note: Plaintext for demo (should be hashed in production)
  updatedAt: Timestamp;
}
```

#### **5. Mentor Requests Collection**
```typescript
interface MentorRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  mentorId: string;
  mentorEmail: string;
  mentorName: string;
  status: 'pending' | 'admin_approved' | 'admin_rejected' | 'mentor_approved' | 'mentor_rejected';
  requestMessage?: string;
  adminNotes?: string;
  mentorNotes?: string;
  createdAt: Timestamp;
  adminProcessedAt?: Timestamp;
  adminProcessedBy?: string;
  mentorProcessedAt?: Timestamp;
  updatedAt: Timestamp;
}
```

## 🔐 Security & Configuration

### **Firestore Security Rules**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin credentials (read-only for login)
    match /admin_config/main_credentials {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Contact submissions (public create, restricted update)
    match /contactSubmissions/{submissionId} {
      allow read: if true;
      allow create: if true;
      allow update: if isValidOnboardingUpdate(resource, request) || isAdminUpdate(request);
    }
    
    // User documents (authenticated access only)
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Startups (public read, admin write)
    match /startups/{startupId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

### **Environment Variables**
```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key

# Google AI Genkit
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Email Token Cleanup Configuration
CLEANUP_SECRET=your-cleanup-secret-key
CRON_SECRET=your-cron-secret-key
CLEANUP_API_KEY=your-cleanup-api-key  # Backward compatibility
```

## 🎨 Design System & UI Components

### **Theme Configuration**
- **Color Scheme:** Dark-first design with purple/indigo accent colors
- **Typography:** 
  - Primary: Poppins (body text)
  - Secondary: Orbitron (headings)
  - Tertiary: Montserrat (display text)
- **Component System:** shadcn/ui with custom modifications
- **Animations:** Framer Motion with custom variants and GSAP integrations

### **Key UI Components**
- **Forms:** Multi-step forms with real-time validation
- **Modals:** Dynamic content modals with backdrop blur
- **Cards:** Gradient card designs with hover effects
- **Buttons:** Interactive buttons with loading states
- **Navigation:** Responsive navbar with mobile menu
- **Data Tables:** Sortable tables with search and filtering
- **File Upload:** Drag-and-drop with preview functionality

## 🔄 Data Flow & User Journey

### **Application Process Flow**
1. **Landing Page:** User discovers TBI and clicks "Apply"
2. **Campus Status:** User selects campus/off-campus status
3. **Application Form:** Comprehensive form submission with file upload
4. **Admin Review:** Admin reviews and processes application
5. **User Creation:** Automated Firebase Auth user creation for accepted applications
6. **Email Notification:** Automated email with login credentials
7. **User Onboarding:** Progressive onboarding with password change and profile setup
8. **Dashboard Access:** Full user dashboard with mentorship and event access

### **Admin Workflow**
1. **Dashboard Overview:** KPI metrics and recent activity
2. **Application Management:** Review, accept/reject applications
3. **User Management:** Monitor user onboarding and activity
4. **Startup Management:** Add, edit, delete featured startups
5. **System Settings:** Update admin credentials and configuration

## 🚦 API Endpoints & Server Actions

### **Next.js API Routes**
- `POST /api/contact-submissions/route-firebase.ts` - Application submission
- Server Actions for database operations:
  - `auth-actions.ts` - Authentication and credential verification
  - `user-actions.ts` - User profile and onboarding management
  - `startup-actions.ts` - Startup CRUD operations
  - `mentor-actions.ts` - Mentor request management

### **AI Integration (Genkit Flows)**
- `process-application-flow.ts` - Automated application processing
- `admin-settings-flow.ts` - Administrative task automation

## 📱 Responsive Design & Accessibility

### **Responsive Breakpoints**
- **Mobile:** 0-768px
- **Tablet:** 768-1024px
- **Desktop:** 1024px+

### **Accessibility Features**
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management for modals and forms

## 🔧 Development & Deployment

### **Development Commands**
```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Type checking
npm run typecheck

# Linting
npm run lint

# Configure Firebase Storage CORS
npm run configure-cors
```

### **Project Structure**
```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   ├── actions/           # Server actions
│   ├── admin/             # Admin dashboard
│   ├── user/              # User dashboard
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/                # Base UI components
│   ├── sections/          # Page sections
│   ├── auth/              # Authentication components
│   └── magicui/           # Enhanced UI components
├── lib/                   # Utility libraries
├── hooks/                 # Custom React hooks
├── contexts/              # React Context providers
├── types/                 # TypeScript type definitions
└── schemas/               # Zod validation schemas
```

## 🎯 Performance Optimizations

### **Frontend Optimizations**
- **Image Optimization:** Next.js Image component with lazy loading
- **Code Splitting:** Automatic route-based code splitting
- **Bundle Analysis:** Optimized bundle size with tree shaking
- **Caching:** Service worker caching for static assets
- **Preloading:** Strategic resource preloading for critical paths

### **Database Optimizations**
- **Indexing:** Firestore composite indexes for complex queries
- **Pagination:** Efficient data loading with cursor-based pagination
- **Real-time Updates:** Optimized Firestore listeners
- **Data Validation:** Client and server-side validation to reduce errors

## 🧪 Testing & Quality Assurance

### **Testing Strategy**
- **Type Safety:** Full TypeScript coverage
- **Form Validation:** Comprehensive Zod schema validation
- **Error Handling:** Graceful error handling and user feedback
- **Cross-browser Testing:** Compatibility across modern browsers
- **Mobile Testing:** Responsive design testing on various devices

## 📈 Analytics & Monitoring

### **Built-in Analytics**
- **Firebase Analytics:** User engagement and behavior tracking
- **Admin Dashboard:** Application statistics and KPI monitoring
- **Performance Monitoring:** Firebase Performance for app performance
- **Error Tracking:** Console error logging and Firebase Crashlytics integration

## 🔮 Future Enhancements

### **Planned Features**
- **Real-time Notifications:** Bell notification system for admins
- **Advanced Mentorship:** Video call integration and scheduling
- **Payment Integration:** Fee processing for advanced services
- **Mobile App:** React Native companion app
- **Advanced Analytics:** Detailed reporting and insights
- **Multi-language Support:** Internationalization (i18n)

### **Technical Improvements**
- **Enhanced Security:** Move from plaintext to hashed passwords
- **Performance:** Implement Redis caching for frequently accessed data
- **Scalability:** Microservices architecture for larger scale
- **Testing:** Comprehensive unit and integration testing suite

## 🎓 Usage Instructions

### **For Applicants**
1. Visit the website and click "Start Your Journey"
2. Select your campus status (campus/off-campus)
3. Fill out the comprehensive application form
4. Upload required documents (pitch deck, business plan)
5. Submit application and await admin review
6. If accepted, check email for login credentials
7. Complete onboarding process (password change, profile setup)
8. Access user dashboard for mentorship and event opportunities

### **For Administrators**
1. Navigate to `/admin/login`
2. Enter admin credentials
3. Access admin dashboard for application review
4. Process applications (accept/reject with automated user creation)
5. Manage featured startups for landing page display
6. Monitor system analytics and user activity
7. Update system settings and configuration

### **For Users (Accepted Applicants)**
1. Use provided credentials to log in at `/login`
2. Complete mandatory onboarding steps
3. Access user dashboard with personalized information
4. Request mentorship from available mentors
5. Register for upcoming events
6. Update profile and notification preferences

## 🤝 Contributing & Maintenance

### **Code Standards**
- **TypeScript:** Strict type checking enabled
- **ESLint:** Consistent code formatting and linting
- **Component Structure:** Modular, reusable component architecture
- **Documentation:** Comprehensive code comments and documentation
- **Git Workflow:** Feature branch workflow with pull request reviews

### **Maintenance Schedule**
- **Security Updates:** Monthly dependency updates
- **Performance Reviews:** Quarterly performance audits
- **User Feedback:** Regular user experience improvements
- **Feature Releases:** Bi-annual major feature releases

## 🌐 Deployment & Infrastructure

### **Direct HTTP Port Operation**
The RCOEM-TBI website is configured to run directly on HTTP ports without requiring a reverse proxy:

- **Development:** Runs on port 9002 (`npm run dev`)
- **Production:** Can run on any port (`npm run build && npm start`)
- **Environment:** Supports direct HTTP/HTTPS deployment

### **Deployment Options**

#### **Option 1: Platform Deployment (Recommended)**
- **Vercel:** Automatic HTTPS, global CDN, perfect for Next.js
- **Netlify:** JAMstack deployment with automatic builds
- **Railway:** Simple deployment with database hosting
- **DigitalOcean App Platform:** Automatic HTTPS and scaling

#### **Option 2: VPS with Reverse Proxy**
For custom server control, use Nginx reverse proxy for:
- Custom domain management
- SSL certificate management  
- Multiple application hosting
- Enhanced security and caching

#### **Option 3: Docker Deployment**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### **Security Considerations**
- **HTTPS Required:** All production deployments should use HTTPS
- **Environment Variables:** Secure storage of Firebase and API keys
- **Admin Credentials:** Currently stored as plaintext (demo only)
- **CORS Configuration:** Firebase Storage CORS properly configured

---

*This documentation provides a comprehensive overview of the RCOEM-TBI website system. For technical support or feature requests, please contact the development team.*
