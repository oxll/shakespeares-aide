import { Item } from "../item/Item.js";
import { LetterItem } from "../letter/LetterItem.js";
import { mouse } from "../core/main.js";
import { map } from "../utils/utils.js";

export class Stage {
  constructor(engine, render) {
    this.engine = engine;
    this.render = render;

    this.composite = Matter.Composite.create();
    this.width = 400;
    this.height = 400;
    this.enclosure = new Item(this).addProperty("isStatic", true);
    this.backgroundColor = "#222";

    this.quote = "";
    this.citation = "";

    this.items = [];
    this.blanks = [];
    this.selectedItem = null;
  }

  setDimensions() {}

  fullArea() {
    let width, height;

    const stageRatio = this.width / this.height;
    const windowRatio = window.innerWidth / window.innerHeight;

    if (windowRatio < stageRatio) {
      width = this.width;
      height = this.width / windowRatio;
    } else {
      width = this.height * windowRatio;
      height = this.height;
    }

    return { width, height };
  }

  fullWidth() {
    return this.fullArea().width;
  }

  fullHeight() {
    return this.fullArea().height;
  }

  convertToStage(rect) {
    const stageRatio = this.width / this.height;
    const windowRatio = window.innerWidth / window.innerHeight;

    if (windowRatio < stageRatio) {
      const convertedHeight = this.width / windowRatio;

      const x = map(rect.left, 0, window.innerWidth, 0, this.width);

      const y = map(
        rect.top,
        0,
        window.innerHeight,
        this.height - convertedHeight,
        this.height,
      );

      const w = map(
        rect.right - rect.left,
        0,
        window.innerWidth,
        0,
        this.width,
      );

      const h = map(
        rect.bottom - rect.top,
        0,
        window.innerWidth,
        0,
        this.width,
      );

      return { x, y, w, h };
    } else {
      const convertedWidth = this.height * windowRatio;

      const x = map(
        rect.left,
        0,
        window.innerWidth,
        this.width / 2 - convertedWidth / 2,
        this.width / 2 + convertedWidth / 2,
      );

      const y = map(rect.top, 0, window.innerHeight, 0, this.height);

      const w = map(
        rect.right - rect.left,
        0,
        window.innerHeight,
        0,
        this.height,
      );

      const h = map(
        rect.bottom - rect.top,
        0,
        window.innerHeight,
        0,
        this.height,
      );

      return { x, y, w, h };
    }
  }

  setBackgroundColor() {}

  applyBackgroundColor() {
    document.body.style.backgroundColor = this.backgroundColor;
  }

  setQuote() {}

  formatText(text) {
    text = text.replace(/\[(.*?)\]/g, '<span class="blank">$1</span>');
    text = text.replace(/\*(.*?)\*/g, '<i>$1</i>');

    return text;
  }

  loadquote() {
    const quote = document.getElementById("quote");
    const citation = document.getElementById("citation");

    quote.innerHTML = this.formatText(this.quote);
    citation.innerHTML = this.formatText(this.citation);
  }

  bodies() {
    return Matter.Composite.allBodies(this.engine.world);
  }

  itemFromPart(part) {
    return this.items.find((item) => item.body === part.parent);
  }

  defineBlanks() {}

  load() {}

  enter() {
    Matter.Composite.add(this.engine.world, this.composite);
  }

  add(body) {
    Matter.Composite.add(this.composite, body);
  }

  remove(body) {
    Matter.Composite.remove(this.composite, body);
  }

  exit() {
    Matter.Composite.remove(this.engine.world, this.composite);
  }

  beforeUpdate() {
    if (!this.selectedItem) return;

    const dx = mouse.x - this.selectedItem.anchor().x;
    const dy = mouse.y - this.selectedItem.anchor().y;

    Matter.Body.setVelocity(this.selectedItem.body, { x: dx, y: dy });
  }

  afterUpdate() {
    if (!this.selectedItem) return;

    if (this.selectedItem.collisions.has(this.enclosure)) {
      Matter.Body.set(this.selectedItem.body, "restitution", 0);
    } else {
      Matter.Body.set(
        this.selectedItem.body,
        "restitution",
        this.selectedItem.defaultRestitution,
      );
    }

    if (!this.selectedItem.collisions.size) return;

    if (this.selectedItem.isMouseOver()) {
      this.selectedItem.anchorTo(mouse.x, mouse.y);
    } else {
      const delta = Matter.Vector.sub(mouse, this.selectedItem.anchor());
      const MAX_DIST = 15;

      if (Matter.Vector.magnitudeSquared(delta) > MAX_DIST * MAX_DIST) {
        this.unselectItem();
      }
    }
  }

  beforeRender(ctx) {}

  renderOverlays(ctx) {
    this.items.forEach((item) => {
      item.renderOverlays(ctx);
    });
  }

  afterRender(ctx) {}

  mousedown() {
    this.selectedItem = this.items.find((item) => {
      return item.isMouseOver();
    });

    this.selectedItem?.anchorTo(mouse.x, mouse.y);
  }

  mouseup() {
    this.checkBlanks();
    this.unselectItem();
  }

  unselectItem() {
    if (!this.selectedItem) return;

    Matter.Body.set(
      this.selectedItem.body,
      "restitution",
      this.selectedItem.defaultRestitution,
    );

    this.selectedItem.unanchor();
    this.selectedItem = null;
  }

  checkBlanks() {
    document.querySelectorAll(".blank").forEach((blank, index) => {
      if (!this.selectedItem) return;
      if (this.selectedItem !== this.blanks[index].answer) return;

      const rectBounds = this.convertToStage(blank.getBoundingClientRect());

      const rectangle = Matter.Bodies.rectangle(
        rectBounds.x + rectBounds.w / 2,
        rectBounds.y + rectBounds.h / 2,
        rectBounds.w,
        rectBounds.h,
      );

      if (!Matter.Collision.collides(this.selectedItem.body, rectangle)) return;

      this.remove(this.selectedItem.body);
      this.items = this.items.filter((item) => item !== this.selectedItem);

      this.blanks[index].resolve(blank);
    });
  }

  resizeEnclosure() {
    const windowRatio = window.innerWidth / window.innerHeight;
    const stageW = this.width;
    const stageH = this.height;
    const w = stageH * windowRatio;
    const h = stageW / windowRatio;
    const t = Math.max(stageW, stageH);

    this.enclosure.clearParts();

    if (windowRatio < stageW / stageH) {
      this.enclosure
        .addPart("rect", "", -t / 2, stageH - h / 2, t, h)
        .addPart("rect", "", stageW + t / 2, stageH - h / 2, t, h)
        .addPart("rect", "", stageW / 2, stageH - h - t / 2, stageW, t)
        .addPart("rect", "", stageW / 2, stageH + t / 2, stageW, t);
    } else {
      this.enclosure
        .addPart("rect", "", stageW / 2 - w / 2 - t / 2, stageH / 2, t, stageH)
        .addPart("rect", "", stageW / 2 + w / 2 + t / 2, stageH / 2, t, stageH)
        .addPart("rect", "", stageW / 2, -t / 2, w, t)
        .addPart("rect", "", stageW / 2, stageH + t / 2, w, t);
    }

    this.enclosure.build();
  }

  resizeLetterItems() {
    for (const item of this.items) {
      if (item instanceof LetterItem) item.resize();
    }
  }
}
