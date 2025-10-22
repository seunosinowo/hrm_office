import React from 'react';
import PageMeta from '../../components/common/PageMeta';
import { 
  BookOpenIcon, 
  PlayCircleIcon, 
  DocumentTextIcon, 
  AcademicCapIcon,
  ChartBarIcon,
  // UserGroupIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

const ResourceCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}> = ({ icon, title, description, link }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center mb-4">
      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
        {icon}
      </div>
      <h3 className="text-xl font-semibold ml-4 text-gray-900 dark:text-white">{title}</h3>
    </div>
    <p className="text-gray-700 dark:text-gray-300 mb-4">{description}</p>
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium inline-flex items-center"
    >
      Learn More
      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </a>
  </div>
);

export default function ResourcesPage() {
  const resources = [
    {
      title: "HR Fundamentals Guide",
      desc: "Master core HR processes from hiring to offboarding",
      icon: <BookOpenIcon className="h-8 w-8 text-indigo-600" />,
      category: "Essentials",
      action: "Read Guide",
      link: "https://gavsispanel.gelisim.edu.tr/Document/hocal/20180827153114515_42cde2f6-988f-4fe9-ae06-1fc8ad0efd42.pdf"
    },
    // {
    //   title: "Employee Onboarding Kit",
    //   desc: "Templates and checklists for seamless onboarding",
    //   icon: <UserGroupIcon className="h-8 w-8 text-blue-600" />,
    //   category: "Templates",
    //   action: "Get Templates"
    // },
    {
      title: "Professional in Human Resources (PHR)",
      desc: "Video series on Human Resources",
      icon: <ShieldCheckIcon className="h-8 w-8 text-emerald-600" />,
      category: "Training",
      action: "Watch Videos",
      link: "https://www.linkedin.com/learning/topics/professional-in-human-resources-phr"
    },
    {
      title: "Leadership and Management",
      desc: "Curriculum for building management skills",
      icon: <AcademicCapIcon className="h-8 w-8 text-amber-600" />,
      category: "Courses",
      action: "Start Course",
      link: "https://www.linkedin.com/learning/topics/leadership-and-management"
    },
    {
      title: "HR Data Analytics Guidebook",
      desc: "Turn HR data into actionable insights",
      icon: <ChartBarIcon className="h-8 w-8 text-purple-600" />,
      category: "Analytics",
      action: "Download",
      link: "https://tq.filegood.club/1586445898"
    },
    
    {
      title: "Step-by-Step Recruitment Guide",
      desc: "Create custom HR policies in minutes",
      icon: <DocumentTextIcon className="h-8 w-8 text-red-600" />,
      category: "Training",
      action: "Watch Videos",
      link: "https://www.youtube.com/watch?v=Qk38hHZyX6E"
    },
    {
      title: "Performance Management System",
      desc: "Step-by-step system walkthroughs",
      icon: <PlayCircleIcon className="h-8 w-8 text-sky-600" />,
      category: "How-To",
      action: "View Tutorials",
      link: "https://www.youtube.com/watch?v=JmpVaBA2m30&pp=ygUVaHIgUGxhdGZvcm0gVHV0b3JpYWxz"
    },
  ];

  const categories = [...new Set(resources.map(r => r.category))];

  return (
    <>
      <PageMeta
        title="Resources - HRM Office"
        description="Access valuable resources for HR professionals, including guides, webinars, and best practices for employee competency assessment."
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-6">HR Resources</h1>
          <p className="text-xl max-w-3xl">
            Access our comprehensive collection of resources designed to help you optimize your workforce management and competency assessment processes.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="prose prose-lg max-w-none mb-16">
          <p className="text-gray-700 dark:text-gray-300">
            At HRM Office, we believe in empowering HR professionals with the knowledge and tools they need to succeed. Our curated collection of resources includes guides, webinars, templates, and best practices to help you implement effective competency assessment programs and drive organizational success.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium shadow-md hover:bg-blue-700 transition-colors">
            All Resources
          </button>
          {categories.map((category) => (
            <button 
              key={category} 
              className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg text-sm font-medium shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Resource Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {resources.map((resource) => (
            <ResourceCard
              key={resource.title}
              icon={resource.icon}
              title={resource.title}
              description={resource.desc}
              link={resource.link || "#"}
            />
          ))}
        </div>

        {/* Knowledge Base CTA */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Ready to Transform Your HR Processes?
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Get personalized guidance on implementing competency assessments and optimizing your workforce management strategy.
              </p>
            </div>
            <div className="md:w-1/3 flex justify-center md:justify-end">
              <a 
                href="/book-demo" 
                className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors text-center"
              >
                Schedule a Consultation
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}