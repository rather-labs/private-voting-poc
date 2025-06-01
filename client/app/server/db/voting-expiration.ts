import { readDB, writeDB, closeVoting, type Voting } from './voting-db';

// Keep track of active voting indices sorted by end date
let activeVotingIndices: number[] = [];

// Initialize the active voting indices
export function initializeActiveVotings() {
  const db = readDB();
  activeVotingIndices = db.votings
    .map((voting: Voting, index: number) => ({ index, endDate: new Date(voting.endDate), status: voting.status }))
    .filter(({ status }) => status == 'active')
    .sort((a: { endDate: Date }, b: { endDate: Date }) => a.endDate.getTime() - b.endDate.getTime())
    .map(({ index }: { index: number }) => index);
}

// Add a new voting to the active list
export function addActiveVoting(index: number, endDate: string) {
  const endDateTime = new Date(endDate).getTime();
  const insertIndex = activeVotingIndices.findIndex(
    i => new Date(readDB().votings[i].endDate).getTime() > endDateTime
  );
  
  if (insertIndex === -1) {
    activeVotingIndices.push(index);
  } else {
    activeVotingIndices.splice(insertIndex, 0, index);
  }
}

// Check and close expired votings
export function checkExpiredVotings() {
  const now = new Date();
  const db = readDB();
  const expiredIndices: number[] = [];

  // Find all expired votings
  for (let i = 0; i < activeVotingIndices.length; i++) {
    const votingIndex = activeVotingIndices[i];
    const voting = db.votings[votingIndex];
    
    if (new Date(voting.endDate) <= now) {
      expiredIndices.push(i);
      closeVoting(votingIndex);
    } else {
      // Since the array is sorted, we can stop checking once we find a non-expired voting
      break;
    }
  }

  // Remove expired votings from the active list (in reverse order to maintain correct indices)
  for (let i = expiredIndices.length - 1; i >= 0; i--) {
    activeVotingIndices.splice(expiredIndices[i], 1);
  }

  return expiredIndices.length > 0;
}

// Start the expiration checker
export function startExpirationChecker() {
  // Check immediately on start
  checkExpiredVotings();
  
  // Then check every minute
  setInterval(checkExpiredVotings, 60000);
} 