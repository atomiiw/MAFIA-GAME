import { isTalking, currentNPC } from "./dialogue_interface.js"; 
import { player } from "./player.js";
import { updateNPCDirection } from "./npc_utils.js";
import { directions } from "./npc_data.js";

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
            console.log("Object is stuck!");
            return true;
        }
    }

    return false;
}

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

    npc.hitbox.onCollide("wall", () => 
        {
            if (!npc.isEscaping) {
                moveUntilFree(npc)
            }
        });
    npc.hitbox.onCollide("npc", () => 
        {
            if (!npc.isEscaping) {
                moveUntilFree(npc)
            }
        });
    npc.hitbox.onCollide("player", () => 
        {
            if (!npc.isEscaping) {
                moveUntilFree(npc)
            }
        });

    // Schedule random movement changes
    // scheduleNextAction(npc);

}

/**
 * Push NPC out of collision, pick a new direction, and pause briefly
 */
function moveUntilFree(npc) {
    if (npc.isPaused || npc.isEscaping) return;

    console.log("colliding");
    npc.isEscaping = true; // Prevent repeated triggers

    // Pick a new direction that's hopefully safer
    let newDirection = directions.filter(dir => dir !== npc.currentDir)[Math.floor(Math.random() * 3)];
    npc.currentDir = newDirection;

    // (Optional) nudge NPC out so it's not still "inside" the wall or collider
    let nudge = 2;
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


function npcMoves(npc, speed = 100) {

    console.log("moving");
    
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
 * Randomly pause or pick a new direction every 1-3 seconds
 */
function scheduleNextAction(npc) {
    if (isTalking && currentNPC === npc) return;

    // Only proceed if the current direction is colliding
    if (!isCollidingForecast(npc, npc.currentDir)) {
        // If no collision, do nothing (stop scheduling)
        return;
    }

    // If there is a collision on the current direction, pick a new action
    npc.isPaused = Math.random() < 0.2; // 20% chance to pause
    if (!npc.isPaused) {
        npc.currentDir = getNewDirection(npc);
    }

    // Schedule the next action only if we collided
    scheduleNextAction(npc);
}


/**
 * Returns a new direction that isn't colliding or random if all collide
 */
function getNewDirection(npc) {
    const directions = ["left", "right", "up", "down"];
    let safeDirs = [];

    directions.forEach((dir) => {
        if (!isCollidingForecast(npc, dir)) {
            safeDirs.push(dir);
        }
    });

    if (safeDirs.length > 0) {
        return choose(safeDirs);
    }
    // If all colliding, pick any random direction
    return choose(directions);
}

/**
 * Simply checks if the forecast box has been flagged as collided
 */
function isCollidingForecast(npc, dir) {
    return npc.forecasthitbox[dir].collided; 
}
