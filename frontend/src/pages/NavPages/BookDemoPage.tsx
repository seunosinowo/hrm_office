import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeftIcon, CalenderIcon } from "../../icons";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/input/Select";

export default function BookDemoPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    date: "",
    time: "",
    timePeriod: "AM",
    attendees: "1-5",
    message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.company || !formData.role || !formData.date || !formData.time) {
        throw new Error('Please fill in all required fields');
      }

      // Prepare data for w3forms
      const w3formData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        w3formData.append(key, value);
      });

      // Use your w3forms public access key
      const w3formsUrl = 'https://w3forms.com/api/forms/public/submit/53162de4-b933-422e-85d8-284be6830a0f';

      // Add a title/subject for the email
      w3formData.append('title', 'New Demo Booking Request');

      const response = await fetch(w3formsUrl, {
        method: 'POST',
        body: w3formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit demo request. Please try again.');
      }

      setSuccess(true);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit demo request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col lg:flex-row h-full mt-16">
        {/* Left side - Why Book a Demo */}
        <div className="w-full lg:w-1/2 bg-white dark:bg-gray-800 p-8 lg:p-12">
          <div className="max-w-md mx-auto">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-300 dark:hover:text-white mb-6"
            >
              <ChevronLeftIcon className="size-5" />
              Back to homepage
            </Link>
            
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Why Book a Demo?</h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Personalized Walkthrough</h3>
                  <p className="mt-1 text-gray-500 dark:text-gray-400">
                    Get a tailored demonstration of our platform's features that match your specific needs.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Expert Guidance</h3>
                  <p className="mt-1 text-gray-500 dark:text-gray-400">
                    Learn from our product experts who can answer all your questions in real-time.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">See It in Action</h3>
                  <p className="mt-1 text-gray-500 dark:text-gray-400">
                    Experience firsthand how our solution can streamline your workflow and boost productivity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full lg:w-1/2 bg-gray-50 dark:bg-gray-900 p-8 lg:p-12">
          <div className="max-w-md mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Book a Demo</h1>
              <p className="text-gray-500 dark:text-gray-400">Schedule a personalized demo with our experts</p>
            </div>

            {success ? (
              <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-6 rounded-lg flex flex-col items-center justify-center text-center shadow-md">
                <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h2 className="text-2xl font-bold mb-2">Thank you for booking a demo!</h2>
                <p className="mb-4">Your request has been received. Our team will contact you soon to confirm your demo session.</p>
                <div className="flex gap-4">
                  <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">Back to Home</Link>
                  <button onClick={() => { setSuccess(false); setFormData({ name: "", email: "", company: "", role: "", date: "", time: "", timePeriod: "AM", attendees: "1-5", message: "" }); }} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition">Book Another Demo</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <Label>Full Name<span className="text-error-500">*</span></Label>
                    <Input
                      type="text"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label>Email<span className="text-error-500">*</span></Label>
                    <Input
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <Label>Company Name<span className="text-error-500">*</span></Label>
                    <Input
                      type="text"
                      name="company"
                      placeholder="Your company"
                      value={formData.company}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label>Your Role<span className="text-error-500">*</span></Label>
                    <Select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      options={[
                        { value: "", label: "Select your role" },
                        { value: "executive", label: "Executive/C-Level" },
                        { value: "manager", label: "Manager" },
                        { value: "director", label: "Director" },
                        { value: "other", label: "Other" }
                      ]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <Label>Preferred Date<span className="text-error-500">*</span></Label>
                    <div className="relative">
                      <Input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="pl-3 pr-10 dark:text-white"
                      />
                      <CalenderIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 dark:text-gray-300 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <Label>Preferred Time<span className="text-error-500">*</span></Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          type="time"
                          name="time"
                          value={formData.time}
                          onChange={handleChange}
                          className="w-full dark:text-white"
                        />
                      </div>
                      <Select
                        name="timePeriod"
                        value={formData.timePeriod}
                        onChange={handleChange}
                        options={[
                          { value: "AM", label: "AM" },
                          { value: "PM", label: "PM" }
                        ]}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Number of Attendees</Label>
                  <Select
                    name="attendees"
                    value={formData.attendees}
                    onChange={handleChange}
                    options={[
                      { value: "1-5", label: "1-5 people" },
                      { value: "6-10", label: "6-10 people" },
                      { value: "10+", label: "10+ people" }
                    ]}
                  />
                </div>

                <div>
                  <Label>Anything specific you'd like to see?</Label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Booking...' : 'Book Demo'}
                </button>
                {error && <div className="text-red-600 dark:text-red-400 text-center mt-2">{error}</div>}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}