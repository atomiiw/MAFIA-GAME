import { isTalking, currentNPC } from "./dialogue_interface.js"; 
import { player } from "./player.js";
import { updateNPCDirection } from "./npc_utils.js";
import { directions } from "./npc_data.js";

/**
 * Setup basic NPC behavior
 */
export function setupNPCBehavior(npc, speed) {

    // Main update for movement & conversation
    npc.onUpdate(() => {

        // Stop & glow if in conversation
        if (isTalking && currentNPC === npc) {
            npc.isPaused = true;
            npc.isGlowing = true;
            updateNPCDirection(npc, player.pos);
            return;
        }

        if (!npc.isEscaping) {
            npcMoves(npc, speed);
        }

        // Stuck detection on every frame
        npc.isStuck = stuck_detection(npc);

        if (npc.isStuck) {
            moveUntilFree(npc);
        }

    });

    HandleCollision(npc);  

    // Schedule random movement changes
    // scheduleNextAction(npc);

}

function HandleCollision(npc){
    ["wall", "npc", "player"].forEach(tag => {
        npc.hitbox.onCollide(tag, () => {
            if (!npc.isEscaping) {
                moveUntilFree(npc);
            }
        });
    }); 
}

/**
 * Push NPC out of collision, pick a new direction, and pause briefly
 */
function moveUntilFree(npc) {
    if (npc.isPaused || npc.isEscaping) return;

    npc.isEscaping = true; // Prevent repeated triggers

    // Pick a new direction that's hopefully safer
    npc.currentDir = getNewDirection(npc);

    // nudge NPC out so it's not still "inside" the wall or collider
    const nudge = 2;
    switch (npc.currentDir) {
        case "left":  npc.pos.x -= nudge; npc.play("walk-left");  break;
        case "right": npc.pos.x += nudge; npc.play("walk-right"); break;
        case "up":    npc.pos.y += nudge; npc.play("walk-up");    break;
        case "down":  npc.pos.y -= nudge; npc.play("walk-down");  break;
    }

    // Brief pause so the NPC won't instantly flip direction again
    npc.isPaused = true;
    setTimeout(() => {
        npc.isPaused = false;
        npc.isEscaping = false;
    }, 100);
}

function stuck_detection(obj) {

    if (!obj.isPaused) {
        const currentPos = obj.pos.clone();

        // Check if position hasn't changed significantly AND direction hasn't changed
        if (obj.lastPos.dist(currentPos) <= 0.5 && obj.currentDir === obj.prevDir) {
            obj.stuckTime += 1; // Increment time if stuck
        } else {
            obj.stuckTime = 0; // Reset if position changed
        }

        // Update tracking variables
        obj.lastPos = currentPos.clone();
        obj.prevDir = obj.currentDir; // Store previous direction

        if (obj.stuckTime >= 12) { // Stuck for more than 8 frames
            return true;
        }
    }

    return false;
}


function npcMoves(npc, speed = 100) {
    
    if (npc.isPaused) {
        npc.stop()
        const idleAnim = `idle-${npc.currentDir || "down"}`
        if (npc.curAnim() !== idleAnim) {
            npc.play(idleAnim)
        }
        return
    }

    // If not paused or escaping, just walk in npc.currentDir at normal speed
    let targetAnim = ""
    switch (npc.currentDir) {
        case "left":
            npc.move(-speed, 0)
            targetAnim = "walk-left"
            break
        case "right":
            npc.move(speed, 0)
            targetAnim = "walk-right"
            break
        case "up":
            npc.move(0, -speed)
            targetAnim = "walk-up"
            break
        case "down":
            npc.move(0, speed)
            targetAnim = "walk-down"
            break
        default:
            npc.stop()
            targetAnim = "idle-down"
    }

    if (npc.curAnim() !== targetAnim) {
        npc.play(targetAnim)
    }
}


/**
 * Returns a new direction that isn't colliding or random if all collide
 */
function getNewDirection(npc) {

    let safeDirs = [];

    directions.forEach((dir) => {
        if (
            !npc.forecasthitbox[dir].isColliding("wall") &&
            !npc.forecasthitbox[dir].isColliding("npc") &&
            !npc.forecasthitbox[dir].isColliding("player")
        ) {
            safeDirs.push(dir);
        }                                  
    });

    if (safeDirs.length > 0) {
        return choose(safeDirs);
    }
    // If all colliding, pick any random direction
    return choose(directions);
}

// function scheduleNextAction(npc) {

//     if (npc.isEscaping) {
//         scheduleNextAction(npc); // Reschedule if escaping
//         return;
//     }

//     if (rand() < 0.2) {  
//         // 20% chance to pause
//         npc.isPaused = true;
//     } else {  
//         // 80% chance to choose a new direction
//         npc.isPaused = false;
//         npc.currentDir = getNewDirection(npc);
//     }
// }