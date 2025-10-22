import { useState, useEffect } from 'react';
import {
  UserIcon,
  StarIcon,
  XCircleIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "../../../context/AuthContext";
import {
  getAssessments,
  listUsers,
  getCompetencies,
  getEmployeeJobAssignments,
  getDepartments,
  getJobs
} from "../../../api/services";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Types from backend
interface Assessment {
  id: string;
  type: 'SELF' | 'ASSESSOR' | 'CONSENSUS';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REVIEWED';
  employeeId: string;
  assessorId?: string | null;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  ratings?: AssessmentRating[];
}

interface AssessmentRating {
  id: string;
  competencyId: string;
  rating: number;
  comment?: string | null;
  assessmentId: string;
}

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

interface Competency {
  id: string;
  name: string;
  description?: string | null;
  category?: { id: string; name: string; domain?: { id: string; domainName: string } };
}

interface Department {
  id: string;
  name: string;
}

interface Job {
  id: string;
  title: string;
  description?: string;
  departmentId?: string | null;
  department?: { id: string; name: string } | null;
}

interface EmployeeJobAssignment {
  id: string;
  employeeId: string;
  jobId: string;
  startDate?: string;
  job?: Job;
}

// Frontend consensus assessment interface
interface ConsensusAssessment {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_email: string;
  employee_full_name: string;
  department_id: string;
  department_name: string;
  job_role_id: string;
  job_role_name: string;
  start_date: string;
  last_updated: string;
  status: string;
  progress: number;
  competency_ratings: {
    id: string;
    competency_id: string;
    rating: number; // Employee self-rating
    comments: string;
    assessor_comments?: string;
    assessor_rating?: number; // Assessor rating
    consensus_rating?: number; // Calculated average
  }[];
  assessor_id?: string;
  assessor_name?: string;
  assessor_rating?: number;
  assessor_comments?: string;
  assessor_status?: string;
  consensus_rating: number | null;
  consensus_comments: string;
  consensus_status: string;
  self_assessment_id?: string;
  assessor_assessment_id?: string;
}

// Helper functions
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
};

export default function ConsensusAssessment() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assessments, setAssessments] = useState<ConsensusAssessment[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState<ConsensusAssessment | null>(null);
  const [showConsensusModal, setShowConsensusModal] = useState(false);

  // Load data from backend
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch all necessary data
        const [
          assessmentsData,
          usersData,
          competenciesData,
          jobAssignmentsData,
          departmentsData,
          jobsData
        ] = await Promise.all([
          getAssessments(),
          listUsers(),
          getCompetencies(),
          getEmployeeJobAssignments(),
          getDepartments(),
          getJobs()
        ]);

        setCompetencies(competenciesData || []);

        // Build lookup maps
        const userById: Record<string, User> = {};
        (usersData || []).forEach(u => {
          userById[u.id] = u;
        });

        const jobAssignmentByEmployee: Record<string, EmployeeJobAssignment> = {};
        (jobAssignmentsData || []).forEach(ja => {
          jobAssignmentByEmployee[ja.employeeId] = ja;
        });

        const jobById: Record<string, Job> = {};
        (jobsData || []).forEach(job => {
          jobById[job.id] = job;
        });

        const departmentById: Record<string, Department> = {};
        (departmentsData || []).forEach(dept => {
          departmentById[dept.id] = dept;
        });

        const competencyById: Record<string, Competency> = {};
        (competenciesData || []).forEach(comp => {
          competencyById[comp.id] = comp;
        });

        // Process assessments to create consensus view
        const backendAssessments = assessmentsData || [];
        
        // Group assessments by employee
        const assessmentsByEmployee: Record<string, {
          self: Assessment | null;
          assessor: Assessment | null;
        }> = {};

        backendAssessments.forEach(assessment => {
          if (!assessmentsByEmployee[assessment.employeeId]) {
            assessmentsByEmployee[assessment.employeeId] = {
              self: null,
              assessor: null
            };
          }

          if (assessment.type === 'SELF') {
            assessmentsByEmployee[assessment.employeeId].self = assessment;
          } else if (assessment.type === 'ASSESSOR') {
            assessmentsByEmployee[assessment.employeeId].assessor = assessment;
          }
        });

        // Create consensus assessments for employees with both self and assessor assessments
        const consensusAssessments: ConsensusAssessment[] = [];

        Object.entries(assessmentsByEmployee).forEach(([employeeId, { self, assessor }]) => {
          // Only create consensus if both self and assessor assessments exist and are reviewed/completed
          if (self && assessor && 
              (self.status === 'COMPLETED' || self.status === 'REVIEWED') &&
              (assessor.status === 'COMPLETED' || assessor.status === 'REVIEWED')) {

            const employee = userById[employeeId];
            const jobAssignment = jobAssignmentByEmployee[employeeId];
            const job = jobAssignment ? jobById[jobAssignment.jobId] : null;
            const department = job && job.departmentId ? departmentById[job.departmentId] : null;
            const assessorUser = assessor.assessorId ? userById[assessor.assessorId] : null;

            // Combine ratings from self and assessor assessments
            const selfRatings = self.ratings || [];
            const assessorRatings = assessor.ratings || [];

            const combinedRatings: ConsensusAssessment['competency_ratings'] = [];

            // Process self ratings
            selfRatings.forEach(selfRating => {
              const assessorRating = assessorRatings.find(ar => ar.competencyId === selfRating.competencyId);
              const competency = competencyById[selfRating.competencyId];

              const consensusRating = assessorRating 
                ? (selfRating.rating + assessorRating.rating) / 2 
                : selfRating.rating;

              combinedRatings.push({
                id: selfRating.id,
                competency_id: selfRating.competencyId,
                rating: selfRating.rating,
                comments: selfRating.comment || '',
                assessor_rating: assessorRating?.rating,
                assessor_comments: assessorRating?.comment || '',
                consensus_rating: Number(consensusRating.toFixed(1))
              });
            });

            // Add any assessor ratings that don't have self ratings
            assessorRatings.forEach(assessorRating => {
              if (!selfRatings.find(sr => sr.competencyId === assessorRating.competencyId)) {
                const competency = competencyById[assessorRating.competencyId];
                combinedRatings.push({
                  id: assessorRating.id,
                  competency_id: assessorRating.competencyId,
                  rating: 0, // No self-rating
                  comments: '',
                  assessor_rating: assessorRating.rating,
                  assessor_comments: assessorRating.comment || '',
                  consensus_rating: assessorRating.rating // Use assessor rating as consensus
                });
              }
            });

            // Calculate overall ratings
            const employeeOverall = combinedRatings.length > 0
              ? combinedRatings.reduce((sum, r) => sum + r.rating, 0) / combinedRatings.length
              : 0;

            const assessorOverall = combinedRatings.length > 0
              ? combinedRatings.filter(r => r.assessor_rating).reduce((sum, r) => sum + (r.assessor_rating || 0), 0) / 
                combinedRatings.filter(r => r.assessor_rating).length
              : 0;

            const consensusOverall = combinedRatings.length > 0
              ? combinedRatings.reduce((sum, r) => sum + (r.consensus_rating || 0), 0) / combinedRatings.length
              : 0;

            // Build employee full name with proper null handling
            const employeeFirstName = employee?.firstName || '';
            const employeeLastName = employee?.lastName || '';
            const employeeFullName = `${employeeFirstName} ${employeeLastName}`.trim();
            const employeeDisplayName = employeeFullName || employee?.email || `Employee ${employeeId}`;

            // Build assessor full name with proper null handling
            const assessorFirstName = assessorUser?.firstName || '';
            const assessorLastName = assessorUser?.lastName || '';
            const assessorFullName = `${assessorFirstName} ${assessorLastName}`.trim();
            const assessorDisplayName = assessorFullName || assessorUser?.email || 'Unknown Assessor';

            consensusAssessments.push({
              id: `consensus-${employeeId}`,
              employee_id: employeeId,
              employee_name: employeeDisplayName,
              employee_email: employee?.email || '',
              employee_full_name: employeeDisplayName,
              department_id: department?.id || '',
              department_name: department?.name || 'No Department',
              job_role_id: job?.id || '',
              job_role_name: job?.title || 'No Job Role',
              start_date: self.createdAt,
              last_updated: assessor.completedAt || assessor.createdAt,
              status: 'consensus',
              progress: 100,
              competency_ratings: combinedRatings,
              assessor_id: assessor.assessorId || undefined,
              assessor_name: assessorDisplayName,
              assessor_rating: Number(assessorOverall.toFixed(1)),
              assessor_comments: '',
              assessor_status: 'completed',
              consensus_rating: Number(consensusOverall.toFixed(1)),
              consensus_comments: '',
              consensus_status: 'calculated',
              self_assessment_id: self.id,
              assessor_assessment_id: assessor.id
            });
          }
        });

        setAssessments(consensusAssessments);

      } catch (err) {
        console.error('Error loading consensus data:', err);
        setError('Failed to load consensus assessment data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Function to export assessment to PDF
  const exportToPDF = (assessment: ConsensusAssessment) => {
    const doc = new jsPDF();

    // Calculate overall employee rating
    const employeeOverallRating = assessment.competency_ratings.length > 0
      ? (assessment.competency_ratings.reduce((sum, r) => sum + r.rating, 0) /
         assessment.competency_ratings.length).toFixed(1)
      : 'N/A';

    // Calculate overall consensus rating
    const overallConsensusRating = assessment.consensus_rating?.toFixed(1) || 'N/A';

    // Add title
    doc.setFontSize(18);
    doc.text('Consensus Assessment Report', 14, 22);

    // Add employee info
    doc.setFontSize(12);
    doc.text(`Employee: ${assessment.employee_full_name || assessment.employee_name}`, 14, 35);
    doc.text(`Department: ${assessment.department_name || 'N/A'}`, 14, 42);
    doc.text(`Assessment Date: ${formatDate(assessment.last_updated)}`, 14, 49);

    // Add rating summary
    doc.setFontSize(14);
    doc.text('Rating Summary', 14, 63);
    doc.setFontSize(12);
    doc.text(`Employee Self-Rating: ${employeeOverallRating}`, 14, 73);
    doc.text(`Assessor Rating: ${assessment.assessor_rating?.toFixed(1) || 'Not rated'}`, 14, 80);

    // Add consensus rating with highlight
    doc.setTextColor(128, 0, 128); // Purple color for consensus
    doc.text(`Consensus Rating: ${overallConsensusRating}`, 14, 87);
    doc.setTextColor(0, 0, 0); // Reset to black

    // Add explanation
    doc.setFontSize(10);
    doc.text('Note: Consensus rating is calculated as the average of employee and assessor ratings', 14, 97);

    // Add competency ratings table
    const tableColumn = ["Competency", "Employee Rating", "Assessor Rating", "Consensus Rating"];
    const tableRows = assessment.competency_ratings?.map(rating => {
      const competencyName = competencies.find(c => c.id === rating.competency_id)?.name || `Competency ${rating.competency_id}`;

      return [
        competencyName,
        rating.rating.toString(),
        rating.assessor_rating?.toString() || 'Not rated',
        rating.consensus_rating?.toString() || 'N/A'
      ];
    }) || [];

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 105,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] }
    });

    // Add comments section if available
    let commentsY = 200;

    // Try to get the final Y position from the last table
    try {
      // @ts-ignore - lastAutoTable is added by the autoTable plugin
      commentsY = doc.lastAutoTable?.finalY || 200;
    } catch (e) {
      console.log("Could not get lastAutoTable position, using default");
    }

    commentsY += 15;

    if (assessment.competency_ratings.some(r => r.comments || r.assessor_comments)) {
      doc.setFontSize(14);
      doc.text('Comments', 14, commentsY);
      commentsY += 10;

      assessment.competency_ratings.forEach(rating => {
        const competencyName = competencies.find(c => c.id === rating.competency_id)?.name || `Competency ${rating.competency_id}`;

        if (rating.comments || rating.assessor_comments) {
          doc.setFontSize(12);
          doc.text(competencyName, 14, commentsY);
          commentsY += 7;

          if (rating.comments) {
            doc.setFontSize(10);
            doc.text(`Employee: ${rating.comments}`, 20, commentsY);
            commentsY += 7;
          }

          if (rating.assessor_comments) {
            doc.setFontSize(10);
            doc.text(`Assessor: ${rating.assessor_comments}`, 20, commentsY);
            commentsY += 7;
          }

          commentsY += 3; // Add some space between competencies
        }
      });
    }

    // Save the PDF
    const employeeName = assessment.employee_full_name || assessment.employee_name;
    doc.save(`${employeeName.replace(/\s+/g, '_')}_consensus_assessment.pdf`);
  };

  // Filter assessments by search term
  const filteredAssessments = assessments.filter(assessment =>
    (assessment.employee_full_name || assessment.employee_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.department_name?.toLowerCase().includes(searchTerm.toLowerCase() || '') ||
    assessment.job_role_name?.toLowerCase().includes(searchTerm.toLowerCase() || '')
  );

  // Handle opening the details modal
  const handleOpenConsensusModal = (assessment: ConsensusAssessment) => {
    setSelectedAssessment(assessment);
    setShowConsensusModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Consensus Assessments</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Review employee and assessor ratings to provide consensus evaluations
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by employee name, department, or job role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <UserIcon className="absolute left-3 top-1/2 h-5 w-5 text-gray-400 -translate-y-1/2" />
          </div>
        </div>

        {/* Assessments Table Section */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Consensus Assessments</h2>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredAssessments.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
                  <UserIcon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">No Consensus Assessments Available</h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-lg">
                  {searchTerm 
                    ? 'No assessments match your search criteria.' 
                    : 'There are no completed assessments with both self and assessor reviews available for consensus evaluation.'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  <tr>
                    <th className="py-3 px-4 text-left">Employee</th>
                    <th className="py-3 px-4 text-left">Department</th>
                    <th className="py-3 px-4 text-center">Employee Rating</th>
                    <th className="py-3 px-4 text-center">Assessor Rating</th>
                    <th className="py-3 px-4 text-center">Consensus</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAssessments.map(assessment => {
                    // Calculate average employee rating from self-assessment
                    const employeeRatings = assessment.competency_ratings.map(r => r.rating).filter(r => r > 0);
                    const avgEmployeeRating = employeeRatings.length > 0
                      ? (employeeRatings.reduce((sum, r) => sum + r, 0) / employeeRatings.length).toFixed(1)
                      : 'N/A';

                    // Get assessor rating
                    const assessorRating = assessment.assessor_rating
                      ? assessment.assessor_rating.toFixed(1)
                      : 'N/A';

                    // Get consensus rating
                    const consensusRating = assessment.consensus_rating
                      ? assessment.consensus_rating.toFixed(1)
                      : 'Not Set';

                    return (
                      <tr key={assessment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900 dark:text-white text-sm">
                            {assessment.employee_full_name || assessment.employee_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 break-words">
                            {assessment.employee_email}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-700 dark:text-gray-300 text-sm">
                          {assessment.department_name || 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center">
                            <span className="font-medium text-gray-900 dark:text-white mr-1 text-sm">
                              {avgEmployeeRating}
                            </span>
                            {avgEmployeeRating !== 'N/A' && <StarIcon className="h-4 w-4 text-yellow-400" />}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center">
                            <span className="font-medium text-gray-900 dark:text-white mr-1 text-sm">
                              {assessorRating}
                            </span>
                            {assessorRating !== 'N/A' && <StarIcon className="h-4 w-4 text-yellow-400" />}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center">
                            <span className={`font-medium text-sm ${
                              consensusRating === 'Not Set'
                                ? 'text-gray-400 dark:text-gray-500 italic'
                                : 'text-purple-700 dark:text-purple-300 mr-1'
                            }`}>
                              {consensusRating}
                            </span>
                            {consensusRating !== 'Not Set' && <StarIcon className="h-4 w-4 text-purple-500" />}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => handleOpenConsensusModal(assessment)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 whitespace-nowrap"
                          >
                            <DocumentTextIcon className="h-4 w-4 mr-1.5" />
                            View Consensus
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Assessment Details Modal */}
        {showConsensusModal && selectedAssessment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-lg max-h-[90vh] flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Consensus Assessment Details
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {selectedAssessment.employee_full_name || selectedAssessment.employee_name} - {selectedAssessment.department_name || 'No Department'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowConsensusModal(false)}
                    className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 overflow-y-auto flex-1">
                <div className="mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 border-l-4 border-blue-500">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <DocumentTextIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                          Consensus Calculation
                        </h3>
                        <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                          <p>
                            Consensus ratings are automatically calculated as the average of employee self-ratings and assessor ratings.
                            This provides an objective measure that balances both perspectives.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Overall Assessment Summary
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Employee Self-Rating
                      </h4>
                      <div className="flex items-center">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white mr-2">
                          {selectedAssessment.competency_ratings.length > 0
                            ? (selectedAssessment.competency_ratings.reduce((sum, r) => sum + r.rating, 0) /
                               selectedAssessment.competency_ratings.length).toFixed(1)
                            : 'N/A'}
                        </span>
                        <StarIcon className="h-6 w-6 text-yellow-400" />
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Assessor Rating
                      </h4>
                      <div className="flex items-center">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white mr-2">
                          {selectedAssessment.assessor_rating
                            ? selectedAssessment.assessor_rating.toFixed(1)
                            : 'N/A'}
                        </span>
                        <StarIcon className="h-6 w-6 text-yellow-400" />
                      </div>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                      <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                        Consensus Rating
                      </h4>
                      <div className="flex items-center">
                        <span className="text-2xl font-bold text-purple-700 dark:text-purple-300 mr-2">
                          {selectedAssessment.consensus_rating
                            ? selectedAssessment.consensus_rating.toFixed(1)
                            : 'N/A'}
                        </span>
                        <StarIcon className="h-6 w-6 text-purple-500" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Competency Details
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full bg-white dark:bg-gray-700 rounded-lg">
                      <thead className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                        <tr>
                          <th className="py-3 px-4 text-left">Competency</th>
                          <th className="py-3 px-4 text-center">Employee Rating</th>
                          <th className="py-3 px-4 text-center">Assessor Rating</th>
                          <th className="py-3 px-4 text-center">Consensus</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {selectedAssessment.competency_ratings.map((rating) => {
                          const competencyName = competencies.find(c => c.id === rating.competency_id)?.name || `Competency ${rating.competency_id}`;

                          return (
                            <tr key={rating.competency_id} className="hover:bg-gray-50 dark:hover:bg-gray-600/30">
                              <td className="py-3 px-4">
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {competencyName}
                                </div>
                                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                  {rating.comments && (
                                    <div className="mt-2">
                                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Employee Comments:</div>
                                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{rating.comments}</p>
                                    </div>
                                  )}
                                  {rating.assessor_comments && (
                                    <div className="mt-2">
                                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Assessor Comments:</div>
                                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{rating.assessor_comments}</p>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex items-center justify-center">
                                  <span className="font-medium text-gray-900 dark:text-white mr-1">
                                    {rating.rating}
                                  </span>
                                  <StarIcon className="h-4 w-4 text-yellow-400" />
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex items-center justify-center">
                                  <span className="font-medium text-gray-900 dark:text-white mr-1">
                                    {rating.assessor_rating || 'N/A'}
                                  </span>
                                  {rating.assessor_rating && rating.assessor_rating > 0 && <StarIcon className="h-4 w-4 text-yellow-400" />}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex items-center justify-center">
                                  <span className="font-medium text-purple-700 dark:text-purple-300 mr-1">
                                    {rating.consensus_rating?.toFixed(1) || 'N/A'}
                                  </span>
                                  <StarIcon className="h-4 w-4 text-purple-500" />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
                <button
                  onClick={() => setShowConsensusModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  Close
                </button>
                <button
                  onClick={() => exportToPDF(selectedAssessment)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md flex items-center"
                >
                  <DocumentTextIcon className="h-4 w-4 mr-1.5" />
                  Export to PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}