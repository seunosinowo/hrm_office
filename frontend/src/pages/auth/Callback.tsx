import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Callback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Processing authentication...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Handling OAuth callback');
        setMessage("Processing authentication...");

        // Simulate authentication processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For frontend demo, we'll simulate getting user info from localStorage or URL params
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get('email') || localStorage.getItem('demo_user_email');
        
        // Mock user session
        const mockSession = {
          user: {
            id: 'demo-user-id',
            email: email || 'demo@company.com'
          }
        };

        if (mockSession && mockSession.user) {
          console.log('Mock session found for user:', mockSession.user.email);
          
          // Store demo user info in localStorage
          localStorage.setItem('demo_user_email', mockSession.user.email);
          localStorage.setItem('demo_user_id', mockSession.user.id);

          setMessage("Fetching user roles...");

          // Simulate role fetching delay
          await new Promise(resolve => setTimeout(resolve, 1000));

          // For frontend demo, determine role based on email pattern or default
          let userRole = 'employee'; // default role
          
          if (mockSession.user.email) {
            const email = mockSession.user.email.toLowerCase();
            
            // Simple role assignment based on email patterns for demo
            if (email.includes('hr@') || email.includes('hr.') || email.includes('human.resources')) {
              userRole = 'hr';
            } else if (email.includes('assessor@') || email.includes('assessor.') || email.includes('reviewer')) {
              userRole = 'assessor';
            } else if (email.includes('admin@') || email.includes('admin.')) {
              userRole = 'hr'; // admin goes to HR page for demo
            }
            
            // Store role for future use
            localStorage.setItem('demo_user_role', userRole);
          }

          console.log("Determined user role:", userRole);

          // Redirect based on role
          if (userRole === 'hr') {
            console.log("Redirecting to HR page");
            navigate("/hr/page-description", { replace: true });
          } else if (userRole === 'assessor') {
            console.log("Redirecting to Assessor page");
            navigate("/assessor/page-description", { replace: true });
          } else {
            console.log("Redirecting to Employee page");
            navigate("/page-description", { replace: true });
          }
        } else {
          // If no mock session, redirect to login
          console.error('No session found after OAuth callback');
          navigate('/auth/login', { replace: true });
        }
      } catch (error) {
        console.error('Error handling OAuth callback:', error);
        navigate('/auth/login', { replace: true });
      }
    };

    handleCallback();

    return () => {};
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
}