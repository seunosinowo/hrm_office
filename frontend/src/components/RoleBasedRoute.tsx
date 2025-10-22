import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type Role = 'employee' | 'assessor' | 'hr';

interface RoleContextType {
  role: Role | null;
  setRole: (role: Role | null) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role | null>(null);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

interface RoleBasedRouteProps {
  allowedRoles: Role[];
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ allowedRoles }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [cachedRoles, setCachedRoles] = useState<Role[]>([]);

  // On component mount, check for cached roles
  useEffect(() => {
    const checkCachedRoles = () => {
      try {
        const cachedUserData = localStorage.getItem('hrmoffice_user_data');
        if (cachedUserData) {
          const parsedData = JSON.parse(cachedUserData);
          if (parsedData && parsedData.roles && Array.isArray(parsedData.roles)) {
            console.log('RoleBasedRoute - Found cached roles:', parsedData.roles);
            setCachedRoles(parsedData.roles as Role[]);
          }
        }
      } catch (e) {
        console.error('RoleBasedRoute - Error parsing cached user data:', e);
      } finally {
        setIsLoading(false);
      }
    };

    checkCachedRoles();
  }, []);

  console.log('RoleBasedRoute - User:', user);
  console.log('RoleBasedRoute - Allowed roles:', allowedRoles);
  console.log('RoleBasedRoute - Cached roles:', cachedRoles);

  // If still loading, show nothing (or could add a loading spinner)
  if (isLoading) {
    return null;
  }

  if (!user) {
    console.log('RoleBasedRoute - No user, redirecting to login');
    return <Navigate to="/auth/login" />;
  }

  // Access roles directly from the user object, fallback to cached roles if available
  let userRoles = user.roles && user.roles.length > 0 ? user.roles as Role[] :
              cachedRoles.length > 0 ? cachedRoles : ['employee'];

  console.log('RoleBasedRoute - User roles:', userRoles);

  // Define role hierarchy - higher roles can access routes requiring lower roles
  const roleHierarchy: { [key in Role]: Role[] } = {
    'hr': ['hr', 'assessor', 'employee'], // HR can access HR, assessor, and employee routes
    'assessor': ['assessor', 'employee'],  // Assessors can access assessor and employee routes
    'employee': ['employee']               // Employees can only access employee routes
  };

  // Check if user has any role that grants access to the required roles
  const hasAllowedRole = userRoles.some(userRole => {
    // Get all roles this user role has access to
    const accessibleRoles = roleHierarchy[userRole as Role];
    console.log(`RoleBasedRoute - User role: ${userRole}, Accessible roles:`, accessibleRoles);

    // Check if any of the allowed roles are in the accessible roles
    const hasAccess = allowedRoles.some(allowedRole => accessibleRoles.includes(allowedRole));
    console.log(`RoleBasedRoute - Has access to ${allowedRoles.join(', ')}: ${hasAccess}`);

    return hasAccess;
  });

  if (!hasAllowedRole) {
    console.warn('Access denied: user roles =', userRoles, 'allowed roles =', allowedRoles);
    return <Navigate to="/unauthorized" />;
  }

  console.log('RoleBasedRoute - Access granted');
  return <Outlet />;
};