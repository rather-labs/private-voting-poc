"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import type { Voting } from "./server/db/voting-db";
import { formatLocalDate } from "./utils/locale";
import Tooltip from "./components/Tooltip";
import { tooltipTexts } from "./utils/tooltipTexts";

export default function Home() {
  const [votings, setVotings] = useState<Voting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVotings() {
      try {
        const response = await fetch('/api/voting');
        if (!response.ok) {
          throw new Error('Failed to fetch votings');
        }
        const data = await response.json();
        setVotings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load votings');
      } finally {
        setLoading(false);
      }
    }

    fetchVotings();
  }, []);

  const VotingGrid = ({ filteredVotings, title }: { filteredVotings: Voting[], title: string }) => (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-black mb-6">{title}</h2>
      {filteredVotings.length === 0 ? (
        <div className="text-center text-black">No {title.toLowerCase()} at the moment</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVotings.map((voting) => (
            <Link
              key={votings.indexOf(voting)+1}
              href={`/voting/${votings.indexOf(voting)+1}`}
              className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-black mb-2">
                  {voting.title}
                </h3>
                <p className="text-black mb-4 line-clamp-2">
                  {voting.description}
                </p>
                <div className="flex justify-between text-sm text-black">
                  <div>Start: {formatLocalDate(voting.startDate)}</div>
                </div>
                <div className="flex justify-between text-sm text-black">
                  <div>End: {formatLocalDate(voting.endDate)}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-black">Elections</h1>
            <Tooltip text={tooltipTexts.createElectionHome} showIcon>
              <Link
                href="/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create New Election
              </Link>
            </Tooltip>
          </div>
          
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : (
            <>
              <VotingGrid filteredVotings={votings.filter((v: Voting) => v.status === 'active')} title="Open Elections" />
              <VotingGrid filteredVotings={votings.filter((v: Voting) => v.status === 'pending')} title="Upcoming Elections" />
              <VotingGrid filteredVotings={votings.filter((v: Voting) => v.status === 'closed')} title="Closed Elections" />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
