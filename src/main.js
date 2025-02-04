import kaboom from "kaboom";

// Initialize Kaboom
kaboom({
    width: window.innerWidth,
    height: window.innerHeight,
    stretch: true,
    letterbox: false,
});

// 1) LOAD FOUR MAP SPRITES (Each 2048×1792)
loadSprite("map_tl", "./public/tile_0.png", { filter: "nearest" });
loadSprite("map_tr", "./public/tile_1.png", { filter: "nearest" });
loadSprite("map_bl", "./public/tile_2.png", { filter: "nearest" });
loadSprite("map_br", "./public/tile_3.png", { filter: "nearest" });

// Add each map piece, matching original 4096×3584 layout
const mapTL = add([
    sprite("map_tl"),
    scale(0.5),
    pos(0, 0),
    anchor("topleft"),
]);

const mapTR = add([
    sprite("map_tr"),
    scale(0.5),
    pos(1024, 0),   // 2048 → 1024
    anchor("topleft"),
]);

const mapBL = add([
    sprite("map_bl"),
    scale(0.5),
    pos(0, 896),    // 1792 → 896
    anchor("topleft"),
]);

const mapBR = add([
    sprite("map_br"),
    scale(0.5),
    pos(1024, 896), // 2048 → 1024, 1792 → 896
    anchor("topleft"),
]);


// 2) CHARACTER + MOVEMENT
loadSprite("player_char", "./public/character_17-24.png", {
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

// Add player
const player = add([
    sprite("player_char"),
    pos(1000, 1000),
    scale(1.5),
    area(),
    body(),
    "player",
]);

let currentDirection = "down";
player.play("idle-down");
const speed = 100;
let lastKeyPressed = null;
const pressedKeys = new Set();

function updateAnimation(direction) {
    currentDirection = direction;
    const animationType = `walk-${direction}`;
    if (player.curAnim() !== animationType) {
        player.play(animationType);
    }
}

function handleMovement() {
    if (lastKeyPressed === "left") {
        player.move(-speed, 0);
        updateAnimation("left");
    } else if (lastKeyPressed === "right") {
        player.move(speed, 0);
        updateAnimation("right");
    } else if (lastKeyPressed === "up") {
        player.move(0, -speed);
        updateAnimation("up");
    } else if (lastKeyPressed === "down") {
        player.move(0, speed);
        updateAnimation("down");
    } else {
        player.stop();
        player.play(`idle-${currentDirection}`);
    }
}

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
onKeyDown("up", () => setDirection("up"));
onKeyDown("down", () => setDirection("down"));
onKeyRelease("left", () => clearDirection("left"));
onKeyRelease("right", () => clearDirection("right"));
onKeyRelease("up", () => clearDirection("up"));
onKeyRelease("down", () => clearDirection("down"));

// 3) DRAG TO PAN CAMERA
let isDragging = false;
let dragStart = vec2(0, 0);
let camStart = camPos();

window.addEventListener("mousedown", (event) => {
    if (event.button === 0) {
        isDragging = true;
        dragStart = mousePos();
        camStart = camPos();
    }
});

window.addEventListener("mouseup", (event) => {
    if (event.button === 0) {
        isDragging = false;
    }
});

onUpdate(() => {
    if (isDragging) {
        const delta = dragStart.sub(mousePos());
        const newCam = camStart.add(delta);

        // The full map is 4096 wide, 3584 tall
        const minX = 700;
        const maxX = 1300;
        const minY = 400;
        const maxY = 1400;

        // Clamp camera so we don't scroll beyond edges
        newCam.x = Math.max(minX, Math.min(newCam.x, maxX));
        newCam.y = Math.max(minY, Math.min(newCam.y, maxY));

        camPos(newCam);
    }
});

// 4) ZOOM (MOUSE WHEEL + PINCH)
let zoom = 1;

window.addEventListener("wheel", (event) => {
    const zoomSpeed = 0.1;
    if (event.deltaY < 0) {
        zoom = Math.min(2.5, zoom + zoomSpeed);
    } else {
        zoom = Math.max(1, zoom - zoomSpeed);
    }
    camScale(vec2(zoom));
});

// Pinch Zoom
let initialDistance = null;
window.addEventListener("touchstart", (event) => {
    if (event.touches.length === 2) {
        initialDistance = Math.hypot(
            event.touches[0].clientX - event.touches[1].clientX,
            event.touches[0].clientY - event.touches[1].clientY
        );
    }
});

window.addEventListener("touchmove", (event) => {
    if (event.touches.length === 2 && initialDistance) {
        const newDistance = Math.hypot(
            event.touches[0].clientX - event.touches[1].clientX,
            event.touches[0].clientY - event.touches[1].clientY
        );
        const scaleChange = newDistance / initialDistance;
        zoom = Math.min(2.5, Math.max(1, zoom * scaleChange));
        camScale(vec2(zoom));
        initialDistance = newDistance;
    }
});


// Collision
// Load each collision tile
processCollisionTile("collision_0", 0, 0, 0.5);
processCollisionTile("collision_1", 2048, 0, 0.5);
processCollisionTile("collision_2", 0, 1792, 0.5);
processCollisionTile("collision_3", 2048, 1792, 0.5);

/**
 * Reads red pixels from the given collision tile,
 * then adds *merged* collision blocks at half-size.
 * @param {string} spriteName - e.g. "collision_0"
 * @param {number} offsetX - x offset of the tile in world space
 * @param {number} offsetY - y offset of the tile in world space
 * @param {number} scaleFactor - 0.5 in your case
 */
function processCollisionTile(spriteName, offsetX, offsetY, scaleFactor = 1) {
    console.log(`Processing collision tile: ${spriteName}`);

    const img = new Image();
    img.onload = handleImageLoad;
    img.onerror = function () {
        console.error(`❌ Failed to load image: ${this.src}`);
    };
    // The collision tile image path
    img.src = `./public/${spriteName}.jpg`;

    function handleImageLoad() {
        console.log(`✅ Image loaded successfully: ${this.src}`);

        // OFFSCREEN canvas (this prevents direct rendering)
        const canvas = document.createElement("canvas");
        // *** Change added here: make sure the canvas stays hidden ***
        canvas.style.display = "none";  
        
        const ctx = canvas.getContext("2d");
        canvas.width = this.width;
        canvas.height = this.height;

        // Clear and draw the image into the offscreen canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(this, 0, 0);

        // Extract pixel data, generate collision walls...
        const imageData = ctx.getImageData(0, 0, this.width, this.height);
        const data = imageData.data;

        // General collision sampling parameters
        const blockSize = 16;      // We'll check in 16x16 blocks
        const threshold = 0.4;     // If ≥ 40% of the block is red, it's solid
        const tileWorldSize = 16;  // Each "block" is 16×16 in game world units

        // 1) Build a 2D array: which blocks are “red”?
        const blocksWide = Math.ceil(this.width / blockSize);
        const blocksHigh = Math.ceil(this.height / blockSize);

        // A 2D array of booleans (true = collision, false = no collision)
        const collisionGrid = Array.from({ length: blocksHigh }, () =>
            new Array(blocksWide).fill(false)
        );

        // Fill collisionGrid by sampling each block
        for (let by = 0; by < blocksHigh; by++) {
            for (let bx = 0; bx < blocksWide; bx++) {
                const startX = bx * blockSize;
                const startY = by * blockSize;

                let redCount = 0;
                let pixelCount = 0;

                // Go through the pixels within this block
                for (let y = startY; y < startY + blockSize && y < this.height; y++) {
                    for (let x = startX; x < startX + blockSize && x < this.width; x++) {
                        const idx = (y * this.width + x) * 4;
                        const r = data[idx];
                        const g = data[idx + 1];
                        const b = data[idx + 2];
                        pixelCount++;

                        // "Red pixel" check
                        if (r > 200 && g < 100 && b < 100) {
                            redCount++;
                        }
                    }
                }

                const fractionRed = redCount / pixelCount;
                if (fractionRed >= threshold) {
                    collisionGrid[by][bx] = true;
                }
            }
        }

        // 2) Merge collision blocks horizontally within each row
        // We'll store these merges in an intermediate array:
        // Each row => array of { startXBlock, endXBlock }
        const rowRectangles = [];
        for (let y = 0; y < blocksHigh; y++) {
            const rowRects = [];
            let startXBlock = -1;

            for (let x = 0; x < blocksWide; x++) {
                const isSolid = collisionGrid[y][x];

                if (isSolid && startXBlock === -1) {
                    // Start a new rectangle
                    startXBlock = x;
                }
                // If we hit a non-solid or the row ends, and we had a solid region
                if ((!isSolid || x === blocksWide - 1) && startXBlock !== -1) {
                    // If x is the last block and it's still solid, adjust
                    const endXBlock = (isSolid && x === blocksWide - 1) ? x : x - 1;
                    rowRects.push({ startXBlock, endXBlock });
                    startXBlock = -1;
                }
            }

            rowRectangles.push(rowRects);
        }

        // 3) Merge rectangles vertically between consecutive rows
        // We'll build a final list of merged rectangles in "world space":
        // Each rectangle: { x, y, w, h } in world units
        const mergedRects = [];
        const ongoingMerges = [];

        for (let y = 0; y < blocksHigh; y++) {
            const currentRowRects = rowRectangles[y];
            const newOngoing = [];

            // For each rect in the current row
            currentRowRects.forEach((currRect) => {
                // Check if there's a matching rect in the ongoing merges
                let merged = false;
                for (let om of ongoingMerges) {
                    // If om is exactly the same horizontal span and ends at y-1
                    if (
                        om.startXBlock === currRect.startXBlock &&
                        om.endXBlock === currRect.endXBlock &&
                        om.endYBlock === y - 1
                    ) {
                        // Extend it
                        om.endYBlock = y;
                        merged = true;
                        break;
                    }
                }
                // If no merge found, create a new entry
                if (!merged) {
                    newOngoing.push({
                        startXBlock: currRect.startXBlock,
                        endXBlock: currRect.endXBlock,
                        startYBlock: y,
                        endYBlock: y,
                    });
                }
            });

            // Anything in ongoingMerges that didn't get extended by the current row
            // we finalize, because it won't extend further
            const stillOngoing = [];
            for (let om of ongoingMerges) {
                // If om.endYBlock === y - 1 and we didn't extend it in this row, finalize it
                if (om.endYBlock === y - 1) {
                    finalizeBlock(om);
                } else {
                    stillOngoing.push(om);
                }
            }

            // Combine arrays for next iteration
            ongoingMerges.length = 0;
            Array.prototype.push.apply(ongoingMerges, stillOngoing);
            Array.prototype.push.apply(ongoingMerges, newOngoing);
        }

        // After the last row, finalize everything still ongoing
        for (let om of ongoingMerges) {
            finalizeBlock(om);
        }

        // Helper to convert block coords to world coords and push to mergedRects
        function finalizeBlock(om) {
            const { startXBlock, endXBlock, startYBlock, endYBlock } = om;
            const blockWidth = (endXBlock - startXBlock + 1);
            const blockHeight = (endYBlock - startYBlock + 1);

            const worldX = (offsetX + startXBlock * tileWorldSize) * scaleFactor;
            const worldY = (offsetY + startYBlock * tileWorldSize) * scaleFactor;
            const worldW = (blockWidth * tileWorldSize) * scaleFactor;
            const worldH = (blockHeight * tileWorldSize) * scaleFactor;

            mergedRects.push({ x: worldX, y: worldY, w: worldW, h: worldH });
        }

        // 4) Finally, add each merged rectangle to the scene as a single `wall`
        let totalWalls = 0;
        mergedRects.forEach((rectInfo) => {
            add([
                rect(rectInfo.w, rectInfo.h),
                pos(rectInfo.x, rectInfo.y),
                area(),
                body({ isStatic: true }),
                opacity(0),  // uncomment to visualize blocks
                "wall",
            ]);
            totalWalls++;
        });

        console.log(
            `🚧 Collision tile "${spriteName}" done! Placed ${totalWalls} merged walls.`
        );
    }
}


// Example collision handling
player.onCollide("wall", () => {
    // NOTE: You may still get some collisions each second if
    // the player is actively moving against a wall. But far
    // fewer than if you had thousands of tiny blocks!

    console.log("🚧 Collision detected!");

    // Get movement direction based on last key pressed
    let moveBack = vec2(0, 0); // Default: don't move

    if (lastKeyPressed === "left") {
        moveBack = vec2(speed, 0); 
    } else if (lastKeyPressed === "right") {
        moveBack = vec2(-speed, 0);
    } else if (lastKeyPressed === "up") {
        moveBack = vec2(0, speed);
    } else if (lastKeyPressed === "down") {
        moveBack = vec2(0, -speed);
    }

    player.move(moveBack); // Move back to prevent clipping
});
