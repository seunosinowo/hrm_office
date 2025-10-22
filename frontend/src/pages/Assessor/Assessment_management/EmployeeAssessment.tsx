import { useEffect, useState } from "react";
import {
  getAssessments,
  listUsers,
  getCompetencies,
  getDepartments,
  Assessment as BackendAssessment,
  AssessmentRating as BackendAssessmentRating,
  Competency as BackendCompetency,
  Department as BackendDepartment,
  UserSummary,
} from "../../../api/services";

interface AssessmentCompetency {
  id: string;
  rating: number;
  comments: string;
  competency: { id: string; name: string };
}

interface AssessmentUI {
  id: string;
  employeeName: string;
  assessorName: string;
  assessmentDate: string;
  status: "In Progress" | "Completed" | "Reviewed";
  overallRating: number;
  competencies: AssessmentCompetency[];
}

const mapBackendStatusToUI = (status: BackendAssessment["status"]): AssessmentUI["status"] => {
  switch (status) {
    case "COMPLETED":
      return "Completed";
    case "REVIEWED":
      return "Reviewed";
    case "PENDING":
    case "IN_PROGRESS":
    default:
      return "In Progress";
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric" };
  return date.toLocaleDateString("en-US", options);
};

export default function EmployeeAssessment() {
  const [assessments, setAssessments] = useState<AssessmentUI[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [deptRes, compRes, assRes, usersRes] = await Promise.all([
          getDepartments(),
          getCompetencies(),
          getAssessments(),
          listUsers(),
        ]);

        const deptList = (deptRes as BackendDepartment[]) || [];
        const compList = (compRes as BackendCompetency[]) || [];
        const backendAssessments = (assRes as BackendAssessment[]) || [];
        const usersList = (usersRes as UserSummary[]) || [];

        // Precompute lookup maps
        const userById = new Map<string, UserSummary>(usersList.map(u => [u.id, u]));
        const competencyById = new Map<string, BackendCompetency>(compList.map(c => [c.id, c]));

        const mapped: AssessmentUI[] = backendAssessments.map(a => {
          const employee = userById.get(a.employeeId);
          const assessor = a.assessorId ? userById.get(a.assessorId) : null;
          const ratings = (a.ratings || []) as BackendAssessmentRating[];
          const comps: AssessmentCompetency[] = ratings.map(r => {
            const comp = competencyById.get(r.competencyId);
            return {
              id: r.id,
              rating: r.rating,
              comments: r.comment || "",
              competency: { id: r.competencyId, name: comp?.name || `Competency ${r.competencyId}` },
            };
          });
          const overall = comps.length > 0 ? Number((comps.reduce((s, c) => s + (c.rating || 0), 0) / comps.length).toFixed(1)) : 0;
          const dateStr = new Date().toISOString();
          return {
            id: a.id,
            employeeName: employee ? `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim() || employee.email : "Unknown",
            assessorName: assessor ? `${assessor.firstName ?? ""} ${assessor.lastName ?? ""}`.trim() || assessor.email : "",
            assessmentDate: dateStr,
            status: mapBackendStatusToUI(a.status),
            overallRating: overall,
            competencies: comps,
          };
        });
        setAssessments(mapped);
      } catch (e: any) {
        console.error("Failed to load assessor assessments", e);
        setError(e?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = assessments.filter(a =>
    a.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.assessorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Assessment</h1>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <input
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search by employee, assessor, or status"
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-900 dark:text-white"
        />
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Employee</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Assessor</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Date</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Overall</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {filtered.map(a => (
              <tr key={a.id}>
                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{a.employeeName}</td>
                <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{a.assessorName || ""}</td>
                <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{formatDate(a.assessmentDate)}</td>
                <td className="px-3 py-2 text-sm">
                  <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {a.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{a.overallRating}</td>
              </tr>
            ))}
            {filtered.length === 0 && !loading && (
              <tr>
                <td className="px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400" colSpan={5}>
                  No assessments found.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td className="px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400" colSpan={5}>
                  Loading...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}