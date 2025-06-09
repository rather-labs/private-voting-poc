"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import { Toaster } from 'react-hot-toast';
import VotingProofGeneration from "../../components/ProofGeneration";
import type { Voting } from "../../server/db/voting-db";
import { formatLocalDate } from "../../utils/locale";

export default function VotingPage() {
  const params = useParams();
  const [voting, setVoting] = useState<Voting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVoting() {
      try {
        const response = await fetch(`/api/voting?id=${Number(params.id)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch voting');
        }
        const data = await response.json();
        setVoting(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load voting');
      } finally {
        setLoading(false);
      }
    }

    fetchVoting();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center text-gray-900 dark:text-white">Loading...</div>
        </main>
      </div>
    );
  }

  if (error || !voting) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center text-red-600 dark:text-red-400">
            {error || 'Voting not found'}
          </div>
        </main>
      </div>
    );
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700';
      case 'closed':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600';
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />
      <Toaster />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{voting.title}</h1>
              <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(voting.status)}`}>
                {voting.status === 'active' ? 'Open' : voting.status === 'pending' ? 'Upcoming' : 'Closed'}
              </div>
            </div>
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Election Details</h2>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 transition-colors">
                <p className="text-gray-700 dark:text-gray-300 mb-4">{voting.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">Start Date:</span>{" "}
                    {formatLocalDate(voting.startDate)}
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">End Date:</span>{" "}
                    {formatLocalDate(voting.endDate)}
                  </div>
                  {voting.maxVoters && (
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">Maximum Total Voters:</span>{" "}
                      {voting.maxVoters}
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Election will close when this number of voters is reached</p>
                    </div>
                  )}
                  {voting.voteThreshold && (
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">Votes to win:</span>{" "}
                      {voting.voteThreshold}
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Election will end when any option reaches this number of votes</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Voting Options */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Voting Options</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {voting.options.map((option, index) => (
                  <div key={`${option.name}-${index}`} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 transition-colors">
                    <h3 className="font-medium text-gray-900 dark:text-white">{option.name}</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{option.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Results Section - Only show if results are public or voting is closed */}
            {(voting.isPublic || voting.status === 'closed') && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {voting.status === 'closed' ? "Results" : "Current Votes"}
                </h2>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 transition-colors">
                  {(() => {
                    const totalVotes = voting.results.reduce((sum, votes) => sum + votes, 0);
                    return (
                      <>
                        <div className="mb-2 text-gray-900 dark:text-white">Total Votes: {totalVotes}</div>
                        <div className="space-y-2">
                          {voting.results.map((votes, index) => {
                            const option = voting.options[index];
                            const percentage = totalVotes > 0 
                              ? (votes / totalVotes) * 100
                              : 0;
                            
                            const displayPercentage = percentage.toFixed(1);
                            
                            return (
                              <div key={`${option.name}-${index}`} className="flex items-center gap-2">
                                <div className="w-32 font-medium text-gray-900 dark:text-white">{option.name}:</div>
                                <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-purple-600 dark:bg-purple-500 rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%`, maxWidth: '100%' }}
                                  />
                                </div>
                                <div className="w-20 text-right text-sm text-gray-700 dark:text-gray-300">
                                  {votes} ({displayPercentage}%)
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
          {voting.status === 'active' && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Cast your vote</h2>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 transition-colors">
                <VotingProofGeneration voting={voting} setVoting={setVoting} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 