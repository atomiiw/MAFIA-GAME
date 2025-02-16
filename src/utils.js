// A helper function used when defining NPC sprites
export function createNPCSpriteConfig(central_col) {
    return {
        sliceX: 12,
        sliceY: 8,
        anims: {
            "idle-down": central_col,
            "walk-down": { from: central_col - 1, to: central_col + 1, loop: true, speed: 8 },
            "idle-left": central_col + 12,
            "walk-left": { from: central_col + 11, to: central_col + 13, loop: true, speed: 8 },
            "idle-right": central_col + 24,
            "walk-right": { from: central_col + 23, to: central_col + 25, loop: true, speed: 8 },
            "idle-up": central_col + 36,
            "walk-up": { from: central_col + 35, to: central_col + 37, loop: true, speed: 8 },
        },
    };
}

// Define a glow sprite config (same slices but no animations)
export function createGlowSpriteConfig(central_col) {
    return {
        sliceX: 12,
        sliceY: 8,
        anims: {
            "idle-glow": central_col,
        },
    };
}