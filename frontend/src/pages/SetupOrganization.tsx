import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SetupOrganization() {
  const [orgName, setOrgName] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!orgName) {
      setError('Organization name is required');
      setLoading(false);
      return;
    }
    
    if (!logoFile) {
      setError('Organization logo is required');
      setLoading(false);
      return;
    }

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create organization data (frontend only)
      const organizationData = {
        id: Date.now().toString(),
        name: orgName,
        logo_url: logoFile ? URL.createObjectURL(logoFile) : null,
        created_at: new Date().toISOString()
      };

      // Store organization data in localStorage for demo purposes
      localStorage.setItem('organization', JSON.stringify(organizationData));
      localStorage.setItem('userRole', 'hr');
      
      // Simulate successful setup
      console.log('Organization created:', organizationData);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to set up organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Set Up Your Organization</h2>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Organization Name</label>
        <input
          type="text"
          className="w-full border px-3 py-2 rounded"
          placeholder="Organization Name"
          value={orgName}
          onChange={e => setOrgName(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Logo <span className="text-red-500">*</span></label>
        <input
          type="file"
          accept="image/*"
          required
          onChange={e => setLogoFile(e.target.files?.[0] || null)}
        />
        {logoFile && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">Selected file: {logoFile.name}</p>
            <img 
              src={URL.createObjectURL(logoFile)} 
              alt="Logo preview" 
              className="mt-2 max-h-32 object-contain"
            />
          </div>
        )}
      </div>
      <button 
        type="submit" 
        className="w-full bg-blue-600 text-white py-2 rounded disabled:bg-blue-400 disabled:cursor-not-allowed" 
        disabled={loading}
      >
        {loading ? 'Setting up...' : 'Create Organization'}
      </button>
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </form>
  );
}