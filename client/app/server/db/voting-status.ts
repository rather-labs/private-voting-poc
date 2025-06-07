import { closeVoting, getVotings, openVoting, type Voting } from './voting-db';

// Keep track of active voting IDs sorted by end date
let activeVotingIds: number[] = [];
let inactiveVotingIds: number[] = [];

// Initialize the active voting indices
export async function initializeActiveVotings() {
  const votings = await getVotings();
  activeVotingIds = votings
    .filter((voting: Voting) => voting.status === 'active')
    .sort((a: Voting, b: Voting) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .map((voting: Voting) => voting.id)
    .filter((id): id is number => id !== undefined);
}

export async function initializeInactiveVotings() {
  const votings = await getVotings();
  inactiveVotingIds = votings
    .filter((voting: Voting) => voting.status === 'closed')
    .sort((a: Voting, b: Voting) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .map((voting: Voting) => voting.id)
    .filter((id): id is number => id !== undefined);
}

// Add a new voting to the active list
export async function addActiveVoting(id: number, endDate: string) {
  const endDateTime = new Date(endDate).getTime();
  const votings = await getVotings();
  const insertIndex = activeVotingIds.findIndex(
    votingId => {
      const voting = votings.find(v => v.id === votingId);
      return voting && new Date(voting.endDate).getTime() > endDateTime;
    }
  );
  
  if (insertIndex === -1) {
    activeVotingIds.push(id);
  } else {
    activeVotingIds.splice(insertIndex, 0, id);
  }
}

// Add a new voting to the inactive list
export async function addInactiveVoting(id: number, beginDate: string) {
  const beginDateTime = new Date(beginDate).getTime();
  const votings = await getVotings();
  const insertIndex = inactiveVotingIds.findIndex(
    votingId => {
      const voting = votings.find(v => v.id === votingId);
      return voting && new Date(voting.startDate).getTime() > beginDateTime;
    }
  );
  
  if (insertIndex === -1) {
    inactiveVotingIds.push(id);
  } else {
    inactiveVotingIds.splice(insertIndex, 0, id);
  }
}

// Check and close expired votings
export async function checkExpiredVotings() {
  const now = new Date();
  const votings = await getVotings();
  const expiredIds: number[] = [];

  // Find all expired votings
  for (let i = 0; i < activeVotingIds.length; i++) {
    const votingId = activeVotingIds[i];
    const voting = votings.find(v => v.id === votingId);
    
    if (voting) {

      const shouldClose = 
        new Date(voting.endDate) <= now || // Time expired
        (voting.voteThreshold !== undefined 
          && voting.voteThreshold > 0 
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          && voting.results.some(votes => votes >= voting.voteThreshold!)) || // Threshold reached
        (voting.maxVoters !== undefined 
          && voting.maxVoters > 0 
          && voting.results.reduce((a, b) => a + b, 0) >= voting.maxVoters); // Max voters reached
      
      
      if (shouldClose) {
        expiredIds.push(i);
        await closeVoting(votingId);
      } else if (new Date(voting.endDate) > now) {
        // Since the array is sorted, we can stop checking once we find a non-expired voting
        break;
      }
    }
  }

  // Remove expired votings from the active list (in reverse order to maintain correct indices)
  for (let i = expiredIds.length - 1; i >= 0; i--) {
    activeVotingIds.splice(expiredIds[i], 1);
  }

  return expiredIds.length > 0;
}

// Check and open votings that have reached their begin date
export async function checkBeginVotings() {
  const now = new Date();
  const votings = await getVotings();
  let openedAny = false;

  // Check all votings
  for (let i = 0; i < inactiveVotingIds.length; i++) {
    const votingId = inactiveVotingIds[i];
    const voting = votings.find(v => v.id === votingId);
    
    if (voting && 
        voting.status === 'closed' && 
        new Date(voting.startDate) <= now && 
        new Date(voting.endDate) > now &&
        (!voting.maxVoters || voting.results.reduce((a, b) => a + b, 0) < voting.maxVoters)
    ) {
      // Open the voting
      await openVoting(votingId); // This will update the status to 'active'
      openedAny = true;
      // Add to active votings list
      await addActiveVoting(votingId, voting.endDate);
      // Remove from inactive votings list
      inactiveVotingIds.splice(i, 1);
    }
  }

  return openedAny;
}

// Start the voting status checker
export async function startExpirationChecker() {
  // Check immediately on start
  await checkBeginVotings();
  await checkExpiredVotings();
  
  // Then check every minute
  setInterval(async () => {
    await checkBeginVotings();
    await checkExpiredVotings();
  }, 60000);
} 