import { directions, npcNames, npcs } from "./npc_data.js";

export const offsetByDir = {
    left:  vec2(5, 5),
    right: vec2(20, 30),
    up:    vec2(0, 0),
    down:  vec2(25, 35),
  };
  
export const angleByDir = {
    left:  90,
    right: -90,
    up:    0,
    down:  180,
  };

export const offsetByForecastDir = {
    left:  vec2(0, 5),
    right: vec2(20, 25),
    up:    vec2(5, -30),
    down:  vec2(20, 60),
  };

export function createNPCs(add) {
    for (let i = 1; i <= 7; i++) {
        // 1) Create the main NPC sprite
        const npc = add([
            sprite(`npc${i}`),
            pos(1000 + i * 20, 900), 
            scale(1.5),
            area(),
            body(),
            "npc",
        ]);

        npc.number = i;
        npc.npcName = npcNames[i - 1] || `NPC${i}`;
        npc.currentDir = choose(directions);
        npc.prevDir = npc.currentDir;
        npc.neighbors = [];
        npc.isGlowing = false;
        npc.isPaused = false; 
        npc.isStuck = false;
        npc.lastPos = npc.pos.clone();
        npc.stuckTime = 0;

        // 2) Create a small "hitbox" for NPC
        npc.hitbox = add([
            rect(25, 2),
            pos(npc.pos.x, npc.pos.y),
            area(),
            opacity(0),
            `npc-hitbox${i}`,
        ]);

        // 3) Create multiple forecast hitboxes
        const forecastDirs = ["right", "left", "up", "down"];
        npc.forecasthitbox = {}; // Store all forecast boxes here

        forecastDirs.forEach((dirName) => {

            const fbox = npc.forecasthitbox[dirName] = add([
                rect(20, 45),
                pos(npc.pos.add(offsetByForecastDir[dirName])), // ✅ Initial offset
                color(255, 0, 0),  // ✅ Red for visibility
                area(),
                opacity(0),      // ✅ Semi-transparent
                rotate(angleByDir[dirName]), // ✅ Set correct initial rotation
                `npc-forecasthitbox${i}-${dirName}`,
            ]);

            fbox.collided = false; // Initialize

            // ✅ Once-per-collision detection
            onCollide(fbox, ["wall", "npc", "player"], () => {
                fbox.collided = true;
            });
        });

        // 4) NPC update function to reset collision flags each frame
        npc.onUpdate(() => {
            Object.values(npc.forecasthitbox).forEach((fbox) => {
                fbox.collided = false; // ✅ Reset collision flag each frame
            });
        });

        // 5) Push NPC to global array
        npcs.push(npc);
    }
}
