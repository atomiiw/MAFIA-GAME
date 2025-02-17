// Create the player
export const player = add([
    sprite("player_char"),
    pos(1000, 900),
    scale(1.5),
    area(), 
    body({ isStatic: false }), // Ensures player can move
    "player"
]);

player.neighbors = []; // Array to track detected neighbors

// Add Name Tag for Player
const playerNameTag = add([
    text("You", { size: 13 }),
    pos(player.pos.x + 10, player.pos.y - 5),
    anchor("center"),
]);

player.currentDir = "down";

// Update Name Tag to Follow Player
onUpdate(() => {
    playerNameTag.pos = vec2(player.pos.x + 10, player.pos.y - 5);
});
