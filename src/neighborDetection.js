const offsetByDir = {
    left:  vec2(5, -10),
    right: vec2(20, 40),
    up:    vec2(-20, -60),
    down:  vec2(40, 90),
  };
  
const angleByDir = {
    left:  90,
    right: -90,
    up:    0,
    down:  180,
  };

export function getDetectionArea(character) {
    const detectionWidth = 60;
    const detectionHeight = 60;

    // Use offset based on direction
    const dir = character.currentDir || 'down';
    const offset = offsetByDir[dir] || vec2(0, 0);

    // Set position based on offset
    let areaX = character.pos.x + offset.x;
    let areaY = character.pos.y + offset.y;

    return {
        x: areaX,
        y: areaY,
        w: detectionWidth,
        h: detectionHeight,
        angle: angleByDir[dir] || 0,  // Apply rotation
    };
}

export function drawDetectionArea(character) {
    // Get initial detection area
    const detection = getDetectionArea(character);

    // Create a semi-transparent rectangle to visualize the detection area
    const detectionBox = add([
        rect(detection.w, detection.h),
        pos(detection.x, detection.y),
        color(0, 255, 0),  // Green for visibility
        opacity(0),
        rotate(detection.angle), // Set initial angle
        "detection-box",
    ]);

    // ✅ Ensure detection box updates every frame
    character.onUpdate(() => {
        const updated = getDetectionArea(character);
        detectionBox.pos = vec2(updated.x, updated.y);
        detectionBox.angle = updated.angle;  // ✅ Make sure rotation updates too
    });

    return detectionBox;
}


/**
 * Sets up neighbor detection for all characters (player + NPCs).
 *
 * @param {Array} characters - An array of all characters (including player & NPCs).
 * @param {Object} player    - The player entity.
 */

import { isTalking } from "./dialogue_interface.js";

function isInsideBox(obj, box) {
    // 1) World position of the point
    const px = obj.pos.x;
    const py = obj.pos.y;

    // 2) Pivot is top-left corner of the box (because default anchor = top-left)
    const pivotX = box.pos.x;
    const pivotY = box.pos.y;

    // 3) Translate point so pivot is at (0,0)
    const dx = px - pivotX;
    const dy = py - pivotY;

    // 4) Rotate by -box.angle (convert degrees to radians)
    const angleRad = -box.angle * (Math.PI / 180);
    const rotatedX = dx * Math.cos(angleRad) - dy * Math.sin(angleRad);
    const rotatedY = dx * Math.sin(angleRad) + dy * Math.cos(angleRad);

    // 5) Now check if (rotatedX, rotatedY) is inside [0..width, 0..height]
    return (
        rotatedX >= 0 &&
        rotatedX <= box.width &&
        rotatedY >= 0 &&
        rotatedY <= box.height
    );
}



export function setupNeighborDetection(characters, player) {
    onUpdate(() => {

        // Sort out a neighbor list for every char
        characters.forEach((character) => {
            const detectionBox = drawDetectionArea(character);
        
            character.neighbors = characters.filter((other) => {
                if (other === character) return false;
        
                return isInsideBox(other, detectionBox);
            });
        });

        if (isTalking) return; // ❌ Skip glowing updates when in conversation

        // ✅ Make a copy of each character's neighbors array to prevent modifications during iteration
        const currentPlayerNeighbors = [...player.neighbors];

        // ✅ Find the closest NPC to the player
        let closestNPC = null;
        let minDistance = Infinity;

        characters
            .filter((c) => c.is("npc"))
            .forEach((npc) => {
                if (currentPlayerNeighbors.includes(npc)) {
                    const distance = player.pos.dist(npc.pos);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestNPC = npc;
                    }
                }
            });

        // ✅ Set only the closest NPC to glow (if no conversation is active)
        characters.forEach((character) => {
            if (character.is("npc")) {
                if (character === closestNPC) {
                    if (!character.isGlowing) {
                        console.log(`✨ NPC ${character.npcName} started glowing!`);
                    }
                    character.isGlowing = true;
                } else {
                    if (character.isGlowing) {
                        console.log(`🔅 NPC ${character.npcName} stopped glowing.`);
                    }
                    character.isGlowing = false;
                }
            }
        });

        // ✅ Player neighbor detection: Set player glow if near an NPC
        if (currentPlayerNeighbors.length > 0) {
            if (!player.isGlowing) {
                console.log(`💡 Player started glowing (near ${currentPlayerNeighbors.length} NPCs)!`);
            }
            player.isGlowing = true;
        } else {
            if (player.isGlowing) {
                console.log(`🌑 Player stopped glowing (no nearby NPCs).`);
            }
            player.isGlowing = false;
        }

    });
}
