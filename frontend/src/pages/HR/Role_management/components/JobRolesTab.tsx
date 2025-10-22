import { useState, useEffect, useRef } from 'react';
import {
  TrashBinIcon,
  PencilIcon,
  ChevronDownIcon,
} from "../../../../icons";
import * as XLSX from 'xlsx';
import { createJob, updateJob, deleteJob } from '../../../../api/services';

interface JobRole {
  id: string;
  name: string;
  description: string | null;
}

interface JobRoleFormData {
  name: string;
  description: string;
}

interface JobRolesTabProps {
  jobRoles: JobRole[];
  loadingJobRoles: boolean;
  fetchJobRoles: () => Promise<void>;
  setJobRoles: React.Dispatch<React.SetStateAction<JobRole[]>>;
}

export default function JobRolesTab({ jobRoles, loadingJobRoles, fetchJobRoles, setJobRoles }: JobRolesTabProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedJobRole, setSelectedJobRole] = useState<JobRole | null>(null);
  const [jobRoleFormData, setJobRoleFormData] = useState<JobRoleFormData>({ name: '', description: '' });
  const [jobRoleError, setJobRoleError] = useState<string | null>(null);
  const [showAddJobRoleModal, setShowAddJobRoleModal] = useState(false);
  const [showEditJobRoleModal, setShowEditJobRoleModal] = useState(false);
  const [showDeleteJobRoleModal, setShowDeleteJobRoleModal] = useState(false);
  const [isAddingJobRole, setIsAddingJobRole] = useState(false);
  const [isUpdatingJobRole, setIsUpdatingJobRole] = useState(false);
  const [isDeletingJobRole, setIsDeletingJobRole] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredJobRoles, setFilteredJobRoles] = useState<JobRole[]>([]);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Create refs for dropdown menus
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Filter job roles based on search query
  useEffect(() => {
    if (!jobRoles) {
      setFilteredJobRoles([]);
      return;
    }

    if (!searchQuery.trim()) {
      setFilteredJobRoles(jobRoles);
      return;
    }

    const filtered = jobRoles.filter(
      role =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (role.description && role.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    setFilteredJobRoles(filtered);
  }, [jobRoles, searchQuery]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (activeDropdown) {
        const dropdownRef = dropdownRefs.current[activeDropdown];
        if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
          setActiveDropdown(null);
        }
      }
    }

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  const toggleDropdown = (id: string) => {
    if (activeDropdown === id) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(id);
    }
  };

  // Add job role (persist to backend)
  const handleAddJobRole = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsAddingJobRole(true);
      setJobRoleError(null);

      if (!jobRoleFormData.name.trim()) {
        setJobRoleError('Job role name is required');
        setIsAddingJobRole(false);
        return;
      }

      // Check for duplicate names
      const existingRole = jobRoles.find(
        role => role.name.toLowerCase() === jobRoleFormData.name.trim().toLowerCase()
      );
      
      if (existingRole) {
        setJobRoleError('A job role with this name already exists');
        setIsAddingJobRole(false);
        return;
      }

      // Persist to backend
      const created = await createJob({ title: jobRoleFormData.name.trim(), description: jobRoleFormData.description.trim() || undefined });
      const newJobRole: JobRole = {
        id: created.id,
        name: created.title,
        description: created.description ?? null
      };

      // Update local state immediately
      setJobRoles(prevJobRoles => [...prevJobRoles, newJobRole]);
      setFilteredJobRoles(prevFiltered => [...prevFiltered, newJobRole]);

      // Clear form and close modal
      setShowAddJobRoleModal(false);
      setJobRoleFormData({ name: '', description: '' });
      
      // Refresh from backend
      if (fetchJobRoles) {
        fetchJobRoles().catch(err => {
          console.error('Error refreshing job roles in background:', err);
        });
      }
    } catch (error: any) {
      console.error('Error adding job role:', error);
      setJobRoleError(error.message || 'Failed to add job role. Please try again.');
    } finally {
      setIsAddingJobRole(false);
    }
  };

  // Update job role (persist to backend)
  const handleUpdateJobRole = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedJobRole) return;

    try {
      setIsUpdatingJobRole(true);
      setJobRoleError(null);

      if (!jobRoleFormData.name.trim()) {
        setJobRoleError('Job role name is required');
        setIsUpdatingJobRole(false);
        return;
      }

      // Check for duplicate names (excluding current role)
      const existingRole = jobRoles.find(
        role => 
          role.id !== selectedJobRole.id && 
          role.name.toLowerCase() === jobRoleFormData.name.trim().toLowerCase()
      );
      
      if (existingRole) {
        setJobRoleError('A job role with this name already exists');
        setIsUpdatingJobRole(false);
        return;
      }

      // Persist to backend
      const updated = await updateJob(selectedJobRole.id, { title: jobRoleFormData.name.trim(), description: jobRoleFormData.description.trim() || undefined });
      const updatedJobRole: JobRole = {
        id: updated.id,
        name: updated.title,
        description: updated.description ?? null
      };

      // Update local state immediately
      setJobRoles(prevJobRoles =>
        prevJobRoles.map(role =>
          role.id === selectedJobRole.id ? updatedJobRole : role
        )
      );

      setFilteredJobRoles(prevFiltered =>
        prevFiltered.map(role =>
          role.id === selectedJobRole.id ? updatedJobRole : role
        )
      );

      // Refresh from backend
      if (fetchJobRoles) {
        fetchJobRoles().catch(err => {
          console.error('Error refreshing job roles in background:', err);
        });
      }

      setShowEditJobRoleModal(false);
      setSelectedJobRole(null);
    } catch (error: any) {
      console.error('Error updating job role:', error);
      setJobRoleError(error.message || 'Failed to update job role. Please try again.');
    } finally {
      setIsUpdatingJobRole(false);
    }
  };

  // Delete job role (persist to backend)
  const handleDeleteJobRole = async () => {
    if (!selectedJobRole) return;

    try {
      setIsDeletingJobRole(true);

      // Persist deletion to backend
      await deleteJob(selectedJobRole.id);

      // Update local state immediately
      setJobRoles(prevJobRoles =>
        prevJobRoles.filter(role => role.id !== selectedJobRole.id)
      );

      setFilteredJobRoles(prevFiltered =>
        prevFiltered.filter(role => role.id !== selectedJobRole.id)
      );

      // Refresh from backend
      if (fetchJobRoles) {
        fetchJobRoles().catch(err => {
          console.error('Error refreshing job roles in background:', err);
        });
      }

      setShowDeleteJobRoleModal(false);
      setSelectedJobRole(null);
    } catch (error: any) {
      console.error('Error deleting job role:', error);
      setJobRoleError(error.message || 'Failed to delete job role. It may be in use by employees.');
    } finally {
      setIsDeletingJobRole(false);
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (!file) {
      setUploadError('Please select an Excel file to upload.');
      return;
    }

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadError('File size should not exceed 5MB');
      return;
    }

    // Reset messages and set loading state
    setUploadSuccessMessage(null);
    setUploadError(null);
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result;
      if (!result || !(result instanceof ArrayBuffer)) {
        setUploadError('Failed to read the file. Please try again.');
        setIsUploading(false);
        return;
      }

      try {
        const data = new Uint8Array(result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: (string | null)[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Validate Excel structure
        if (jsonData.length < 2) {
          setUploadError('The Excel file must contain at least a header row and one data row.');
          setIsUploading(false);
          return;
        }

        // Validate headers
        const headers = jsonData[0];
        if (!headers || headers.length < 1 || headers[0] !== 'Name') {
          setUploadError('Invalid Excel format. The first column must be named "Name".');
          setIsUploading(false);
          return;
        }

        // Process and validate data rows
        const jobRolesFromExcel = jsonData.slice(1).map((row, index) => {
          if (!row[0] || typeof row[0] !== 'string') {
            throw new Error(`Invalid job role name in row ${index + 2}`);
          }
          return {
            name: row[0].trim(),
            description: row[1] ? String(row[1]).trim() : ''
          } as JobRoleFormData;
        });

        // Validate job role names
        const invalidNames = jobRolesFromExcel.filter(role => !role.name || role.name.length > 100);
        if (invalidNames.length > 0) {
          setUploadError('Job role names must be between 1 and 100 characters.');
          setIsUploading(false);
          return;
        }

        // Check for duplicates in the file
        const names = jobRolesFromExcel.map(role => role.name.toLowerCase());
        const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
        if (duplicates.length > 0) {
          setUploadError(`Duplicate job role names found: ${duplicates.join(', ')}`);
          setIsUploading(false);
          return;
        }

        // Check for duplicates with existing job roles
        const existingNames = new Set(jobRoles.map(role => role.name.toLowerCase()));
        const conflictingRoles = jobRolesFromExcel.filter(role => existingNames.has(role.name.toLowerCase()));
        if (conflictingRoles.length > 0) {
          setUploadError(`Job roles already exist: ${conflictingRoles.map(role => role.name).join(', ')}`);
          setIsUploading(false);
          return;
        }

        // Create all job roles via backend
        const createdRoles: JobRole[] = [];
        for (const r of jobRolesFromExcel) {
          const created = await createJob({ title: r.name, description: r.description || undefined });
          createdRoles.push({ id: created.id, name: created.title, description: created.description ?? null });
        }

        // Update local state
        setJobRoles(prev => [...prev, ...createdRoles]);
        setFilteredJobRoles(prev => [...prev, ...createdRoles]);

        setUploadSuccessMessage(`${createdRoles.length} job roles uploaded successfully!`);
        
        // Refresh from backend
        if (fetchJobRoles) {
          fetchJobRoles();
        }
      } catch (error: any) {
        console.error('Error processing the Excel file:', error);
        setUploadError(error.message || 'An error occurred while processing the Excel file.');
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      setUploadError('Failed to read the file. Please try again.');
      setIsUploading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      {/* Display success or error message */}
      {uploadSuccessMessage && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-900 dark:bg-green-900/20 dark:text-green-400">
          <div className="flex items-center">
            <svg className="mr-2 size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            {uploadSuccessMessage}
          </div>
        </div>
      )}

      {uploadError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
          <div className="flex items-center">
            <svg className="mr-2 size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {uploadError}
          </div>
        </div>
      )}

      <div>
        {/* Search Bar and Buttons */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              placeholder="Search job roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white pl-3 pr-10 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="size-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={() => {
                setJobRoleFormData({ name: '', description: '' });
                setJobRoleError(null);
                setShowAddJobRoleModal(true);
              }}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Add Job Role
            </button>
            <label className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 cursor-pointer ml-2">
              {isUploading ? (
                <>
                  <div className="mr-2 size-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload Excel
                </>
              )}
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleExcelUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th scope="col" className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-white">
                    Name
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-white">
                    Description
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-white/[0.03]">
                {loadingJobRoles ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center">
                      <div className="flex justify-center">
                        <div className="size-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredJobRoles.length > 0 ? (
                  filteredJobRoles.map((role) => (
                    <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.05]">
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-900 dark:text-white">
                        {role.name}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                        {role.description || 'No description'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium">
                        <div className="relative actions-dropdown">
                          <button
                            onClick={() => toggleDropdown(`role-${role.id}`)}
                            className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.05]"
                          >
                            Actions
                            <ChevronDownIcon className="ml-1 size-4" />
                          </button>

                          {activeDropdown === `role-${role.id}` && (
                            <div
                              ref={(el) => { dropdownRefs.current[`role-${role.id}`] = el; }}
                              className="absolute right-0 z-50 mt-2 w-36 origin-top-right rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-800 dark:bg-gray-900"
                            >
                              <button
                                onClick={() => {
                                  setSelectedJobRole(role);
                                  setJobRoleFormData({
                                    name: role.name,
                                    description: role.description || ''
                                  });
                                  setShowEditJobRoleModal(true);
                                  setActiveDropdown(null);
                                }}
                                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                              >
                                <PencilIcon className="mr-2 size-4 text-amber-500" />
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedJobRole(role);
                                  setShowDeleteJobRoleModal(true);
                                  setActiveDropdown(null);
                                }}
                                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                              >
                                <TrashBinIcon className="mr-2 size-4 text-red-500" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      {searchQuery.trim()
                        ? `No job roles found matching "${searchQuery}".`
                        : 'No job roles found. Add a job role to get started.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Job Role Modal */}
      {showAddJobRoleModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 pt-24 pb-8">
          <div className="w-full max-w-md rounded-xl bg-white p-5 dark:bg-gray-900">
            <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white">Add Job Role</h2>
            <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
              Create a new job role
            </p>

            {jobRoleError && (
              <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/20">
                <p className="text-red-600 dark:text-red-400">{jobRoleError}</p>
              </div>
            )}

            <form onSubmit={handleAddJobRole} className="mt-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Job Role Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={jobRoleFormData.name}
                  onChange={(e) => setJobRoleFormData({...jobRoleFormData, name: e.target.value})}
                  required
                  className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  id="description"
                  value={jobRoleFormData.description}
                  onChange={(e) => setJobRoleFormData({...jobRoleFormData, description: e.target.value})}
                  rows={3}
                  className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddJobRoleModal(false)}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.05]"
                  disabled={isAddingJobRole}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  disabled={isAddingJobRole}
                >
                  {isAddingJobRole ? (
                    <>
                      <div className="mr-2 size-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Adding...
                    </>
                  ) : (
                    'Add Job Role'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Job Role Modal */}
      {showEditJobRoleModal && selectedJobRole && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 pt-24 pb-8">
          <div className="w-full max-w-md rounded-xl bg-white p-5 dark:bg-gray-900">
            <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white">Edit Job Role</h2>
            <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
              Update job role details
            </p>

            {jobRoleError && (
              <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/20">
                <p className="text-red-600 dark:text-red-400">{jobRoleError}</p>
              </div>
            )}

            <form onSubmit={handleUpdateJobRole} className="mt-6 space-y-4">
              <div>
                <label htmlFor="edit_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Job Role Name
                </label>
                <input
                  type="text"
                  id="edit_name"
                  value={jobRoleFormData.name}
                  onChange={(e) => setJobRoleFormData({...jobRoleFormData, name: e.target.value})}
                  required
                  className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="edit_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  id="edit_description"
                  value={jobRoleFormData.description}
                  onChange={(e) => setJobRoleFormData({...jobRoleFormData, description: e.target.value})}
                  rows={3}
                  className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditJobRoleModal(false)}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.05]"
                  disabled={isUpdatingJobRole}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  disabled={isUpdatingJobRole}
                >
                  {isUpdatingJobRole ? (
                    <>
                      <div className="mr-2 size-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Job Role'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Job Role Confirmation Modal */}
      {showDeleteJobRoleModal && selectedJobRole && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 pt-24 pb-8">
          <div className="w-full max-w-md rounded-xl bg-white p-5 dark:bg-gray-900">
            <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white">Delete Job Role</h2>
            <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to delete the job role "{selectedJobRole.name}"?
            </p>
            <p className="mt-2 text-center text-sm text-red-500">
              This action cannot be undone.
            </p>

            {jobRoleError && (
              <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/20">
                <p className="text-red-600 dark:text-red-400">{jobRoleError}</p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteJobRoleModal(false)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.05]"
                disabled={isDeletingJobRole}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteJobRole}
                className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                disabled={isDeletingJobRole}
              >
                {isDeletingJobRole ? (
                  <>
                    <div className="mr-2 size-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Job Role'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}