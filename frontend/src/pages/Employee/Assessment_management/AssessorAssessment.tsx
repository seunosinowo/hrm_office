import { useState } from 'react';
import { 
  UserIcon,
  ChartBarIcon,
  DocumentCheckIcon,
  StarIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  PlusIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

interface AssessorAssessment {
  id: string;
  assessor: {
    name: string;
    role: string;
    department: string;
    avatar: string;
  };
  metrics: {
    totalAssessments: number;
    averageRating: number;
    consistencyScore: number;
    feedbackScore: number;
  };
  status: 'Active' | 'In Review' | 'Suspended';
  lastReview: string;
  feedback: {
    positive: string[];
    areasForImprovement: string[];
  };
}

const mockAssessments: AssessorAssessment[] = [
  {
    id: "1",
    assessor: {
      name: "Michael Chen",
      role: "Engineering Manager",
      department: "Engineering",
      avatar: "https://ui-avatars.com/api/?name=Michael+Chen&background=0D8ABC&color=fff"
    },
    metrics: {
      totalAssessments: 24,
      averageRating: 4.5,
      consistencyScore: 92,
      feedbackScore: 4.8
    },
    status: "Active",
    lastReview: "2024-02-15",
    feedback: {
      positive: [
        "Consistent and fair evaluations",
        "Detailed feedback provided",
        "Strong technical assessment skills"
      ],
      areasForImprovement: [
        "Could provide more specific examples",
        "Consider more frequent check-ins"
      ]
    }
  },
  {
    id: "2",
    assessor: {
      name: "Lisa Rodriguez",
      role: "HR Director",
      department: "Human Resources",
      avatar: "https://ui-avatars.com/api/?name=Lisa+Rodriguez&background=0D8ABC&color=fff"
    },
    metrics: {
      totalAssessments: 18,
      averageRating: 4.2,
      consistencyScore: 88,
      feedbackScore: 4.5
    },
    status: "Active",
    lastReview: "2024-01-20",
    feedback: {
      positive: [
        "Excellent communication skills",
        "Strong focus on employee development",
        "Balanced approach to assessments"
      ],
      areasForImprovement: [
        "Could improve technical assessment depth",
        "Consider more structured feedback format"
      ]
    }
  }
];

export default function AssessorAssessment() {
  const [assessments] = useState<AssessorAssessment[]>(mockAssessments);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState<AssessorAssessment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showNewAssessmentModal, setShowNewAssessmentModal] = useState(false);

  const filteredAssessments = assessments.filter(assessment =>
    assessment.assessor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.assessor.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <ShieldCheckIcon className="h-5 w-5 text-green-500" />;
      case 'In Review':
        return <DocumentTextIcon className="h-5 w-5 text-yellow-500" />;
      case 'Suspended':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assessor Assesments Review</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Monitor and evaluate the effectiveness of assessment managers
            </p>
          </div>
          <button
            onClick={() => setShowNewAssessmentModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            New Assessment
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by assessor name or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <UserIcon className="absolute left-3 top-1/2 h-5 w-5 text-gray-400 -translate-y-1/2" />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
              <ChartBarIcon className="h-5 w-5" />
            </button>
            <button className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
              <DocumentCheckIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Assessment Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAssessments.map((assessment) => (
            <div 
              key={assessment.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {assessment.assessor.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {assessment.assessor.role}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium">
                    {getStatusIcon(assessment.status)}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Assessments</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {assessment.metrics.totalAssessments}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Average Rating</p>
                    <div className="flex items-center gap-1">
                      <StarIcon className="h-5 w-5 text-yellow-400" />
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {assessment.metrics.averageRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Consistency Score</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {assessment.metrics.consistencyScore}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Feedback Score</p>
                    <div className="flex items-center gap-1">
                      <StarIcon className="h-5 w-5 text-yellow-400" />
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {assessment.metrics.feedbackScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setSelectedAssessment(assessment);
                      setShowDetailsModal(true);
                    }}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    View Details
                  </button>
                  <button className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button className="p-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedAssessment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-lg max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Assessor Assesments Review
                    </h2>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                      {selectedAssessment.assessor.name} - Last Review: {selectedAssessment.lastReview}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Assessor Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Name
                        </label>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {selectedAssessment.assessor.name}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Role
                        </label>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {selectedAssessment.assessor.role}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Department
                        </label>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {selectedAssessment.assessor.department}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Performance Metrics
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Assessments</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {selectedAssessment.metrics.totalAssessments}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Average Rating</p>
                        <div className="flex items-center gap-1">
                          <StarIcon className="h-5 w-5 text-yellow-400" />
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {selectedAssessment.metrics.averageRating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Consistency Score</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {selectedAssessment.metrics.consistencyScore}%
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Feedback Score</p>
                        <div className="flex items-center gap-1">
                          <StarIcon className="h-5 w-5 text-yellow-400" />
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {selectedAssessment.metrics.feedbackScore.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Feedback Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
                      <h4 className="font-medium text-green-800 dark:text-green-300 mb-3">
                        Strengths
                      </h4>
                      <ul className="space-y-2">
                        {selectedAssessment.feedback.positive.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5" />
                            <span className="text-sm text-green-700 dark:text-green-300">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-3">
                        Areas for Improvement
                      </h4>
                      <ul className="space-y-2">
                        {selectedAssessment.feedback.areasForImprovement.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <ArrowPathIcon className="h-5 w-5 text-yellow-500 dark:text-yellow-400 mt-0.5" />
                            <span className="text-sm text-yellow-700 dark:text-yellow-300">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Close
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg">
                  Export Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Assessment Modal */}
        {showNewAssessmentModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm pt-24 pb-8">
            <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      New Assessor Assessment
                    </h2>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                      Create a new assessor performance evaluation
                    </p>
                  </div>
                  <button
                    onClick={() => setShowNewAssessmentModal(false)}
                    className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Assessor Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        placeholder="Enter assessor name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Role
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        placeholder="Enter role"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Department
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        placeholder="Enter department"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Review Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Performance Metrics
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Total Assessments
                        </label>
                        <input
                          type="number"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                          placeholder="Enter total assessments"
                        />
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Average Rating
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                          placeholder="Enter average rating"
                        />
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Consistency Score
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                          placeholder="Enter consistency score"
                        />
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Feedback Score
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                          placeholder="Enter feedback score"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Feedback
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
                        <h4 className="font-medium text-green-800 dark:text-green-300 mb-3">
                          Strengths
                        </h4>
                        <div className="space-y-2">
                          {[1, 2, 3].map((index) => (
                            <div key={index} className="flex items-start gap-2">
                              <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5" />
                              <input
                                type="text"
                                className="flex-1 px-3 py-1.5 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:border-green-800 dark:bg-green-900/50 dark:text-green-100"
                                placeholder={`Strength ${index}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-3">
                          Areas for Improvement
                        </h4>
                        <div className="space-y-2">
                          {[1, 2, 3].map((index) => (
                            <div key={index} className="flex items-start gap-2">
                              <ArrowPathIcon className="h-5 w-5 text-yellow-500 dark:text-yellow-400 mt-0.5" />
                              <input
                                type="text"
                                className="flex-1 px-3 py-1.5 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:border-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-100"
                                placeholder={`Area for improvement ${index}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => setShowNewAssessmentModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg">
                  Create Assessment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}