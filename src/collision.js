// Process each collision tile (images are half of original size)
processCollisionTile("collision_new_0", 0,    0,    0.5);
processCollisionTile("collision_new_1", 2048, 0,    0.5);
processCollisionTile("collision_new_2", 0,    1792, 0.5);
processCollisionTile("collision_new_3", 2048, 1792, 0.5);

/**
 * Reads red pixels from the given collision tile,
 * then adds *merged* collision blocks at half-size.
 */
function processCollisionTile(spriteName, offsetX, offsetY, scaleFactor = 1) {
    console.log(`Processing collision tile: ${spriteName}`);

    const img = new Image();
    img.onload = handleImageLoad;
    img.onerror = function () {
        console.error(`❌ Failed to load image: ${this.src}`);
    };
    // The collision tile image path
    img.src = `./${spriteName}.jpg`;

    function handleImageLoad() {
        console.log(`✅ Image loaded successfully: ${this.src}`);

        // OFFSCREEN canvas (prevents direct rendering)
        const canvas = document.createElement("canvas");
        canvas.style.display = "none"; // Keep hidden
        const ctx = canvas.getContext("2d");
        canvas.width = this.width;
        canvas.height = this.height;

        // Draw the collision image into the offscreen canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(this, 0, 0);

        // Extract pixel data
        const imageData = ctx.getImageData(0, 0, this.width, this.height);
        const data = imageData.data;

        // Sampling parameters
        const blockSize = 16;
        const threshold = 0.4;
        const tileWorldSize = 16;

        const blocksWide = Math.ceil(this.width  / blockSize);
        const blocksHigh = Math.ceil(this.height / blockSize);

        // 2D array for collision (true = collision)
        const collisionGrid = Array.from({ length: blocksHigh }, () =>
            new Array(blocksWide).fill(false)
        );

        // 1) Mark blocks that are mostly red
        for (let by = 0; by < blocksHigh; by++) {
            for (let bx = 0; bx < blocksWide; bx++) {
                const startX = bx * blockSize;
                const startY = by * blockSize;

                let redCount = 0;
                let pixelCount = 0;

                for (let y = startY; y < startY + blockSize && y < this.height; y++) {
                    for (let x = startX; x < startX + blockSize && x < this.width; x++) {
                        const idx = (y * this.width + x) * 4;
                        const r = data[idx];
                        const g = data[idx + 1];
                        const b = data[idx + 2];
                        pixelCount++;
                        // "Red" pixel check
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

        // 2) Merge collision blocks horizontally by row
        const rowRectangles = [];
        for (let y = 0; y < blocksHigh; y++) {
            const rowRects = [];
            let startXBlock = -1;

            for (let x = 0; x < blocksWide; x++) {
                const isSolid = collisionGrid[y][x];
                if (isSolid && startXBlock === -1) {
                    startXBlock = x; // start new rect
                }
                if ((!isSolid || x === blocksWide - 1) && startXBlock !== -1) {
                    const endXBlock = (isSolid && x === blocksWide - 1) ? x : x - 1;
                    rowRects.push({ startXBlock, endXBlock });
                    startXBlock = -1;
                }
            }
            rowRectangles.push(rowRects);
        }

        // 3) Merge rows vertically
        const mergedRects = [];
        const ongoingMerges = [];

        for (let y = 0; y < blocksHigh; y++) {
            const currentRowRects = rowRectangles[y];
            const newOngoing = [];

            currentRowRects.forEach((currRect) => {
                let merged = false;
                for (let om of ongoingMerges) {
                    if (
                        om.startXBlock === currRect.startXBlock &&
                        om.endXBlock   === currRect.endXBlock &&
                        om.endYBlock   === y - 1
                    ) {
                        // extend the vertical merge
                        om.endYBlock = y;
                        merged = true;
                        break;
                    }
                }
                if (!merged) {
                    newOngoing.push({
                        startXBlock: currRect.startXBlock,
                        endXBlock:   currRect.endXBlock,
                        startYBlock: y,
                        endYBlock:   y,
                    });
                }
            });

            // finalize merges that didn’t extend
            const stillOngoing = [];
            for (let om of ongoingMerges) {
                if (om.endYBlock === y - 1) {
                    finalizeBlock(om);
                } else {
                    stillOngoing.push(om);
                }
            }

            ongoingMerges.length = 0;
            ongoingMerges.push(...stillOngoing, ...newOngoing);
        }

        // finalize any remaining
        for (let om of ongoingMerges) {
            finalizeBlock(om);
        }

        function finalizeBlock(om) {
            const { startXBlock, endXBlock, startYBlock, endYBlock } = om;
            const blockWidth  = (endXBlock - startXBlock + 1);
            const blockHeight = (endYBlock - startYBlock + 1);

            const worldX = (offsetX + startXBlock * tileWorldSize) * scaleFactor;
            const worldY = (offsetY + startYBlock * tileWorldSize) * scaleFactor;
            const worldW = (blockWidth  * tileWorldSize) * scaleFactor;
            const worldH = (blockHeight * tileWorldSize) * scaleFactor;

            mergedRects.push({ x: worldX, y: worldY, w: worldW, h: worldH });
        }

        // 4) Add each merged rectangle as a `wall`
        let totalWalls = 0;
        mergedRects.forEach((rectInfo) => {
            add([
                rect(rectInfo.w, rectInfo.h),
                pos(rectInfo.x, rectInfo.y),
                area(),
                body({ isStatic: true }),
                opacity(0), // set to 1 (or remove) if you want to see them
                "wall",
            ]);
            totalWalls++;
        });

        console.log(
            `🚧 Collision tile "${spriteName}" done! Placed ${totalWalls} merged walls.`
        );
    }
}
