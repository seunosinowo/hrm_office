import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  roles: string[];
}

export default function HRUser() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data
  const mockUsers: User[] = [
    { id: '1', email: 'employee1@company.com', roles: ['employee'] },
    { id: '2', email: 'employee2@company.com', roles: ['employee'] },
    { id: '3', email: 'assessor1@company.com', roles: ['assessor'] },
    { id: '4', email: 'hr@company.com', roles: ['hr'] },
    { id: '5', email: 'employee3@company.com', roles: ['employee'] },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const upgradeToAssessor = async (userId: string) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, roles: ['assessor'] }
            : user
        )
      );
    } catch (error) {
      console.error('Error upgrading to assessor:', error);
    }
  };

  const upgradeToHR = async (userId: string) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, roles: ['hr'] }
            : user
        )
      );
    } catch (error) {
      console.error('Error upgrading to HR:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="size-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-500"></div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white/90">User Management</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-lg">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 border-b dark:border-gray-600 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 border-b dark:border-gray-600 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Current Roles</th>
              <th className="px-6 py-3 border-b dark:border-gray-600 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map(role => (
                      <span 
                        key={role}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          role === 'hr' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : role === 'assessor'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex flex-wrap gap-2">
                    {!user.roles.includes('assessor') && !user.roles.includes('hr') && (
                      <button
                        onClick={() => upgradeToAssessor(user.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors duration-200 text-sm"
                      >
                        Make Assessor
                      </button>
                    )}
                    {!user.roles.includes('hr') && (
                      <button
                        onClick={() => upgradeToHR(user.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors duration-200 text-sm"
                      >
                        Make HR
                      </button>
                    )}
                    {(user.roles.includes('hr') || user.roles.includes('assessor')) && (
                      <span className="text-gray-500 dark:text-gray-400 text-sm">No actions available</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}