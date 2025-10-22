import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Competency {
  id: number;
  name: string;
  domain_id: number;
  domain?: {
    id: number;
    name: string;
  };
  definition: string;
}

interface Domain {
  id: number;
  name: string;
}

// Mock data
const mockDomains: Domain[] = [
  { id: 1, name: 'Technical Skills' },
  { id: 2, name: 'Communication' },
  { id: 3, name: 'Leadership' },
  { id: 4, name: 'Problem Solving' },
  { id: 5, name: 'Teamwork' }
];

const mockCompetencies: Competency[] = [
  {
    id: 1,
    name: 'JavaScript Programming',
    domain_id: 1,
    domain: { id: 1, name: 'Technical Skills' },
    definition: 'Ability to write and maintain JavaScript code'
  },
  {
    id: 2,
    name: 'Public Speaking',
    domain_id: 2,
    domain: { id: 2, name: 'Communication' },
    definition: 'Ability to effectively communicate ideas to large audiences'
  },
  {
    id: 3,
    name: 'Team Management',
    domain_id: 3,
    domain: { id: 3, name: 'Leadership' },
    definition: 'Ability to lead and manage team members effectively'
  },
  {
    id: 4,
    name: 'Critical Thinking',
    domain_id: 4,
    domain: { id: 4, name: 'Problem Solving' },
    definition: 'Ability to analyze problems and develop effective solutions'
  }
];

function Competency() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<Competency[]>([]);
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Competency | null>(null);
    const [formData, setFormData] = useState({ name: "", domain_id: "", definition: "" });
    const [domains, setDomains] = useState<Domain[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Add click outside handler
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.actions-dropdown') && !target.closest('button')) {
          setActiveDropdown(null);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    // Add useEffect for fetching data
    useEffect(() => {
        fetchData();
        fetchDomains();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Use mock data
            setData(mockCompetencies);
        } catch (error) {
            console.error('Error fetching competencies:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDomains = async () => {
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Use mock domains
            setDomains(mockDomains);
        } catch (error) {
            console.error('Error fetching domains:', error);
        }
    };

    const handleEdit = (item: Competency) => {
        setSelectedItem(item);
        setFormData({
            name: item.name,
            domain_id: item.domain?.name || item.domain_id.toString(),
            definition: item.definition
        });
        setShowAddModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let domainId = parseInt(formData.domain_id);
            
            // If domain_id is not a number (new domain name entered)
            if (isNaN(domainId)) {
                // Check if domain exists in mock data
                const existingDomain = domains.find(d => d.name === formData.domain_id);
                
                if (existingDomain) {
                    domainId = existingDomain.id;
                } else {
                    // Create new domain
                    const newDomainId = Math.max(...domains.map(d => d.id)) + 1;
                    const newDomain: Domain = {
                        id: newDomainId,
                        name: formData.domain_id
                    };
                    
                    // Add new domain to the list
                    setDomains(prev => [...prev, newDomain]);
                    domainId = newDomainId;
                }
            }

            if (selectedItem) {
                setIsUpdating(true);
                // Simulate API call delay
                await new Promise(resolve => setTimeout(resolve, 800));

                // Find the domain for display
                const domainData = domains.find(d => d.id === domainId);

                // Update the item in local state
                const updatedData = data.map(item => 
                    item.id === selectedItem.id 
                        ? {
                            ...item,
                            name: formData.name,
                            domain_id: domainId,
                            domain: domainData,
                            definition: formData.definition
                          }
                        : item
                );
                
                setData(updatedData);
                setShowAddModal(false);
                setFormData({ name: "", domain_id: "", definition: "" });
                setSelectedItem(null);
            } else {
                setIsAdding(true);
                // Simulate API call delay
                await new Promise(resolve => setTimeout(resolve, 800));

                // Create new competency
                const newId = Math.max(...data.map(item => item.id), 0) + 1;
                const domainData = domains.find(d => d.id === domainId);
                
                const newCompetency: Competency = {
                    id: newId,
                    name: formData.name,
                    domain_id: domainId,
                    domain: domainData,
                    definition: formData.definition
                };

                // Add new competency to the end of the array
                setData(prev => [...prev, newCompetency]);
                setShowAddModal(false);
                setFormData({ name: "", domain_id: "", definition: "" });
            }
        } catch (error) {
            console.error('Error saving competency:', error);
        } finally {
            setIsAdding(false);
            setIsUpdating(false);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleDelete = async () => {
        if (!selectedItem) return;
        try {
            setIsDeleting(true);
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // Remove competency from local state
            setData(prev => prev.filter(item => item.id !== selectedItem.id));
            setShowDeleteModal(false);
            setSelectedItem(null);
        } catch (error) {
            console.error('Error deleting competency:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
      <div className="h-full overflow-auto p-6">
        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Competency Layout</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">Manage organizational competencies</p>
          </div>
          <button 
            onClick={() => {
              setSelectedItem(null);
              setFormData({ name: "", domain_id: "", definition: "" });
              setShowAddModal(true);
            }}
            disabled={isAdding || isUpdating || isDeleting}
            className="flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <span>{isAdding ? "Adding..." : "Add Competency"}</span>
          </button>
        </div>

        <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Competency Name
                </th>
                <th className="px-8 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Domain
                </th>
                <th className="px-8 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Definition
                </th>
                <th className="px-8 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : data.map((item) => (
                <tr key={`competency-${item.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="whitespace-nowrap px-8 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {item.name}
                  </td>
                  <td className="whitespace-nowrap px-8 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {item.domain?.name || 'N/A'}
                  </td>
                  <td className="px-8 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {item.definition}
                  </td>
                  <td className="whitespace-nowrap px-8 py-4 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                        disabled={isAdding || isUpdating || isDeleting}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <span className="text-sm">Actions</span>
                        <ChevronDownIcon className="h-4 w-4" />
                      </button>
                      
                      {activeDropdown === item.id && (
                        <div className={`actions-dropdown absolute right-0 z-[9999] w-36 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800 ${
                          item.id === data[data.length - 1]?.id ? 'bottom-full mb-1' : 'top-full mt-1'
                        }`}>
                          <div className="py-1">
                            <button
                              onClick={() => {
                                handleEdit(item);
                                setActiveDropdown(null);
                              }}
                              disabled={isAdding || isUpdating || isDeleting}
                              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                              <PencilIcon className="mr-3 h-4 w-4 text-amber-500" />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setShowDeleteModal(true);
                                setActiveDropdown(null);
                              }}
                              disabled={isAdding || isUpdating || isDeleting}
                              className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 disabled:opacity-50 dark:text-red-400 dark:hover:bg-gray-700"
                            >
                              <TrashIcon className="mr-3 h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm dark:bg-gray-900/80" />
            <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
                {selectedItem ? "Edit Competency" : "Add New Competency"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Competency Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
                    placeholder="Enter competency name"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Domain
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="domain_id"
                      value={formData.domain_id}
                      onChange={handleFormChange}
                      list="domains-list"
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
                      placeholder="Enter or select domain"
                      required
                    />
                    <datalist id="domains-list">
                      {domains.map(domain => (
                        <option key={domain.id} value={domain.name} />
                      ))}
                    </datalist>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Definition
                  </label>
                  <textarea
                    name="definition"
                    value={formData.definition}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
                    placeholder="Enter competency definition"
                    rows={4}
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedItem(null);
                      setFormData({ name: "", domain_id: "", definition: "" });
                    }}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAdding || isUpdating || isDeleting}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  >
                    {selectedItem ? (isUpdating ? "Updating..." : "Update") : (isAdding ? "Adding..." : "Add")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm dark:bg-gray-900/80" />
            <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
                Delete Competency
              </h2>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                Are you sure you want to delete the competency "{selectedItem?.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedItem(null);
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isAdding || isUpdating || isDeleting}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
export default Competency;