import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggleButton } from "../../components/common/ThemeToggleButton";
import { resendEmailVerification, verifyEmail } from "../../api/services";

export default function EmailConfirmation() {
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const location = useLocation();
  const [resendEmail, setResendEmail] = useState("");
  const [resendSlug, setResendSlug] = useState("");

  // Helper to read email/slug from navigation state, query, or session
  const getContext = () => {
    const state = (location.state as any) || {};
    const searchParams = new URLSearchParams(location.search);
    const qEmail = searchParams.get("email") || "";
    const qSlug = searchParams.get("slug") || "";
    const email = qEmail || state?.email || sessionStorage.getItem("pendingEmail") || "";
    const slug = qSlug || state?.slug || sessionStorage.getItem("pendingSlug") || "";
    return { email, slug };
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get("token");
    const qEmail = searchParams.get("email");
    const qSlug = searchParams.get("slug");

    // Persist query-provided context for resend convenience
    if (qEmail) sessionStorage.setItem("pendingEmail", qEmail);
    if (qSlug) sessionStorage.setItem("pendingSlug", qSlug);

    const { email, slug } = getContext();
    setResendEmail(email);
    setResendSlug(slug);

    if (token) {
      setVerifying(true);
      verifyEmail(token)
        .then(() => {
          setVerified(true);
          setEmailSent(false);
        })
        .catch((err: any) => {
          setError(err?.message || "Verification failed. The link may have expired.");
        })
        .finally(() => setVerifying(false));
      return;
    }

    // If no token, assume we're in the check-your-email state
    if (email && slug) {
      setEmailSent(true);
    }
  }, []);

  const handleResendEmail = async () => {
    setVerifying(true);
    setError(null);
    try {
      const { email: ctxEmail, slug: ctxSlug } = getContext();
      const email = (resendEmail || ctxEmail || "").trim();
      const slug = (resendSlug || ctxSlug || "").trim();
      if (!email || !slug) throw new Error("Missing email/organization context");
      await resendEmailVerification(email, slug);
      setEmailSent(true);
    } catch (err: any) {
      setError(err?.message || "Failed to resend verification email");
    } finally {
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="absolute top-4 right-4">
            <ThemeToggleButton />
          </div>
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
              Verifying your email...
            </h2>
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Please wait while we verify your email address.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="absolute top-4 right-4">
            <ThemeToggleButton />
          </div>
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
              Verification Failed
            </h2>
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
            <div className="mt-4 space-y-4">
              <Link
                to="/auth/login"
                className="inline-block text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Return to login
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                If you need a new verification link, use the button below.
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full rounded-md border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Organization slug (e.g., acme)"
                  className="w-full rounded-md border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  value={resendSlug}
                  onChange={(e) => setResendSlug(e.target.value)}
                />
              </div>
              <button
                onClick={handleResendEmail}
                className="w-full bg-indigo-600 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700"
              >
                Resend verification email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="absolute top-4 right-4">
            <ThemeToggleButton />
          </div>
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
              Email Verified!
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Your email has been successfully verified. You can now access your account.
            </p>
            <div className="mt-4 space-y-4">
              <Link
                to="/auth/login"
                className="inline-block w-full bg-indigo-600 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Continue to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="absolute top-4 right-4">
          <ThemeToggleButton />
        </div>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900">
            <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            We've sent you an email with a confirmation link. Please check your inbox and click the link to verify your email address.
          </p>
          <div className="mt-6 space-y-4">
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email address"
                className="w-full rounded-md border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
              />
              <input
                type="text"
                placeholder="Organization slug (e.g., acme)"
                className="w-full rounded-md border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                value={resendSlug}
                onChange={(e) => setResendSlug(e.target.value)}
              />
            </div>
            <button
              onClick={handleResendEmail}
              disabled={verifying}
              className="w-full bg-indigo-600 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifying ? "Sending..." : "Resend Verification Email"}
            </button>
            <Link
              to="/auth/login"
              className="inline-block text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm"
            >
              Return to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}