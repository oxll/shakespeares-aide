export const letterVertices = {
  a: verticesFrom("a"),
  c: verticesFrom("c"),
  x: verticesFrom("x"),
};

function verticesFrom(pathId) {
  const path = document.getElementById(pathId);
  let pathVertices = Matter.Svg.pathToVertices(path);

  const polygon = pathVertices.map(({ x, y }) => [x, y]);

  console.log("no holes/crossovers?:", decomp.isSimple(polygon));

  decomp.makeCCW(polygon);

  let vertices = decomp.quickDecomp(polygon);

  console.log(JSON.stringify(vertices));

  return vertices;
}
