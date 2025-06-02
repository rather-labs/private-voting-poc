import { initializeActiveVotings, initializeInactiveVotings, startExpirationChecker } from './db/voting-status';

// Initialize the server
export function initializeServer() {
  // Initialize the active votings list
  initializeActiveVotings();
  initializeInactiveVotings();
  
  // Start the expiration checker
  startExpirationChecker();
} 