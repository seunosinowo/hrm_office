import React, { useState, useEffect } from 'react';
import { UserIcon, XMarkIcon, ClockIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../context/AuthContext';
import { getUserProfile, updateUser, uploadImage, getDepartments, listEmployeeJobAssignments, updateEmployeeDepartments, type Department } from '../../../api/services';

interface Employee {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  profilePictureUrl?: string | null;
  departmentIds: string[];
  departments: Department[];
  isLockedUntil?: string | null;
  onboardingCompleted?: boolean;
}

const EmployeeDetails: React.FC = () => {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [timeUntilEditable, setTimeUntilEditable] = useState<string | null>(null);

  // Check if employee can edit their profile
  const checkEditPermission = (employeeData: Employee) => {
    // Before onboarding is completed, allow editing (they must fill the form)
    if (!employeeData.onboardingCompleted) {
      setCanEdit(true);
      setTimeUntilEditable(null);
      return true;
    }

    if (employeeData.isLockedUntil) {
      const lockTime = new Date(employeeData.isLockedUntil);
      const now = new Date();
      
      if (lockTime > now) {
        setCanEdit(false);
        const timeDiff = lockTime.getTime() - now.getTime();
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeUntilEditable(`${hours}h ${minutes}m`);
        return false;
      }
    }
    setCanEdit(true);
    setTimeUntilEditable(null);
    return true;
  };

  // Fetch employee profile
  const fetchEmployeeProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [profile, allDepartments, assignments] = await Promise.all([
        getUserProfile(user.id),
        getDepartments(),
        listEmployeeJobAssignments({ employeeId: user.id })
      ]);

      // Derive departments from job assignments
      const deptMap = new Map<string, { id: string; name: string }>();
      assignments.forEach(a => {
        const dept = a.job?.department as { id: string; name: string } | null | undefined;
        if (dept && !deptMap.has(dept.id)) {
          deptMap.set(dept.id, { id: dept.id, name: dept.name });
        }
      });
      const employeeDepartments = Array.from(deptMap.values());

      const employeeData: Employee = {
        id: profile.id,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        profilePictureUrl: profile.profilePictureUrl,
        departmentIds: employeeDepartments.map(d => d.id),
        departments: employeeDepartments,
        isLockedUntil: profile.isLockedUntil ?? null,
        onboardingCompleted: profile.onboardingCompleted ?? false,
      };

      setEmployee(employeeData);
      setDepartments(allDepartments);
      checkEditPermission(employeeData);
      // Auto-open modal only when onboarding incomplete AND departments exist
      if (!employeeData.onboardingCompleted && allDepartments.length > 0) {
        setShowViewModal(false);
        setShowEditModal(true);
      }
    } catch (error) {
      console.error('Error fetching employee profile:', error);
      setError('Failed to load employee profile');
    } finally {
      setLoading(false);
    }
  };

  // Update employee profile
  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee || !user) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
        // Only require department selection if departments exist AND user hasn't completed onboarding
        if (!employee.onboardingCompleted && departments.length > 0 && (!employee.departmentIds || employee.departmentIds.length === 0)) {
          setError('Please select at least one department to complete your profile setup');
          setIsSubmitting(false);
          return;
        }

        let profilePictureUrl: string | undefined = undefined;
        if (avatarFile) {
          const result = await uploadImage(avatarFile, 'avatars');
          profilePictureUrl = result.url;
        }

        await updateUser(employee.id, {
          firstName: employee.firstName,
          lastName: employee.lastName,
          phone: employee.phone || '',
          profilePictureUrl,
        });

        // Update departments - backend will handle onboarding completion automatically
        // When employee updates departments, backend sets onboardingCompleted=true or applies 12h lock
        await updateEmployeeDepartments(employee.id, { departmentIds: employee.departmentIds });

        await fetchEmployeeProfile();
        setShowEditModal(false);
        setAvatarFile(null);
      } catch (error) {
        console.error('Error updating employee:', error);
        setError('Failed to update employee');
      } finally {
        setIsSubmitting(false);
      }
  };

  useEffect(() => {
    if (user) {
      fetchEmployeeProfile();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="space-y-6 p-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-200">
                Employee profile not found. Please contact HR.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            My Employee Profile
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your employee profile information
          </p>
        </div>

        {!employee.onboardingCompleted && (
          <div className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg ${
            departments.length > 0
              ? 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300'
              : 'text-blue-700 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-200'
          }`}>
            <ClockIcon className="w-4 h-4" />
            {departments.length > 0
              ? 'Initial setup required — please complete your profile'
              : 'Awaiting HR to add departments — you can update personal info now'}
          </div>
        )}

        {employee.onboardingCompleted && !canEdit && (
          <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg dark:bg-gray-700 dark:text-gray-300">
            <ClockIcon className="w-4 h-4" />
            Profile locked for editing
          </div>
        )}

        {employee.onboardingCompleted && canEdit && (
          <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg dark:bg-green-900/20 dark:text-green-400">
            <ClockIcon className="w-4 h-4" />
            {timeUntilEditable ? (
              <span>
                Editable for <span className="font-bold">{timeUntilEditable}</span>
              </span>
            ) : (
              'Profile can be edited'
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Employee Profile View */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full">
            <div className="relative h-20 w-20">
              {employee.profilePictureUrl ? (
                <img
                  src={employee.profilePictureUrl}
                  alt={`${employee.firstName} ${employee.lastName}`}
                  className="h-full w-full rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 shadow-md"
                />
              ) : (
                <div className="h-full w-full rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 border-2 border-gray-200 dark:border-gray-700 shadow-md">
                  <UserIcon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {employee.firstName} {employee.lastName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {employee.email}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 break-all">
                      {employee.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {employee.phone || 'Not provided'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Departments</p>
                  <div className="flex flex-wrap gap-1 mt-1 max-w-[300px]">
                    {employee.departments.map((dept) => (
                      <span
                        key={`employee-dept-${dept.id}`}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 whitespace-normal break-words"
                      >
                        {dept.name}
                      </span>
                    ))}
                    {employee.departments.length === 0 && (
                      <span className="text-xs text-gray-500">No departments assigned</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-4 lg:mt-0 space-x-4">
            <button
              onClick={() => setShowViewModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
            >
              <EyeIcon className="w-4 h-4" />
              View Details
            </button>
            {canEdit && (
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
              >
                <PencilIcon className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* View Employee Modal */}
      {showViewModal && employee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 max-h-[90vh]">
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-2rem)]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Employee Details
                </h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="relative w-32 h-32">
                    {employee.profilePictureUrl ? (
                      <img
                        src={employee.profilePictureUrl}
                        alt={`${employee.firstName} ${employee.lastName}`}
                        className="w-full h-full rounded-full object-cover border-4 border-blue-100 dark:border-blue-900 filter drop-shadow-lg"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border-4 border-blue-100 dark:border-blue-900 filter drop-shadow-lg">
                        <UserIcon className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center mb-4">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                    {employee.firstName} {employee.lastName}
                  </h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {employee.email}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                    Personal Information
                  </h5>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                          Email
                        </label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white break-all">
                          {employee.email}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                          Phone Number
                        </label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                          {employee.phone || 'Not provided'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                        Edit Status
                      </label>
                      <p className="mt-1 text-sm">
                        {!employee.onboardingCompleted ? (
                          <span className="text-yellow-700 dark:text-yellow-300 font-semibold">Setup required — please complete profile</span>
                        ) : !canEdit ? (
                          <span className="text-red-600 dark:text-red-400 font-semibold">Editing locked</span>
                        ) : timeUntilEditable ? (
                          <span>
                            <span className="text-green-600 dark:text-green-400">Editable</span> -
                            <span className="text-orange-600 dark:text-orange-400 ml-1 font-semibold">
                              Locks in {timeUntilEditable}
                            </span>
                          </span>
                        ) : (
                          <span className="text-green-600 dark:text-green-400 font-semibold">Can be edited</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Departments
                  </label>
                  <div className="flex flex-wrap gap-2 max-w-[400px]">
                    {employee.departments && employee.departments.length > 0 ? (
                      employee.departments.map(dept => (
                        <span
                          key={`view-dept-${dept.id}`}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 whitespace-normal break-words"
                        >
                          {dept.name}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No departments assigned</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  {canEdit && (
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        setShowEditModal(true);
                      }}
                      className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && employee && canEdit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] border border-gray-200 dark:border-gray-700">
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-2rem)]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Edit Your Profile
                  </h3>
                  <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                    Update your personal information
                  </p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateEmployee} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={employee.firstName}
                      onChange={(e) => setEmployee({ ...employee, firstName: e.target.value })}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={employee.lastName}
                      onChange={(e) => setEmployee({ ...employee, lastName: e.target.value })}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={employee.email}
                    disabled
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={employee.phone || ''}
                    onChange={(e) => setEmployee({ ...employee, phone: e.target.value })}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Departments
                  </label>
                  {departments.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {departments.map((dep) => (
                        <label key={`dep-opt-${dep.id}`} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={employee.departmentIds.includes(dep.id)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setEmployee((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      departmentIds: checked
                                        ? Array.from(new Set([...(prev.departmentIds || []), dep.id]))
                                        : (prev.departmentIds || []).filter((id) => id !== dep.id),
                                    }
                                  : prev,
                              );
                            }}
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{dep.name}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400">No departments available. HR will add departments soon.</p>
                  )}
                  {departments.length > 0 ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Select at least one department</p>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">You can still save your profile now.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Profile Picture
                  </label>
                  <div className="mt-1 flex items-center">
                    <label className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600">
                      <div className="flex flex-col items-center space-y-2">
                        {avatarFile ? (
                          <div className="relative w-24 h-24">
                            <img
                              src={URL.createObjectURL(avatarFile)}
                              alt="Preview"
                              className="w-full h-full rounded-full object-cover border-2 border-green-100 dark:border-green-900 filter drop-shadow-md"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setAvatarFile(null);
                              }}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1.5"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ) : employee.profilePictureUrl ? (
                          <div className="relative w-24 h-24">
                            <img
                              src={employee.profilePictureUrl}
                              alt="Current"
                              className="w-full h-full rounded-full object-cover border-2 border-blue-100 dark:border-blue-900 filter drop-shadow-md"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            <span className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                              Upload New Picture
                            </span>
                          </div>
                        )}
                        <div className="text-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {avatarFile ? 'Change image' : 'Click to upload from your device'}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            JPG, JPEG, PNG (max. 2MB)
                          </p>
                        </div>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setAvatarFile(file);
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Updating...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeDetails;