import { TimeIcon, UserCircleIcon, CheckCircleIcon, ErrorIcon } from "../../icons";

export default function RecentActivities() {
  const activities = [
    {
      id: 1,
      type: "assessment",
      title: "Annual performance review completed",
      user: "Sarah Johnson",
      time: "2 hours ago",
      status: "completed",
    },
    {
      id: 2,
      type: "onboarding",
      title: "New hire onboarding initiated",
      user: "Michael Chen",
      time: "5 hours ago",
      status: "in-progress",
    },
    {
      id: 3,
      type: "training",
      title: "Leadership training assigned",
      user: "Emma Rodriguez",
      time: "1 day ago",
      status: "pending",
    },
    {
      id: 4,
      type: "competency",
      title: "Competency assessment overdue",
      user: "David Wilson",
      time: "2 days ago",
      status: "overdue",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="size-5 text-green-500" />;
      case "in-progress":
        return <TimeIcon className="size-5 text-blue-500" />;
      case "pending":
        return <TimeIcon className="size-5 text-amber-500" />;
      case "overdue":
        return <ErrorIcon className="size-5 text-red-500" />;
      default:
        return <TimeIcon className="size-5 text-gray-500" />;
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Recent Activities
      </h3>
      <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
        Latest HR system activities
      </p>

      <div className="mt-6 space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className="flex items-center justify-center w-10 h-10 mt-1 bg-gray-100 rounded-full dark:bg-gray-800">
              <UserCircleIcon className="text-gray-600 size-5 dark:text-gray-300" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-800 dark:text-white/90">
                {activity.title}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.user}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.time}
                </span>
              </div>
            </div>
            <div className="mt-1">
              {getStatusIcon(activity.status)}
            </div>
          </div>
        ))}
      </div>

      <button className="flex items-center justify-center w-full gap-2 px-4 py-2 mt-6 text-sm font-medium text-blue-600 transition-all rounded-lg hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20">
        View All Activities
      </button>
    </div>
  );
}