import { UserCircleIcon, BriefcaseIcon, ClipboardIcon, ChartBarIcon, LifebuoyIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

function PageDescription() {
  const steps = [
    {
      icon: <UserCircleIcon className="h-10 w-10 text-blue-600" />, 
      title: 'Create Your Profile',
      desc: 'Start by setting up your employee profile with your details and department. This helps personalize your experience.'
    },
    {
      icon: <BriefcaseIcon className="h-10 w-10 text-indigo-600" />, 
      title: 'Complete Job Assignment',
      desc: 'View and confirm your job role and assignments as set by HR. Ensure your information is up to date.'
    },
    {
      icon: <ClipboardIcon className="h-10 w-10 text-green-600" />, 
      title: 'Participate in Assessments',
      desc: 'Take competency and performance assessments assigned to you. Your responses help shape your growth plan.'
    },
    {
      icon: <ChartBarIcon className="h-10 w-10 text-purple-600" />, 
      title: 'View Analytics',
      desc: 'Track your progress and see personalized analytics on your skills, gaps, and achievements.'
    },
    {
      icon: <LifebuoyIcon className="h-10 w-10 text-orange-500" />, 
      title: 'Access Resources & Support',
      desc: 'Explore guides, FAQs, and get help whenever you need it from the Resources section.'
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-8 dark:from-gray-800/50 dark:to-gray-900/50 dark:border dark:border-gray-800">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\") " }}></div>

      {/* Hero Section */}
      <div className="relative z-10 mb-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white/90">
              Welcome to Your Assessor Portal
            </h1>
            <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Get the most out of your assessor experience. Follow these simple steps to navigate and use the platform effectively.
            </p>
          </div>
          <div className="hidden sm:block">
            <img src="https://www.svgrepo.com/show/354262/employee.svg" alt="" className="h-32 w-auto" />
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="relative z-10 mt-6">
        <div className="flex flex-col md:flex-row md:items-stretch md:justify-between gap-8 md:gap-4 relative">
          {steps.map((step, idx) => (
            <div key={step.title} className="flex-1 flex flex-col items-center text-center bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-md p-6 transition-transform hover:-translate-y-1 hover:shadow-xl relative">
              <div className="mb-4">{step.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{step.desc}</p>
              {/* Horizontal connecting arrow for desktop */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                  <ArrowRightIcon className="h-8 w-8 text-blue-300 dark:text-blue-700" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="relative z-10 mt-12 flex flex-col items-center">
        
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">You can always revisit this page for guidance.</p>
      </div>
    </div>
  );
}

export default PageDescription;