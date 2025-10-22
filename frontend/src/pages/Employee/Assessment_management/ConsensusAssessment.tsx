import { useState } from 'react';
import { 
  ChartBarIcon,
  DocumentCheckIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

interface ConsensusAssessment {
  id: string;
  employee: {
    name: string;
    position: string;
    department: string;
    avatar: string;
  };
  panel: {
    name: string;
    role: string;
    avatar: string;
  }[];
  date: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Rejected';
  overall_rating: number;
  competencies: {
    name: string;
    ratings: {
      panelMember: string;
      rating: number;
      comments: string;
    }[];
    consensus_rating: number;
    consensus_comments: string;
  }[];
}

const mockAssessments: ConsensusAssessment[] = [
  {
    id: "1",
    employee: {
      name: "Sarah Johnson",
      position: "Senior Software Engineer",
      department: "Engineering",
      avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=0D8ABC&color=fff"
    },
    panel: [
      {
        name: "Michael Chen",
        role: "Engineering Manager",
        avatar: "https://ui-avatars.com/api/?name=Michael+Chen&background=0D8ABC&color=fff"
      },
      {
        name: "Lisa Rodriguez",
        role: "HR Director",
        avatar: "https://ui-avatars.com/api/?name=Lisa+Rodriguez&background=0D8ABC&color=fff"
      },
      {
        name: "David Wilson",
        role: "CTO",
        avatar: "https://ui-avatars.com/api/?name=David+Wilson&background=0D8ABC&color=fff"
      }
    ],
    date: "2024-03-15",
    status: "In Progress",
    overall_rating: 4.2,
    competencies: [
      {
        name: "Technical Expertise",
        ratings: [
          {
            panelMember: "Michael Chen",
            rating: 4.5,
            comments: "Strong technical skills, excellent problem-solving abilities"
          },
          {
            panelMember: "Lisa Rodriguez",
            rating: 4.0,
            comments: "Good technical foundation, communicates well"
          },
          {
            panelMember: "David Wilson",
            rating: 4.0,
            comments: "Solid technical knowledge, needs more leadership experience"
          }
        ],
        consensus_rating: 4.2,
        consensus_comments: "Strong technical capabilities with room for growth in leadership"
      },
      {
        name: "Team Collaboration",
        ratings: [
          {
            panelMember: "Michael Chen",
            rating: 4.0,
            comments: "Works well with team, good communicator"
          },
          {
            panelMember: "Lisa Rodriguez",
            rating: 4.5,
            comments: "Excellent team player, fosters collaboration"
          },
          {
            panelMember: "David Wilson",
            rating: 4.0,
            comments: "Good team contributor, could take more initiative"
          }
        ],
        consensus_rating: 4.2,
        consensus_comments: "Strong team player with potential for more leadership"
      }
    ]
  }
];

export default function ConsensusAssessment() {
  const [assessments] = useState<ConsensusAssessment[]>(mockAssessments);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState<ConsensusAssessment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showNewAssessmentModal, setShowNewAssessmentModal] = useState(false);

  const filteredAssessments = assessments.filter(assessment =>
    assessment.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'In Progress':
        return <ArrowPathIcon className="h-5 w-5 text-yellow-500" />;
      case 'Pending':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'Rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Consensus Assessments</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Multi-panel employee evaluations for comprehensive performance reviews
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
              placeholder="Search by employee name or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-h-[calc(100vh-16rem)] overflow-y-auto">
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
                      {assessment.employee.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {assessment.employee.position}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium">
                    {getStatusIcon(assessment.status)}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Overall Rating</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {assessment.overall_rating.toFixed(1)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div 
                      className="h-2 bg-blue-600 dark:bg-blue-500 rounded-full"
                      style={{ width: `${(assessment.overall_rating / 5) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Panel Members</h4>
                  <div className="flex -space-x-2">
                    {assessment.panel.map((member, index) => (
                      <img
                        key={index}
                        src={member.avatar}
                        alt={member.name}
                        className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-800"
                        title={`${member.name} (${member.role})`}
                      />
                    ))}
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
                      Assessment Details
                    </h2>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                      {selectedAssessment.employee.name} - {selectedAssessment.date}
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
                      Employee Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Name
                        </label>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {selectedAssessment.employee.name}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Position
                        </label>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {selectedAssessment.employee.position}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Department
                        </label>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {selectedAssessment.employee.department}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Panel Members
                    </h3>
                    <div className="space-y-4">
                      {selectedAssessment.panel.map((member, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="h-10 w-10 rounded-full"
                          />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {member.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {member.role}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Competency Ratings
                  </h3>
                  <div className="space-y-6">
                    {selectedAssessment.competencies.map((competency, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {competency.name}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Consensus Rating:
                            </span>
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                              {competency.consensus_rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                          {competency.consensus_comments}
                        </p>
                        <div className="space-y-3">
                          {competency.ratings.map((rating, idx) => (
                            <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {rating.panelMember}
                                </span>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Rating: {rating.rating}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {rating.comments}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
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
                  Export PDF
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
                      New Consensus Assessment
                    </h2>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                      Create a new multi-panel assessment
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
                        Employee Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        placeholder="Enter employee name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Position
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        placeholder="Enter position"
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
                        Assessment Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Panel Members
                    </label>
                    <div className="space-y-4">
                      {[1, 2, 3].map((index) => (
                        <div key={index} className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            placeholder={`Panel Member ${index} Name`}
                          />
                          <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            placeholder={`Panel Member ${index} Role`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Competencies
                    </label>
                    <div className="space-y-4">
                      {['Technical Skills', 'Communication', 'Leadership'].map((competency) => (
                        <div key={competency} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">{competency}</h4>
                          <div className="space-y-2">
                            {[1, 2, 3].map((panelIndex) => (
                              <div key={panelIndex} className="grid grid-cols-2 gap-4">
                                <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                                <option value="">Select rating</option>
                                <option value="1">Basic - Needs Improvement</option>
                                <option value="2">Intermidiate - Developing</option>
                                <option value="3">Advanced - Proficient</option>
                                <option value="4">Expert - Mastery Demonstrated</option>
                                </select>
                                <textarea
                                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                  placeholder={`Comments from Panel Member ${panelIndex}`}
                                  rows={2}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
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