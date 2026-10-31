import fs from 'fs';
import path from 'path';
import { AppState } from '../src/types';
import { initializeDemoState } from './plannerCore';

const DATA_DIR = path.join(process.cwd(), 'data');
const STATE_FILE = path.join(DATA_DIR, 'learnloop_state.json');

let inMemoryState: AppState | null = null;

export function loadState(): AppState {
  if (inMemoryState) {
    return inMemoryState;
  }

  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, 'utf-8');
      inMemoryState = JSON.parse(data) as AppState;
      return inMemoryState;
    }
  } catch (err) {
    console.error('Error reading persistent state file, initializing demo:', err);
  }

  // If no state file exists, initialize demo
  inMemoryState = initializeDemoState();
  saveState(inMemoryState);
  return inMemoryState;
}

export function saveState(state: AppState): void {
  inMemoryState = state;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing persistent state file:', err);
  }
}
