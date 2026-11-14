export const LANE_WIDTH = 2.7;
export const GRAVITY = 22;
export const JUMP_SPEED = 9.6;

// Gameplay coordinates are independent of the visual rig.
export class PlayerController {
  constructor() { this.reset(); }

  reset() {
    this.lane = 0; this.x = 0; this.y = 0; this.velocityY = 0;
    this.slideTime = 0; this.slideBlend = 0;
  }

  move(direction) { this.lane = Math.max(-1, Math.min(1, this.lane + direction)); }

  jump() {
    if (this.y > .01 || this.velocityY !== 0) return false;
    this.slideTime = 0;
    this.velocityY = JUMP_SPEED;
    return true;
  }

  slide() {
    if (this.y > .01 || this.velocityY !== 0) return false;
    this.slideTime = .85;
    return true;
  }

  update(dt) {
    this.x += (this.lane * LANE_WIDTH - this.x) * (1 - Math.exp(-dt * 19));
    if (this.y > 0 || this.velocityY > 0) {
      this.y = Math.max(0, this.y + this.velocityY * dt - .5 * GRAVITY * dt * dt);
      this.velocityY -= GRAVITY * dt;
      if (this.y === 0) this.velocityY = 0;
    }
    this.slideTime = Math.max(0, this.slideTime - dt);
    this.slideBlend += ((this.slideTime > 0 ? 1 : 0) - this.slideBlend) * (1 - Math.exp(-dt * 28));
  }

  get height() { return 2.65 - this.slideBlend * 1.85; }
}
