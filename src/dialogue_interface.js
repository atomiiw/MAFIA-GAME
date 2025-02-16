import { npcs } from "./npc_data.js";
import { player } from "./player.js";
import { NPCDialogueSystem } from "./NPCDialogueSystem.js";

export let isTalking = false;

export function setIsTalking(value) {
    isTalking = value;
}

export let currentNPC = null;

// ✅ **Start a conversation with an NPC**
export function showConversation(npc) {
    if (isTalking) return;

    isTalking = true;
    currentNPC = npc;

    npc.isPaused = true;
    npc.stop();
    npcs.forEach(n => n.isGlowing = false);
    npc.isGlowing = true;

    updateNPCDirection(npc, player.pos);
    NPCDialogueSystem(currentNPC.npcName);
}

// ✅ **NPC faces the player**
function updateNPCDirection(npc, playerPos) {
    const dx = playerPos.x - npc.pos.x;
    const dy = playerPos.y - npc.pos.y;
    npc.currentDir = Math.abs(dx) > Math.abs(dy)
        ? (dx > 0 ? "right" : "left")
        : (dy > 0 ? "down" : "up");
    npc.play(`idle-${npc.currentDir}`);
}

// ✅ **End conversation**
export function hideConversation() {

    if (currentNPC) {
        currentNPC.isPaused = false;
        currentNPC.isGlowing = false;
        currentNPC = null;
    }
}

// ✅ **Press Space → Start talking to an NPC**
onKeyPress("space", () => {
    if (isTalking) return;
    const glowingNPC = npcs.find(n => n.isGlowing);
    if (glowingNPC) showConversation(glowingNPC);
});
