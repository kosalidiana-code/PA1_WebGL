const vsSource = `
  attribute vec3 aPosition;
  attribute vec4 aColor;
  varying vec4 vColor;
  void main() {
    gl_Position = vec4(aPosition, 1.0);
    gl_PointSize = 6.0;
    vColor = aColor;
  }
`;

const fsSource = `
  precision mediump float;
  varying vec4 vColor;
  void main() {
    gl_FragColor = vColor;
  }
`;

let gl;
let program;
let positionBuffer, colorBuffer;
let totalVertices = 0;

let currentDrawMode = null; 
let depthTestEnabled = true;
let drawCubeFirst = true;

let vertices = [];
let colors = [];

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error('Shader compile error: ' + info);
  }
  return shader;
}

function initProgram(gl, vsSource, fsSource) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const prog = gl.createProgram();
  gl.attachShader(prog, vertexShader);
  gl.attachShader(prog, fragmentShader);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(prog);
    gl.deleteProgram(prog);
    throw new Error('Program link error: ' + info);
  }
  return prog;
}

function addTriangle(vertsArr, colsArr, p1, p2, p3, c1, c2 = c1, c3 = c1) {
  vertsArr.push(...p1, ...p2, ...p3);
  colsArr.push(...c1, ...c2, ...c3);
}

function addQuad(vertsArr, colsArr, p1, p2, p3, p4, c1, c2 = c1, c3 = c1, c4 = c1) {
  addTriangle(vertsArr, colsArr, p1, p2, p3, c1, c2, c3);
  addTriangle(vertsArr, colsArr, p1, p3, p4, c1, c3, c4);
}

function buildCubeGeometry() {
  const verts = [];
  const cols = [];


  const dx = 0.15, dy = -0.15; 
  const cx = -0.5, cy = 0.0, r = 0.25;

  const A = [cx - r, cy - r, 0.0];
  const B = [cx + r, cy - r, 0.0];
  const C = [cx + r, cy + r, 0.0];
  const D = [cx - r, cy + r, 0.0];

  const A_b = [A[0] + dx, A[1] + dy, 0.5];
  const B_b = [B[0] + dx, B[1] + dy, 0.5];
  const C_b = [C[0] + dx, C[1] + dy, 0.5];
  const D_b = [D[0] + dx, D[1] + dy, 0.5];

  const cFront1 = [1.0, 0.2, 0.2, 1.0];
  const cFront2 = [1.0, 0.8, 0.2, 1.0];
  const cFront3 = [0.8, 0.0, 0.4, 1.0];
  const cFront4 = [1.0, 0.5, 0.0, 1.0];

  const cBack   = [0.2, 0.8, 0.2, 1.0];
  const cTop    = [0.2, 0.2, 1.0, 1.0];
  const cBottom = [0.9, 0.9, 0.1, 1.0];
  const cLeft   = [0.8, 0.2, 0.8, 1.0];
  const cRight  = [0.1, 0.8, 0.8, 1.0];

  addQuad(verts, cols, A, B, C, D, cFront1, cFront2, cFront3, cFront4);
  addQuad(verts, cols, B_b, A_b, D_b, C_b, cBack);
  addQuad(verts, cols, D, C, C_b, D_b, cTop);
  addQuad(verts, cols, A_b, B_b, B, A, cBottom);
  addQuad(verts, cols, A_b, A, D, D_b, cLeft);
  addQuad(verts, cols, B, B_b, C_b, C, cRight);

  return { verts, cols };
}

function buildPrismGeometry() {
  const verts = [];
  const cols = [];

  const dx = 0.15, dy = -0.15;
  const cx = 0.45, cy = 0.05, r = 0.28;

  const frontPts = [];
  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
    frontPts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle), 0.0]);
  }

  const backPts = frontPts.map(p => [p[0] + dx, p[1] + dy, 0.5]);

  const cFront = [cx, cy, 0.0];

  const frontGradCols = [
    [1.0, 0.0, 0.0, 1.0],
    [1.0, 1.0, 0.0, 1.0],
    [0.0, 1.0, 0.0, 1.0],
    [0.0, 1.0, 1.0, 1.0],
    [0.0, 0.0, 1.0, 1.0]
  ];
  const cCenterFront = [1.0, 1.0, 1.0, 1.0];

  const cBackFace = [0.5, 0.5, 0.5, 1.0];
  const sideColors = [
    [0.9, 0.2, 0.2, 1.0],
    [0.2, 0.9, 0.2, 1.0],
    [0.2, 0.2, 0.9, 1.0],
    [0.9, 0.9, 0.2, 1.0],
    [0.9, 0.2, 0.9, 1.0]
  ];

  for (let i = 0; i < 5; i++) {
    const next = (i + 1) % 5;
    addTriangle(
      verts, cols,
      cCenterFront, frontPts[i], frontPts[next],
      cCenterFront, frontGradCols[i], frontGradCols[next]
    );
  }

  for (let i = 0; i < 5; i++) {
    const next = (i + 1) % 5;
    addTriangle(
      verts, cols,
      cBackFace, backPts[next], backPts[i],
      cBackFace, cBackFace, cBackFace
    );
  }

  for (let i = 0; i < 5; i++) {
    const next = (i + 1) % 5;
    addQuad(
      verts, cols,
      frontPts[i], frontPts[next], backPts[next], backPts[i],
      sideColors[i]
    );
  }

  return { verts, cols };
}

function initBuffers() {
  const cube = buildCubeGeometry();
  const prism = buildPrismGeometry();

  let combinedVerts = [];
  let combinedCols = [];

  if (drawCubeFirst) {
    combinedVerts = [...cube.verts, ...prism.verts];
    combinedCols = [...cube.cols, ...prism.cols];
  } else {
    combinedVerts = [...prism.verts, ...cube.verts];
    combinedCols = [...prism.cols, ...cube.cols];
  }

  vertices = new Float32Array(combinedVerts);
  colors = new Float32Array(combinedCols);

  totalVertices = vertices.length / 3;

  console.assert(vertices.length % 3 === 0, "Vertex buffer size must be multiple of 3");
  console.assert(colors.length % 4 === 0, "Color buffer size must be multiple of 4");
  console.assert((vertices.length / 3) === (colors.length / 4), "Number of vertices and colors must match");

  positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const aPosition = gl.getAttribLocation(program, 'aPosition');
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosition);

  colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

  const aColor = gl.getAttribLocation(program, 'aColor');
  gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aColor);
}

function updateStatusUI() {
  const modeNames = {
    [gl.TRIANGLES]: 'TRIANGLES (1)',
    [gl.TRIANGLE_STRIP]: 'TRIANGLE_STRIP (2)',
    [gl.TRIANGLE_FAN]: 'TRIANGLE_FAN (3)',
    [gl.LINES]: 'LINES (4)',
    [gl.LINE_STRIP]: 'LINE_STRIP (5)',
    [gl.POINTS]: 'POINTS (6)'
  };

  const statusDiv = document.getElementById('status');
  statusDiv.innerHTML = `Mode: **${modeNames[currentDrawMode]}** | ` +
                        `Depth Test: **${depthTestEnabled ? 'ENABLED' : 'DISABLED'}** | ` +
                        `Draw Order: **${drawCubeFirst ? 'CUBE FIRST' : 'PRISM FIRST'}**`;
}

function render() {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.05, 0.05, 0.05, 1.0);
  gl.clearDepth(1.0);

  if (depthTestEnabled) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  } else {
    gl.disable(gl.DEPTH_TEST);
  }

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(program);
  gl.drawArrays(currentDrawMode, 0, totalVertices);
}

function setupEvents() {
  window.addEventListener('keydown', (e) => {
    const key = e.key.toUpperCase();

    if (key === '1') currentDrawMode = gl.TRIANGLES;
    else if (key === '2') currentDrawMode = gl.TRIANGLE_STRIP;
    else if (key === '3') currentDrawMode = gl.TRIANGLE_FAN;
    else if (key === '4') currentDrawMode = gl.LINES;
    else if (key === '5') currentDrawMode = gl.LINE_STRIP;
    else if (key === '6') currentDrawMode = gl.POINTS;
    else if (key === 'D') depthTestEnabled = !depthTestEnabled;
    else if (key === 'S') {
      drawCubeFirst = !drawCubeFirst;
      initBuffers();
    }

    updateStatusUI();
    render();
  });
}

function main() {
  const canvas = document.getElementById('glcanvas');
  gl = canvas.getContext('webgl');

  if (!gl) {
    alert('WebGL not supported!');
    return;
  }

  program = initProgram(gl, vsSource, fsSource);
  currentDrawMode = gl.TRIANGLES;

  initBuffers();
  setupEvents();
  updateStatusUI();
  render();
}

window.onload = main;