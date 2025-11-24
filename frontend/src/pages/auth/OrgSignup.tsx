import { useState } from 'react';
import { signupOrganizationAdmin } from '../../api/services';
import { useNavigate } from 'react-router-dom';

export default function OrgSignup() {
  const [form, setForm] = useState({
    organizationName: '',
    organizationEmail: '',
    slug: '',
    adminEmail: '',
    adminPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await signupOrganizationAdmin({
        organizationName: form.organizationName,
        organizationEmail: form.organizationEmail,
        slug: form.slug,
        adminEmail: form.adminEmail,
        adminPassword: form.adminPassword,
      });
      // Store context for email confirmation/resend and redirect
      sessionStorage.setItem('pendingEmail', form.adminEmail);
      sessionStorage.setItem('pendingSlug', form.slug);
      navigate('/auth/email-confirmation', { state: { email: form.adminEmail, slug: form.slug } });
    } catch (e: any) {
      setError(e?.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="w-full max-w-xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Organization</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Sign up your organization and initial HR admin.</p>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">{error}</div>
        )}
        {success && (
          <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-3 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">{success}</div>
        )}

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Organization Name</label>
            <input name="organizationName" value={form.organizationName} onChange={onChange} required className="mt-1 w-full rounded-md border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Organization Email</label>
            <input type="email" name="organizationEmail" value={form.organizationEmail} onChange={onChange} required className="mt-1 w-full rounded-md border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Organization Slug</label>
            <input name="slug" value={form.slug} onChange={onChange} required placeholder="e.g. acme" className="mt-1 w-full rounded-md border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Used during login to identify your organization.</p>
          </div>
          <hr className="my-2 border-gray-200 dark:border-gray-700" />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Admin Email</label>
            <input type="email" name="adminEmail" value={form.adminEmail} onChange={onChange} required className="mt-1 w-full rounded-md border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Admin Password</label>
            <input type="password" name="adminPassword" value={form.adminPassword} onChange={onChange} required className="mt-1 w-full rounded-md border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Admin first/last name no longer required; derived from organization name */}
          </div>

          <button type="submit" disabled={loading} className="mt-4 w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600">
            {loading ? 'Creating...' : 'Create Organization'}
          </button>
        </form>
      </div>
    </div>
  );
}
