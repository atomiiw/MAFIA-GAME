import { player } from "./player.js";

// Movement variables
let lastKeyPressed = null;
const pressedKeys = new Set();
const speed = 100;

// Helper to change animations
function updateAnimation(direction) {
    player.currentDir = direction;
    const animationType = `walk-${direction}`;
    if (player.curAnim() !== animationType) {
        player.play(animationType);
    }
}

// Determine how the player moves or idles
function handleMovement() {
    if (lastKeyPressed === "left") {
        player.currentDir = lastKeyPressed;
        player.move(-speed, 0);
        updateAnimation("left");
    } else if (lastKeyPressed === "right") {
        player.currentDir = lastKeyPressed;
        player.move(speed, 0);
        updateAnimation("right");
    } else if (lastKeyPressed === "up") {
        player.currentDir = lastKeyPressed;
        player.move(0, -speed);
        updateAnimation("up");
    } else if (lastKeyPressed === "down") {
        player.currentDir = lastKeyPressed;
        player.move(0, speed);
        updateAnimation("down");
    } else {
        player.stop();
        player.play(`idle-${player.currentDir}`);
    }
}

// Key press/release logic
function setDirection(key) {
    pressedKeys.add(key);
    if (pressedKeys.size === 1) {
        lastKeyPressed = key;
        handleMovement();
    }
}

function clearDirection(key) {
    pressedKeys.delete(key);
    if (lastKeyPressed === key) {
        lastKeyPressed = pressedKeys.size > 0 ? [...pressedKeys][0] : null;
    }
    handleMovement();
}

// Movement keys
onKeyDown("left", () => setDirection("left"));
onKeyDown("right", () => setDirection("right"));
onKeyDown("up",   () => setDirection("up"));
onKeyDown("down", () => setDirection("down"));

onKeyRelease("left",  () => clearDirection("left"));
onKeyRelease("right", () => clearDirection("right"));
onKeyRelease("up",    () => clearDirection("up"));
onKeyRelease("down",  () => clearDirection("down"));

// Set the default idle animation on load
player.play("idle-down");
