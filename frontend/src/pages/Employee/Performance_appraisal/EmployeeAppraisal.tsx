import React, { useState, useEffect } from 'react';
import {
  listAppraisals,
  getAppraisalQuestions,
  createSelfAppraisal,
  updateAppraisalStatus,
  saveAppraisalResponse,
  getAppraisalResponses,
  type PerformanceAppraisal,
  type PerformanceAppraisalQuestion,
  type PerformanceAppraisalResponse
} from '../../../api/appraisals';
import {
  ClipboardDocumentCheckIcon,
  PlusCircleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useModal } from '../../../hooks/useModal';
import { Modal } from '../../../components/ui/modal';

const EmployeeAppraisal: React.FC = () => {
  const [appraisals, setAppraisals] = useState<PerformanceAppraisal[]>([]);
  const [questions, setQuestions] = useState<PerformanceAppraisalQuestion[]>([]);
  const [responses, setResponses] = useState<PerformanceAppraisalResponse[]>([]);
  const [currentAppraisal, setCurrentAppraisal] = useState<PerformanceAppraisal | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const questionsPerPage = 20; // Show all 20 questions at once
  const { isOpen, openModal, closeModal } = useModal();

  // Load appraisals
  const fetchAppraisals = async () => {
    try {
      setLoading(true);
      const data = await listAppraisals();
      setAppraisals(data.filter(a => a.type === 'SELF'));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching appraisals:', err);
      setError('Failed to load appraisals');
      setLoading(false);
    }
  };

  // Load questions
  const fetchQuestions = async () => {
    try {
      const data = await getAppraisalQuestions();
      setQuestions(data);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions');
    }
  };

  // Load responses for current appraisal
  const fetchResponses = async (appraisalId: string) => {
    try {
      const data = await getAppraisalResponses(appraisalId);
      setResponses(data);
    } catch (err) {
      console.error('Error fetching responses:', err);
      setError('Failed to load responses');
    }
  };

  // Create new appraisal
  const handleCreateAppraisal = async () => {
    try {
      setSubmitting(true);
      setError(null);
      const created = await createSelfAppraisal();
      setAppraisals([created, ...appraisals]);
      setCurrentAppraisal(created);
      setSuccess('New self-appraisal created');
      setSubmitting(false);
    } catch (err) {
      console.error('Error creating appraisal:', err);
      setError('Failed to create appraisal');
      setSubmitting(false);
    }
  };

  // Start appraisal
  const handleStartAppraisal = async (appraisal: PerformanceAppraisal) => {
    try {
      setSubmitting(true);
      setError(null);
      const updated = await updateAppraisalStatus(appraisal.id, 'IN_PROGRESS');
      setAppraisals(appraisals.map(a => a.id === updated.id ? updated : a));
      setCurrentAppraisal(updated);
      await fetchResponses(updated.id);
      setSuccess('Appraisal started');
      setSubmitting(false);
    } catch (err) {
      console.error('Error starting appraisal:', err);
      setError('Failed to start appraisal');
      setSubmitting(false);
    }
  };

  // Complete appraisal
  const handleCompleteAppraisal = async () => {
    if (!currentAppraisal) return;

    try {
      setSubmitting(true);
      setError(null);
      const updated = await updateAppraisalStatus(currentAppraisal.id, 'COMPLETED');
      setAppraisals(appraisals.map(a => a.id === updated.id ? updated : a));
      setCurrentAppraisal(updated);
      setSuccess('Appraisal completed successfully');
      setSubmitting(false);

      // Show success modal
      openModal();
    } catch (err) {
      console.error('Error completing appraisal:', err);
      setError('Failed to complete appraisal');
      setSubmitting(false);
    }
  };

  // Save response
  const handleSaveResponse = async (questionId: string, rating: number, comment: string) => {
    if (!currentAppraisal) return;
    
    try {
      setSubmitting(true);
      const saved = await saveAppraisalResponse(currentAppraisal.id, questionId, rating, comment);
      
      // Update responses state
      setResponses(prev => {
        const existing = prev.find(r => r.questionId === questionId);
        if (existing) {
          return prev.map(r => r.questionId === questionId ? saved : r);
        } else {
          return [...prev, saved];
        }
      });
      
      setSubmitting(false);
    } catch (err) {
      console.error('Error saving response:', err);
      setError('Failed to save response');
      setSubmitting(false);
    }
  };

  // Get response for a question
  const getResponse = (questionId: string) => {
    return responses.find(r => r.questionId === questionId);
  };

  // Calculate completion percentage
  const calculateCompletion = () => {
    if (!questions.length) return 0;
    const answeredQuestions = responses.filter(r => r.employeeRating !== null && r.employeeRating !== undefined);
    return Math.round((answeredQuestions.length / questions.length) * 100);
  };

  // Get all questions (show all 20 at once)
  const getAllQuestions = () => {
    return questions;
  };

  // Load data on component mount
  useEffect(() => {
    fetchAppraisals();
    fetchQuestions();
  }, []);

  // Set current appraisal to the most recent in-progress one
  useEffect(() => {
    if (appraisals.length > 0) {
      const inProgress = appraisals.find(a => a.status === 'IN_PROGRESS');
      if (inProgress) {
        setCurrentAppraisal(inProgress);
        fetchResponses(inProgress.id);
      } else {
        const pending = appraisals.find(a => a.status === 'PENDING');
        if (pending) {
          setCurrentAppraisal(pending);
        }
      }
    }
  }, [appraisals]);

  return (
    <>
      <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Performance Appraisal
        </h2>
        <button
          onClick={handleCreateAppraisal}
          disabled={submitting || appraisals.some(a => a.status === 'PENDING' || a.status === 'IN_PROGRESS')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <PlusCircleIcon className="w-5 h-5" />
          New Self-Appraisal
        </button>
      </div>

      {/* Error and success messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-center">
          <ExclamationCircleIcon className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-lg flex items-center">
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}

      {/* Loading indicator */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Appraisal List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Your Appraisals</h3>
            </div>
            <div className="p-4">
              {appraisals.length === 0 ? (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <ClipboardDocumentCheckIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No appraisals found. Create a new self-appraisal to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Completed</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {appraisals.map((appraisal) => (
                        <tr key={appraisal.id} className={currentAppraisal?.id === appraisal.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {appraisal.type === 'SELF' ? 'Self Appraisal' : 'Assessor Appraisal'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              appraisal.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              appraisal.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              appraisal.status === 'REVIEWED' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                              {appraisal.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {appraisal.completedAt ? new Date(appraisal.completedAt).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {appraisal.status === 'PENDING' && (
                              <button
                                onClick={() => handleStartAppraisal(appraisal)}
                                disabled={submitting}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                              >
                                Start
                              </button>
                            )}
                            {appraisal.status === 'IN_PROGRESS' && (
                              <button
                                onClick={() => setCurrentAppraisal(appraisal)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                              >
                                Continue
                              </button>
                            )}
                            {(appraisal.status === 'COMPLETED' || appraisal.status === 'REVIEWED') && (
                              <button
                                onClick={() => {
                                  setCurrentAppraisal(appraisal);
                                  fetchResponses(appraisal.id);
                                }}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                              >
                                View
                              </button>
                            )}
                          </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Current Appraisal Form */}
            {currentAppraisal && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {currentAppraisal && (currentAppraisal.status === 'COMPLETED' || currentAppraisal.status === 'REVIEWED')
                      ? 'View Appraisal'
                      : 'Complete Your Self-Appraisal'}
                  </h3>
                </div>

                <div className="p-4">
                  {questions.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                      <ArrowPathIcon className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-spin" />
                      <p>Loading questions...</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {getAllQuestions().map((question) => {
                        const response = getResponse(question.id);
                        const isReadOnly = currentAppraisal.status === 'COMPLETED' || currentAppraisal.status === 'REVIEWED';

                        return (
                          <div key={question.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm">
                            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                              {question.order}. {question.title}
                            </h4>

                            <div className="space-y-4 mb-6">
                              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                <h5 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">How to Measure:</h5>
                                <p className="text-sm text-blue-700 dark:text-blue-400">{question.howToMeasure}</p>
                              </div>

                              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                <h5 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">Good Indicator:</h5>
                                <p className="text-sm text-green-700 dark:text-green-400">{question.goodIndicator}</p>
                              </div>

                              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                                <h5 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">Red Flag:</h5>
                                <p className="text-sm text-red-700 dark:text-red-400">{question.redFlag}</p>
                              </div>

                              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <h5 className="text-sm font-medium text-gray-800 dark:text-gray-300 mb-2">Rating Criteria:</h5>
                                <p className="text-sm text-gray-700 dark:text-gray-400">{question.ratingCriteria}</p>
                              </div>
                            </div>

                            <div className="mb-6">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Your Rating (1-5)
                              </label>
                              <div className="flex space-x-3">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                  <button
                                    key={rating}
                                    type="button"
                                    disabled={isReadOnly || submitting}
                                    onClick={() => {
                                      if (!isReadOnly && !submitting) {
                                        handleSaveResponse(
                                          question.id,
                                          rating,
                                          '' // No comments needed
                                        );
                                      }
                                    }}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                                      response?.employeeRating === rating
                                        ? 'bg-blue-600 text-white shadow-lg transform scale-110'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md'
                                    } ${isReadOnly ? 'cursor-not-allowed opacity-70' : 'hover:scale-105'}`}
                                  >
                                    {rating}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Submit Button at the bottom */}
                      {currentAppraisal && (
                        <div className="mt-8 flex justify-center">
                          <button
                            onClick={handleCompleteAppraisal}
                            disabled={submitting || calculateCompletion() < 100}
                            className="flex items-center gap-3 px-8 py-4 text-lg font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
                          >
                            <CheckCircleIcon className="w-6 h-6" />
                            Submit Performance Appraisal
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Success Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-md">
        <div className="p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Performance Appraisal Submitted Successfully!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your performance appraisal has been submitted successfully. Your assessor and HR team will now be able to review your responses.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              You can view your completed appraisal in the appraisals list above.
            </p>
            <button
              onClick={closeModal}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Continue
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EmployeeAppraisal;