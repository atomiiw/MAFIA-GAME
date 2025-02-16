// Add each map piece, matching the original 4096×3584 layout
const mapTL = add([
    sprite("map_tl"),
    scale(0.5),
    pos(0, 0),
    z(-10),
    anchor("topleft"),
]);

const mapTR = add([
    sprite("map_tr"),
    scale(0.5),
    pos(1024, 0), // half of 2048 → 1024
    z(-10),
    anchor("topleft"),
]);

const mapBL = add([
    sprite("map_bl"),
    scale(0.5),
    pos(0, 896), // half of 1792 → 896
    z(-10),
    anchor("topleft"),
]);

const mapBR = add([
    sprite("map_br"),
    scale(0.5),
    pos(1024, 896), // half of (2048, 1792) → (1024, 896)
    z(-10),
    anchor("topleft"),
]);
