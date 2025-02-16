import { createNPCs } from "./npc_creation.js";
import { setupNPCBehavior } from "./npc_behavior.js";
import { npcs, npcNames } from "./npc_data.js";

import { offsetByDir, angleByDir, offsetByForecastDir } from "./npc_creation.js"

createNPCs(add);

npcs.forEach((npc, index) => {
    setupNPCBehavior(npc, 50);

    const npcNameTag = add([
        text(npcNames[index] || `NPC${index + 1}`, { size: 13 }),
        pos(npc.pos.x + 10, npc.pos.y - 5),
        anchor("center"),
    ]);

    const glow = add([
        sprite("golden_glow"),
        pos(npc.pos.x + 9, npc.pos.y + 21),
        anchor("center"),
        scale(1.5),
        opacity(0), 
        z(-0.1), 
        "npc-glow",
    ]);

    npc.onUpdate(() => {
        // 1) Update NPC hitbox
        const dir = npc.currentDir;
        const offset = offsetByDir[dir] || vec2(0, 0);
        npc.hitbox.pos = npc.pos.add(offset);
        npc.hitbox.angle = angleByDir[dir] || 0;
    
        // 2) Update all forecast hitboxes in a loop
        Object.entries(npc.forecasthitbox).forEach(([dirName, fbox]) => {
            // Each forecast box has its own offset
            fbox.pos = npc.pos.add(offsetByForecastDir[dirName]);
            
            // Optionally rotate if you want them pointing outward
            fbox.angle = angleByDir[dirName];
            
            fbox.collided = false;
        });
    
        // 3) Update name tag + glow
        npcNameTag.pos = npc.pos.add(10, -5);
        glow.pos = npc.pos.add(9, 21);
        glow.opacity = npc.isGlowing ? 0.8 : 0;
    });
    
});

export {npcs};

