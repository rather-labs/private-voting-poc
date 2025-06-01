import { initializeActiveVotings, startExpirationChecker } from './db/voting-expiration';

// Initialize the server
export function initializeServer() {
  // Initialize the active votings list
  initializeActiveVotings();
  
  // Start the expiration checker
  startExpirationChecker();
} 