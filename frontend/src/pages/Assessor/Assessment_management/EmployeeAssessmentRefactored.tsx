import { useEffect, useState } from "react";
import { UserIcon, FileIcon, ChatIcon } from "../../../icons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  getAssessments,
  listUsers,
  getCompetencies,
  getDepartments,
  createAssessorAssessment,
  addAssessmentRating,
  updateAssessmentStatus,
  Assessment as BackendAssessment,
  AssessmentRating as BackendAssessmentRating,
  Competency as BackendCompetency,
  Department as BackendDepartment,
  UserSummary,
} from "../../../api/services";

interface Employee {
  name: string;
  department: { id: string; name: string }[];
}

interface Competency { id: string; name: string }

interface AssessmentCompetency {
  id: string;
  rating: number;
  comments: string;
  competency: { id: string; name: string };
}

interface AssessmentUI {
  id: string;
  employee: Employee;
  assessor_name: string;
  assessment_date: string;
  status: "In Progress" | "Completed" | "Reviewed";
  overall_rating: number;
  isEdited: boolean;
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

const mapUIStatusToBackend = (status: AssessmentUI["status"]): BackendAssessment["status"] => {
  switch (status) {
    case "Completed":
      return "COMPLETED";
    case "Reviewed":
      return "REVIEWED";
    case "In Progress":
    default:
      return "IN_PROGRESS";
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric" };
  return date.toLocaleDateString("en-US", options);
};

export default function EmployeeAssessmentRefactored() {
  const [assessments, setAssessments] = useState<AssessmentUI[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentUI | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);

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
        setDepartments(deptList.map(d => ({ id: d.id, name: d.name })));
        setCompetencies(compList.map(c => ({ id: c.id, name: c.name })));
        setUsers(usersList);
        const mapped: AssessmentUI[] = backendAssessments.map(a => {
          const employee = usersList.find(u => u.id === a.employeeId);
          const assessor = a.assessorId ? usersList.find(u => u.id === a.assessorId) : null;
          const ratings = (a.ratings || []) as BackendAssessmentRating[];
          const comps: AssessmentCompetency[] = ratings.map(r => {
            const comp = compList.find(c => c.id === r.competencyId);
            return { id: r.id, rating: r.rating, comments: r.comment || "", competency: { id: r.competencyId, name: comp?.name || `Competency ${r.competencyId}` } };
          });
          const overall = comps.length > 0 ? Number((comps.reduce((s, c) => s + (c.rating || 0), 0) / comps.length).toFixed(1)) : 0;
          const dateStr = new Date().toISOString();
          return {
            id: a.id,
            employee: { name: employee ? `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim() || employee.email : "Unknown", department: [] },
            assessor_name: assessor ? `${assessor.firstName ?? ""} ${assessor.lastName ?? ""}`.trim() || assessor.email : "",
            assessment_date: dateStr,
            status: mapBackendStatusToUI(a.status),
            overall_rating: overall,
            isEdited: false,
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
    a.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.assessor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Assessment (Refactored)</h1>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by employee, assessor, or status" className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-900 dark:text-white" />
      </div>
      {error && (<div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{error}</div>)}
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
                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{a.employee.name}</td>
                <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{a.assessor_name || ""}</td>
                <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{formatDate(a.assessment_date)}</td>
                <td className="px-3 py-2 text-sm"><span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">{a.status}</span></td>
                <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{a.overall_rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
