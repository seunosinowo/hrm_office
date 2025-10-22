# HRM Office - Human Resource Management System

A comprehensive HR management platform built with React, Node.js, offering seamless employee management, competency assessments, and powerful analytics for organizations.

🌟 Features
- User Management: Role-based access control (HR, Assessor, Employee)
- Organization Management: Multi-tenant architecture
- Competency Framework: Define domains, categories, and competencies
- Job Profiling: Job descriptions with competency requirements
- Assessment Management: Self-assessment, assessor evaluation, and consensus reviews
- Analytics: Individual and organizational gap analysis
- Email Notifications: Password reset, email verification
- File Uploads: Cloudinary integration for profile images
- Modern UI/UX: Built with Tailwind CSS and responsive design
- Secure Platform: JWT authentication and role-based security

🚀 Services Offered
- Employee Management: Comprehensive employee profiles and job assignments
- Assessment Tools: 360-degree feedback and competency evaluations
- HR Analytics: Gap analysis and organizational insights
- Role Management: User roles, departments, and job profiling
- Competency Framework: Structured competency domains and categories
- Business Solutions: Custom HR solutions for enterprises
- API Documentation: Comprehensive developer resources and integration guides

🛠️ Tech Stack
- Framework: React with TypeScript (Frontend), Node.js with Express (Backend)
- Database: PostgreSQL with Prisma ORM
- Styling: Tailwind CSS
- Authentication: JWT with role-based access
- File Storage: Cloudinary
- Email: SMTP integration
- Deployment: Ready for Vercel, Netlify, or cloud providers

📁 Project Structure
hrmoffice__new/
├── backend/                          # Node.js backend
│   ├── prisma/                       # Database schema and migrations
│   ├── src/                          # Source code
│   │   ├── config/                   # Configuration files
│   │   ├── middleware/               # Authentication middleware
│   │   ├── routes/                   # API routes
│   │   ├── utils/                    # Utility functions
│   │   ├── app.ts                    # Express app setup
│   │   └── index.ts                  # Server entry point
│   ├── package.json                  # Backend dependencies
│   └── tsconfig.json                 # TypeScript config
├── frontend/                         # React frontend
│   ├── public/                       # Static assets
│   ├── src/                          # Source code
│   │   ├── api/                      # API client
│   │   ├── components/               # Reusable components
│   │   ├── context/                  # React context
│   │   ├── layout/                   # Layout components
│   │   ├── pages/                    # Page components
│   │   ├── App.tsx                   # Main app component
│   │   └── main.tsx                  # Entry point
│   ├── package.json                  # Frontend dependencies
│   └── tsconfig.json                 # TypeScript config
└── .github/                          # CI/CD workflows

🚀 Getting Started
Install dependencies:

npm install
Run development server:

npm run dev
Open your browser to http://localhost:5173 (frontend) and http://localhost:4001 (backend)

📜 Available Scripts
- npm run dev - Start development server
- npm run build - Build for production
- npm run start - Start production server
- npm run lint - Run ESLint
- npx prisma migrate dev - Run database migrations (backend)
- npx prisma generate - Generate Prisma client (backend)

🎯 Key Pages
- Home: Overview of HRM Office features and dashboard
- HR Dashboard: User management, assessments, and analytics
- Employee Portal: Self-assessments and profile management
- Competency Framework: Define and manage competencies
- Job Profiling: Create job descriptions and requirements
- Analytics: Gap analysis and organizational insights
- Setup Organization: Initial organization configuration

HRM Office - Streamlining human resource management with modern technology and comprehensive tools for organizations.
