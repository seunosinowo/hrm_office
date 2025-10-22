import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeToggleButton } from "../../components/common/ThemeToggleButton";
import { signupOrganizationAdmin, signupIndividual } from "../../api/services";

type SignUpType = 'individual' | 'organization';

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signUpType, setSignUpType] = useState<"individual" | "organization">("individual");
  const [orgSlug, setOrgSlug] = useState("");
  const [orgName, setOrgName] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      if (signUpType === 'organization') {
        const normalizedSlug = orgSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-');
        if (!orgName.trim()) {
          setError("Organization name is required");
          setLoading(false);
          return;
        }
        if (!normalizedSlug) {
          setError("Organization slug is required");
          setLoading(false);
          return;
        }
        const adminEmail = email.trim();
        const adminPassword = password;
        const payload = {
          organizationName: orgName.trim(),
          organizationEmail: (orgEmail || adminEmail).trim(),
          slug: normalizedSlug,
          adminEmail,
          adminPassword,
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
        };

        await signupOrganizationAdmin(payload);

        // Persist context and navigate to confirmation page
        sessionStorage.setItem("pendingEmail", adminEmail);
        sessionStorage.setItem("pendingSlug", normalizedSlug);
        navigate("/auth/email-confirmation", {
          state: {
            email: adminEmail,
            slug: normalizedSlug,
            message: "Please check your email for the confirmation link. If you don't see it, check your spam folder.",
          },
        });
      } else {
        const normalizedSlug = orgSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-');
        if (!normalizedSlug) {
          setError("Organization slug is required");
          setLoading(false);
          return;
        }
        const payload = {
          email: email.trim(),
          password,
          slug: normalizedSlug,
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
        };

        await signupIndividual(payload);

        sessionStorage.setItem("pendingEmail", email.trim());
        sessionStorage.setItem("pendingSlug", normalizedSlug);
        navigate("/auth/email-confirmation", {
          state: {
            email: email.trim(),
            slug: normalizedSlug,
            message: "Please check your email for the confirmation link to activate your account.",
          },
        });
      }
    } catch (error: any) {
      const msg = (error?.message || '').toLowerCase();
      if (signUpType === 'organization' && msg.includes('already') && msg.includes('slug')) {
        setError("This organization slug already exists. Please try another slug.");
      } else if (signUpType === 'individual' && msg.includes('organization not found')) {
        setError("We couldn't find that organization slug. Please check the spelling or ask HR.");
      } else if (signUpType === 'individual' && msg.includes('already') && msg.includes('organization')) {
        setError("An account with this email already exists for this organization.");
      } else if (msg.includes('email')) {
        setError("There was an issue sending the verification email. Please try again or use a different email provider.");
      } else {
        setError(error.message || "Signup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      // Simulate Google OAuth - replace with your actual OAuth implementation
      console.log('Google sign up attempt');

      // Simulate OAuth redirect
      setTimeout(() => {
        setError("Google OAuth would redirect here - implement with your auth provider");
        setLoading(false);
      }, 1000);
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            ← Back to Dashboard
          </Link>
          <ThemeToggleButton />
        </div>

        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Or{" "}
            <Link
              to="/auth/login"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              sign in to your account
            </Link>
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between space-x-4">
              <button
                type="button"
                onClick={() => setSignUpType('individual')}
                className={`flex-1 p-4 border-2 rounded-lg text-center transition-all duration-200 ${
                  signUpType === 'individual'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                    : 'border-gray-300 dark:border-gray-700 hover:border-blue-500 hover:shadow-sm'
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                    signUpType === 'individual'
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Individual</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSignUpType('organization')}
                className={`flex-1 p-4 border-2 rounded-lg text-center transition-all duration-200 ${
                  signUpType === 'organization'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                    : 'border-gray-300 dark:border-gray-700 hover:border-blue-500 hover:shadow-sm'
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                    signUpType === 'organization'
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Organization</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sign up as organization</span>
                </div>
              </button>
            </div>

            {signUpType && (
              <div className="mt-6 text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Sign up as {signUpType.charAt(0).toUpperCase() + signUpType.slice(1)}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Please fill in your details below to create your account
                </p>
              </div>
            )}
          </div>

          {signUpType && (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {signUpType === 'organization' && (
                  <>
                    <div>
                      <label htmlFor="org-name" className="sr-only">Organization name</label>
                      <input
                        id="org-name"
                        name="org-name"
                        type="text"
                        className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 mb-4"
                        placeholder="Organization name"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="org-email" className="sr-only">Organization email</label>
                      <input
                        id="org-email"
                        name="org-email"
                        type="email"
                        className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 mb-4"
                        placeholder="Organization email (optional)"
                        value={orgEmail}
                        onChange={(e) => setOrgEmail(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="email-address" className="sr-only">Email address</label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 mb-4"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {signUpType === 'individual' && (
                  <div>
                    <label htmlFor="org-slug" className="sr-only">Organization slug</label>
                    <input
                      id="org-slug"
                      name="org-slug"
                      type="text"
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 mb-1"
                      placeholder="Organization slug (e.g., acme)"
                      value={orgSlug}
                      onChange={(e) => setOrgSlug(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Ask HR for your organization's slug.</p>
                  </div>
                )}

                {signUpType === 'organization' && (
                  <div>
                    <label htmlFor="org-slug" className="sr-only">Organization slug</label>
                    <input
                      id="org-slug"
                      name="org-slug"
                      type="text"
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 mb-1"
                      placeholder="Organization slug (lowercase, unique, e.g., acme)"
                      value={orgSlug}
                      onChange={(e) => setOrgSlug(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Lowercase only; will be unique for your org.</p>
                  </div>
                )}

                <div>
                  <label htmlFor="password" className="sr-only">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 mb-4"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 mb-4"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                {signUpType === 'organization' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="first-name" className="sr-only">First name (optional)</label>
                      <input
                        id="first-name"
                        name="first-name"
                        type="text"
                        className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800"
                        placeholder="First name (optional)"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="last-name" className="sr-only">Last name (optional)</label>
                      <input
                        id="last-name"
                        name="last-name"
                        type="text"
                        className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800"
                        placeholder="Last name (optional)"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </span>
                  ) : (
                    "Create account"
                  )}
                </button>

                <div className="mt-4 text-center">
                  <Link
                    to="/auth/forgot-password"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C34.7 31.8 29.9 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.7 6.3 29.1 4 24 4 13 4 4 13 4 24s9 20 20 20c10.4 0 19-8.4 19-19 0-1.2-.1-2.3-.4-3.5z"/>
                      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.1 17 18.7 14 24 14c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.7 6.3 29.1 4 24 4 16.1 4 9.5 8.1 6.3 14.7z"/>
                      <path fill="#4CAF50" d="M24 44c5.8 0 11.1-2.2 15.1-5.9l-6.9-5.6c-2.1 1.6-4.8 2.5-8.2 2.5-5.9 0-10.8-4.1-12.6-9.6l-6.7 5.1C8.7 38.9 15.8 44 24 44z"/>
                      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.4 3.3-4.2 5.8-7.5 7.1l6.9 5.6C37.9 38.4 42 31.1 42 24c0-1.2-.1-2.3-.4-3.5z"/>
                    </svg>
                    Sign up with Google
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}