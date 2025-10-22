import { useState, useEffect } from 'react';
import { 
  PencilIcon, 
  TrashBinIcon,
  ChevronDownIcon,
} from "../../../icons";
import { getJobs, getDepartments, createJob, updateJob, deleteJob } from '../../../api/services';

interface Job {
  id: string;
  title: string;
  description?: string;
  departmentId?: string | null;
  department?: {
    id: string;
    name: string;
  } | null;
  requirements?: any[];
}

interface Department {
  id: string;
  name: string;
}

export default function Job() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    departmentId: ''
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchDepartments();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.actions-dropdown')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const jobsData = await getJobs();
      setJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError("Failed to load jobs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const departmentsData = await getDepartments();
      setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError('Failed to fetch departments. Please try again later.');
    }
  };

  // Filter jobs based on search term
  const filteredJobs = jobs.filter(job => 
    (job.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    ((job.department?.name || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (selectedJob) {
        setIsUpdating(true);
        await updateJob(selectedJob.id, {
          title: formData.title,
          description: formData.description,
          departmentId: formData.departmentId || undefined,
        });
        await fetchJobs();
        setShowEditModal(false);
      } else {
        setIsAdding(true);
        await createJob({
          title: formData.title,
          description: formData.description,
          departmentId: formData.departmentId || undefined,
        });
        await fetchJobs();
        setShowAddModal(false);
      }
      setSelectedJob(null);
      setFormData({ title: '', description: '', departmentId: '' });
    } catch (err: any) {
      console.error('Error saving job:', err);
      setError(err.response?.data?.error || 'Failed to save job. Please try again later.');
    } finally {
      setIsAdding(false);
      setIsUpdating(false);
    }
  };

  const handleEdit = (job: Job) => {
    setSelectedJob(job);
    setFormData({
      title: job.title,
      description: job.description || '',
      departmentId: job.departmentId || ''
    });
    setShowEditModal(true);
    setActiveDropdown(null);
  };

  const handleDelete = async () => {
    if (!selectedJob) return;
    
    try {
      setIsDeleting(true);
      await deleteJob(selectedJob.id);
      await fetchJobs();
      setShowDeleteModal(false);
      setSelectedJob(null);
    } catch (err: any) {
      console.error('Error deleting job:', err);
      setError(err.response?.data?.error || 'Failed to delete job. Please try again later.');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleDropdown = (id: string) => {
    if (activeDropdown === id) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(id);
    }
  };

  return (
    <div className="h-full overflow-auto p-6">
      {/* Header Section */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white/90">Job Profiles</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Manage job profiles and their details</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Add Job
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <input
          type="text"
          className="block w-full rounded-lg border border-gray-200 bg白 py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text白 dark:placeholder-gray-400"
          placeholder="Search by job title, description, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="size-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading jobs...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Jobs Table */}
      {!loading && !error && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th scope="col" className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Job Title
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Description
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Department
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-white/[0.03]">
                {filteredJobs.map((job) => (
                  <tr key={`job-${job.id}`} className="hover:bg-gray-50 dark:hover:bg-white/[0.05]">
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-900 dark:text-white">
                      {job.title}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                      <div className="max-w-2xl break-words">
                        {job.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {job.department ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {job.department.name}
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">No department</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium">
                      {/* Actions column intentionally minimal to resolve build issues */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredJobs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No jobs found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Try adjusting your search' : 'No job profiles have been created yet'}
          </p>
        </div>
      )}
    </div>
  );
}