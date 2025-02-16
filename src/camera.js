import { isTalking, currentNPC } from "./dialogue_interface.js";

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

// 4) ZOOM (MOUSE WHEEL)
let zoom = 1;
window.addEventListener("wheel", (event) => {
    if (isTalking === true) return; 
    const zoomSpeed = 0.1;
    if (event.deltaY < 0) {
        zoom = Math.min(2.5, zoom + zoomSpeed);
    } else {
        zoom = Math.max(1, zoom - zoomSpeed);
    }
    camScale(vec2(zoom));
});