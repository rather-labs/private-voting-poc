import { initializeActiveVotings, initializeInactiveVotings, startExpirationChecker } from './db/voting-status';

// Initialize the server
export async function initializeServer() {
  try {
    // Initialize the active votings list
    await initializeActiveVotings();
    await initializeInactiveVotings();
    
    // Start the expiration checker
    await startExpirationChecker();
    
    console.log('Server initialized successfully');
  } catch (error) {
    console.error('Failed to initialize server:', error);
    throw error;
  }
} 