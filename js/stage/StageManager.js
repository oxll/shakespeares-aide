export class StageManager {
  constructor(engine, render) {
    this.engine = engine;
    this.render = render;
    this.stage = null;
  }

  stageWidth() {
    return this.stage.width;
  }

  stageHeight() {
    return this.stage.height;
  }

  setStage(StageClass) {
    this.stage?.exit();
    this.stage = new StageClass(this.engine, this.render);

    this.stage.setDimensions();
    this.stage.resizeEnclosure();

    this.stage.setBackgroundColor();
    this.stage.applyBackgroundColor();

    this.stage.setQuote();
    this.stage.loadquote();

    this.stage.load();

    this.stage.defineBlanks();

    this.stage.enter();
  }
}
