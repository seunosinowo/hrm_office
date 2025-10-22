import { useState, useEffect } from 'react';
import { getJobs, getCompetencies, getProficiencyLevels, type Job as ServiceJob, type Competency as ServiceCompetency } from '../../../api/services';

interface JobCompetencyProfile {
  id: string;
  jobId: string;
  competencyId: string;
  requiredLevel: number;
  job: {
    id: string;
    title: string;
  };
  competency: {
    id: string;
    name: string;
  };
  proficiencyLevel?: {
    id: number;
    name: string;
  };
}

interface Job extends ServiceJob {
  requirements?: any[];
}

interface Competency extends ServiceCompetency {
}

interface ProficiencyLevel {
  levelNumber: number;
  label: string;
}

export default function JobCompetencyProfile() {
  const [profiles, setProfiles] = useState<JobCompetencyProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [jobsResp, competenciesResp, levelsResp] = await Promise.all([
        getJobs(),
        getCompetencies(),
        getProficiencyLevels(),
      ]);

      const jobsData = Array.isArray(jobsResp) ? jobsResp : [];
      const competenciesData = Array.isArray(competenciesResp) ? competenciesResp : [];
      const levelsData = Array.isArray(levelsResp) ? levelsResp : [];

      // Build profiles from jobs and their requirements
      const enhancedProfiles: JobCompetencyProfile[] = [];
      jobsData.forEach((job: Job) => {
        job.requirements?.forEach((req: any) => {
          const competency = competenciesData.find((c: Competency) => c.id === req.competencyId);
          const level = levelsData.find((l: ProficiencyLevel) => l.levelNumber === req.requiredLevel);
          
          enhancedProfiles.push({
            id: req.id,
            jobId: job.id,
            competencyId: req.competencyId,
            requiredLevel: req.requiredLevel,
            job: { id: job.id, title: job.title },
            competency: {
              id: competency?.id || req.competencyId,
              name: competency?.name || 'Unknown Competency'
            },
            proficiencyLevel: level ? { id: level.levelNumber, name: level.label } : undefined
          });
        });
      });

      setProfiles(enhancedProfiles);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Filter profiles based on search term
  const filteredProfiles = profiles.filter(profile =>
    profile.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.competency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (profile.proficiencyLevel?.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="h-full overflow-auto p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white/90">Job Competency Profiles</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">View job competency profiles and their required proficiency levels</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <input
          type="text"
          className="block w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white dark:placeholder-gray-400"
          placeholder="Search by job title, competency, or proficiency level..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="size-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading profiles...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Profiles Table */}
      {!loading && !error && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th scope="col" className="w-1/3 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Job Title
                  </th>
                  <th scope="col" className="w-1/3 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Competency
                  </th>
                  <th scope="col" className="w-1/3 px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Required Proficiency Level
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-white/[0.03]">
                {filteredProfiles.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'No profiles found matching your search.' : 'No profiles available.'}
                    </td>
                  </tr>
                ) : (
                  filteredProfiles.map((profile) => (
                    <tr key={`profile-${profile.id}`} className="hover:bg-gray-50 dark:hover:bg-white/[0.05]">
                      <td className="break-words px-4 py-4 text-sm text-gray-900 dark:text-white">
                        {profile.job.title}
                      </td>
                      <td className="break-words px-4 py-4 text-sm text-gray-900 dark:text-white">
                        {profile.competency.name}
                      </td>
                      <td className="break-words px-4 py-4 text-center text-sm text-gray-900 dark:text-white">
                        {profile.proficiencyLevel?.name || `Level ${profile.requiredLevel}`}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredProfiles.length === 0 && !searchTerm && (
        <div className="flex flex-col items-center justify-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No profiles found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No job competency profiles have been created yet
          </p>
        </div>
      )}
    </div>
  );
}