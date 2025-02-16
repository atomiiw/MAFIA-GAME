export function updateNPCDirection(npc, playerPos) {
    const dx = playerPos.x - npc.pos.x;
    const dy = playerPos.y - npc.pos.y;

    npc.currentDir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
    npc.play(`idle-${npc.currentDir}`);
}
