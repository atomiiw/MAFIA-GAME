// import "./gameConfig.js";
// import "./assets.js";
// import "./map.js";
// import { player } from "./player.js";
// import { npcs } from "./npc_data.js";
// import "./input.js";
// import "./camera.js";
// import "./collision.js";
// import "./utils.js";
// import { setupNeighborDetection } from "./neighbordetection.js";
// import "./dialogue_interface.js"; 
// import "./NPCDialogueSystem.js"
// import "./npcs.js"

// // Combine the player and all NPCs into a single characters array.
// const characters = [player, ...npcs];

// // Initialize neighbor detection with both the characters array and the player object.
// setupNeighborDetection(characters, player);

// Load game configuration and assets first
import "./gameConfig.js";
import "./assets.js";

// Load map and collision-related systems before characters
import "./map.js";
import "./collision.js";

// Load the player and NPC system
import { player } from "./player.js";
import { npcs } from "./npc_main.js";

// Load input handling and camera systems
import "./input.js";
import "./camera.js";

// Load dialogue-related scripts after NPCs are loaded
import "./dialogue_interface.js";
import "./NPCDialogueSystem.js";

// Utility functions and neighbor detection
import "./utils.js";
import { setupNeighborDetection } from "./neighbordetection.js";

// Combine the player and all NPCs into a single characters array
const characters = [player, ...npcs];

// Initialize neighbor detection with both the characters array and the player object
setupNeighborDetection(characters, player);

