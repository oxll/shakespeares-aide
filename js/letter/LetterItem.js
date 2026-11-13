import { Item } from "../item/Item.js";
import { letterVertices } from "./letterVertices.js";

export class LetterItem extends Item {
  constructor(stage, letter) {
    super(stage);

    this.letter = letter;
    this.body = this.bodyFrom(letterVertices[letter]);

    this.size = this.body.bounds.max.x - this.body.bounds.min.x;

    this.resize();

    const overlayOffsetX = this.body.bounds.min.x - this.body.position.x;
    this.overlayOffsetXRatio = overlayOffsetX / this.size;

    const overlayOffsetY = this.body.bounds.max.y - this.body.position.y;
    this.overlayOffsetYRatio = overlayOffsetY / this.size;
  }

  bodyFrom(vertices) {
    const parts = vertices.map((polygon) => {
      polygon = polygon.map(([x, y]) => ({ x, y }));

      const centre = Matter.Vertices.centre(polygon);
      return Matter.Bodies.fromVertices(centre.x, centre.y, [polygon]);
    });

    const body = Matter.Body.create({ parts });

    body.parts.forEach((part) => {
      part.render.fillStyle = "#000"; // set to "transparent"
    });

    return body;
  }

  renderOverlays(ctx) {
    ctx.save();

    ctx.translate(this.body.position.x, this.body.position.y);

    ctx.rotate(this.body.angle);

    ctx.translate(
      this.overlayOffsetXRatio * this.size,
      this.overlayOffsetYRatio * this.size,
    );

    const stageRatio = this.stage.width / this.stage.height;
    const windowRatio = window.innerWidth / window.innerHeight;

    let reverseScaleFactor;

    if (windowRatio < stageRatio) {
      reverseScaleFactor = this.stage.width / window.innerWidth;
    } else {
      reverseScaleFactor = this.stage.height / window.innerHeight;
    }

    //reverseScaleFactor *= 1.15;

    ctx.scale(reverseScaleFactor, reverseScaleFactor);

    //ctx.translate(-2, -1);

    const verse = document.getElementById("verse");
    const verseFontSize = window.getComputedStyle(verse).fontSize;

    ctx.font = `${verseFontSize} Libre Baskerville`;

    ctx.fillStyle = "#f008";
    ctx.fillText(this.letter, 0, 0);

    ctx.restore();
  }

  isMouseOver() {
    return super.isMouseOver();
    // more generous; mouse in bounds is fine
  }

  resize() {
    const verse = document.getElementById("verse");
    const verseFontSize = window.getComputedStyle(verse).fontSize;

    const ctx = this.stage.render.context;
    ctx.font = `${verseFontSize} Libre Baskerville`;

    let size = ctx.measureText(this.letter).width;
    size *= this.stage.fullWidth() / window.innerWidth;

    const scaleFactor = size / this.size;
    Matter.Body.scale(this.body, scaleFactor, scaleFactor);

    this.size = size;
  }
}
