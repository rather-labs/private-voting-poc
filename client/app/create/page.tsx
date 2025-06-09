"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { toUTCDate } from "../utils/locale";

interface VotingOption {
  name: string;
  description: string;
}

// Helper function to format date for datetime-local input
function formatDateForInput(date: Date): string {
  return date.toLocaleString('en-US', {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)/, '$3-$1-$2T$4:$5:$6');
}

export default function CreateVoting() {
  const router = useRouter();
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: formatDateForInput(now),
    endDate: formatDateForInput(tomorrow),
    options: [{ name: "", description: "" }, { name: "", description: "" }],
    isPublic: false,
    maxVoters: "",
    voteThreshold: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Filter out options with empty names
    const filteredOptions = formData.options.filter(option => option.name.trim() !== "");

    if (filteredOptions.length < 2) {
      setError("Please add at least 2 voting options");
      setLoading(false);
      return;
    }

    // Check for duplicate option names
    const optionNames = filteredOptions.map(option => option.name.trim().toLowerCase());
    const uniqueOptionNames = new Set(optionNames);
    if (uniqueOptionNames.size !== optionNames.length) {
      setError("Each voting option must have a unique name");
      setLoading(false);
      return;
    }

    // Validate dates
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    if (endDate <= startDate) {
      setError("End date must be later than start date");
      setLoading(false);
      return;
    }

    // Validate max voters if provided
    if (formData.maxVoters && (Number.isNaN(Number(formData.maxVoters)) || Number(formData.maxVoters) <= 0)) {
      setError("Maximum voters must be a positive number");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/voting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          startDate: toUTCDate(formData.startDate),
          endDate: toUTCDate(formData.endDate),
          options: filteredOptions,
          maxVoters: formData.maxVoters ? Number(formData.maxVoters) : undefined,
          voteThreshold: formData.voteThreshold ? Number(formData.voteThreshold) : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create voting');
      }

      router.push("/");
      router.refresh();

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create voting");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index: number, field: keyof VotingOption, value: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === index ? { ...option, [field]: value } : option
      ),
    }));
  };

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, { name: "", description: "" }],
    }));
  };

  const removeOption = (index: number) => {
    if (formData.options.length <= 2) return; // Fix minimum ammount to 2 options
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Election</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  id="startDate"
                  name="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  id="endDate"
                  name="endDate"
                  required
                  value={formData.endDate}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Voting Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                    Show results publicly before voting finalization
                  </label>
                </div>

                <div>
                  <label htmlFor="maxVoters" className="block text-sm font-medium text-gray-700">
                    Maximum Number of Voters (Optional)
                  </label>
                  <input
                    type="number"
                    id="maxVoters"
                    name="maxVoters"
                    min="1"
                    value={formData.maxVoters}
                    onChange={handleChange}
                    placeholder="No limit"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Leave empty for unlimited voters
                  </p>
                </div>

                <div>
                  <label htmlFor="voteThreshold" className="block text-sm font-medium text-gray-700">
                    Vote Threshold (Optional)
                  </label>
                  <input
                    type="number"
                    id="voteThreshold"
                    name="voteThreshold"
                    min="1"
                    value={formData.voteThreshold}
                    onChange={handleChange}
                    placeholder="No threshold"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Election will end when any option reaches this number of votes
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label htmlFor="voting-options" className="block text-sm font-medium text-gray-700">
                  Voting Options
                </label>
                <button
                  type="button"
                  onClick={addOption}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Option
                </button>
              </div>
              <div className="space-y-4">
                {formData.options.map((option, index) => (
                  <div key={`option-${// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                                      index}`} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <label htmlFor={`option-${index}-name`} className="block text-sm font-medium text-gray-700 mb-1">
                          Option Name
                        </label>
                        <input
                          type="text"
                          id={`option-${index}-name`}
                          value={option.name}
                          onChange={(e) => handleOptionChange(index, "name", e.target.value)}
                          placeholder={`Option ${index + 1} Name`}
                          required
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      {formData.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div>
                      <label 
                        htmlFor={`option-${index}-description`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Option Description
                      </label>
                      <textarea
                        id={`option-${index}-description`}
                        value={option.description}
                        onChange={(e) => handleOptionChange(index, "description", e.target.value)}
                        placeholder={`Option ${index + 1} Description`}
                        rows={2}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Election"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 