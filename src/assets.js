import { createNPCSpriteConfig, createGlowSpriteConfig } from "./utils.js";

// 1) LOAD FOUR MAP SPRITES (Each 2048×1792)
loadSprite("map_tl", "./tile_0.png", { filter: "nearest" });
loadSprite("map_tr", "./tile_1.png", { filter: "nearest" });
loadSprite("map_bl", "./tile_2.png", { filter: "nearest" });
loadSprite("map_br", "./tile_3.png", { filter: "nearest" });

// 2) PLAYER SPRITE
loadSprite("player_char", "./character_17-24.png", {
    sliceX: 12,
    sliceY: 8,
    anims: {
        "idle-down": 7,
        "walk-down": { from: 6, to: 8, loop: true, speed: 8 },
        "idle-up": 43,
        "walk-up": { from: 42, to: 44, loop: true, speed: 8 },
        "idle-left": 19,
        "walk-left": { from: 18, to: 20, loop: true, speed: 8 },
        "idle-right": 31,
        "walk-right": { from: 30, to: 32, loop: true, speed: 8 },
    },
});

// 3) NPC SPRITES
loadSprite("npc1", "./character_1-8.png",  createNPCSpriteConfig(1));
loadSprite("npc2", "./character_1-8.png",  createNPCSpriteConfig(4));
loadSprite("npc3", "./character_1-8.png",  createNPCSpriteConfig(7));
loadSprite("npc4", "./character_1-8.png",  createNPCSpriteConfig(10));
loadSprite("npc5", "./character_9-16.png", createNPCSpriteConfig(1));
loadSprite("npc6", "./character_9-16.png", createNPCSpriteConfig(4));
loadSprite("npc7", "./character_9-16.png", createNPCSpriteConfig(7));

// NPC glowing effect
loadSprite("golden_glow", "public/golden_glow.png");
