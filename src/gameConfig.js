import kaboom from "kaboom";

// Initialize Kaboom
kaboom({
    width: window.innerWidth,
    height: window.innerHeight,
    stretch: true,
    letterbox: false,
});

export const gameConfig = {
    speed: 100,
    zoom: 1,
    minX: 700,
    maxX: 1300,
    minY: 400,
    maxY: 1400,
};
