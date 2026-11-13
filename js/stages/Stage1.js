import { Stage } from "../stage/Stage.js";
import { Item } from "../item/Item.js";
import { LetterItem } from "../letter/LetterItem.js";

export class John_3_16 extends Stage {
  setDimensions() {
    this.width = 600;
    this.height = 400;
  }

  setBackgroundColor() {
    this.backgroundColor = "#ffa";
  }

  setQuote() {
    this.quote = `“To be, or not to be, t[hat] is the [quest]ion”`;

    this.citation = "*[Ham]let* (Act III, Scene I)";
  }

  load() {
    this.table = new Item(this)
      .addPart("rectangle", "#562e0c", 0, 0, 300, 20)
      .addPart("rectangle", "#562e0c", -120, 50, 20, 100)
      .addPart("rectangle", "#562e0c", 120, 50, 20, 100)
      .addProperty("restitution", 0.8)
      .build(175, 300);

    this.hat = new Item(this)
      .addPart("circle", "blue", 100, 100, 30)
      .addOverlay("fillRect", "green", 100, 100, 20, 20)
      .addProperty("restitution", 0.8)
      .build();

    const particleRadius = 5;
    const grid = Matter.Composites.stack(150, -100, 10, 10, 2, 2, (x, y) => {
      return Matter.Bodies.circle(x, y, particleRadius, {
        friction: 0.00001,
        collisionFilter: { group: -1 },
      });
    });

    // 2. Pin the top row in place (make them static)
    grid.bodies.forEach((body, idx) => {
      if (idx < 10 || idx > 90 || idx % 10 == 0 || idx % 10 == 9) {
        body.isStatic = true;
      }
    });

    // 3. Connect the grid bodies into a mesh with cross braces
    Matter.Composites.mesh(grid, 10, 10, true, {
      stiffness: 0.05,
      render: {
        type: "line",
        strokeStyle: "#000000",
      },
    });

    this.add(grid);
  }

  defineBlanks() {
    this.blanks = [
      {
        answer: this.hat,
        resolve(blank) {
          blank.outerHTML = blank.innerHTML;
        },
      },
      {
        // FIXME: need to fill in everything below
        answer: null,
        resolve(blank) {
          blank.outerHTML = blank.innerHTML;
        },
      },
      {
        answer: null,
        resolve(blank) {
          blank.outerHTML = blank.innerHTML;
        },
      },
      {
        answer: null,
        resolve(blank) {
          blank.outerHTML = blank.innerHTML;
        },
      },
    ];
  }

  beforeRender(ctx) {
    ctx.fillStyle = "#f002";
    ctx.fillRect(0, 0, this.width, this.height);
  }

  afterRender(ctx) {
    const span = document.querySelectorAll("#quote .blank")[2];
    const rect = this.convertToStage(span.getBoundingClientRect());

    ctx.fillStyle = "#f009";
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  }
}
