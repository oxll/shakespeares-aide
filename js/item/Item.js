import { mouse } from "../core/main.js";

export class Item {
  constructor(stage) {
    this.stage = stage;
    this.body = Matter.Body.create();
    this.parts = [];
    this.overlayData = [];
    this.initialPosition = null;
    this.defaultRestitution = null;
    this.collisions = new Set();
    this.anchorOffset = null;
  }

  clearParts() {
    Matter.Body.setParts(this.body, []);
    this.parts = [];
  }

  addPart(shape, color, ...dimensions) {
    if (typeof shape !== "string") {
      if (color) {
        shape.render.fillStyle = color;
        shape.render.strokeStyle = color;
        shape.render.lineWidth = 1;
      }

      this.parts.push(shape);
      return this;
    }

    if (shape === "rect") shape = "rectangle";

    const part = Matter.Bodies[shape](...dimensions);

    if (color) {
      part.render.fillStyle = color;
      part.render.strokeStyle = color;
      part.render.lineWidth = 1;
    } else {
      part.render.visible = false;
    }

    this.parts.push(part);
    return this;
  }

  addOverlay(overlay, color, ...dimensions) {
    this.overlayData.push({ overlay, color, dimensions });
    return this;
  }

  addProperty(name, value) {
    this.body[name] = value;
    return this;
  }

  build(x, y) {
    if (!this.stage.items.includes(this)) {
      this.stage.items.push(this);
    }

    if (this.parts.length) {
      Matter.Body.setParts(this.body, this.parts);
    }

    if (!this.stage.bodies().includes(this)) {
      this.stage.add(this.body);
    }

    if (typeof x === "number" && typeof y === "number") {
      Matter.Body.setPosition(this.body, { x, y });
    }

    this.initialPosition = { ...this.body.position };
    this.defaultRestitution = this.body.restitution;

    return this;
  }

  anchorTo(x, y) {
    const dx = x - this.body.position.x;
    const dy = y - this.body.position.y;

    this.anchorOffset = {
      r: Math.sqrt(dx * dx + dy * dy),
      theta: Math.atan2(dy, dx) - this.body.angle,
    };
  }

  anchor() {
    if (!this.anchorOffset) return null;

    const theta = this.body.angle + this.anchorOffset.theta;

    return {
      x: this.body.position.x + Math.cos(theta) * this.anchorOffset.r,
      y: this.body.position.y + Math.sin(theta) * this.anchorOffset.r,
    };
  }

  unanchor() {
    this.anchorOffset = null;
  }

  containsPoint(point) {
    return Matter.Query.point(this.body.parts, point).length > 0;
  }

  isMouseOver() {
    return this.containsPoint(mouse);
  }

  renderOverlays(ctx) {
    ctx.save();

    ctx.translate(this.body.position.x, this.body.position.y);

    ctx.rotate(this.body.angle);

    ctx.translate(-this.initialPosition.x, -this.initialPosition.y);

    this.overlayData.forEach((data) => {
      ctx.strokeStyle = data.color;
      ctx.fillStyle = data.color;
      ctx[data.overlay](...data.dimensions);
    });

    ctx.restore();
  }
}
