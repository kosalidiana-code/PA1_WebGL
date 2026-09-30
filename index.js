main();

function main() {
  /*========== Create a WebGL Context ==========*/
  const canvas = document.querySelector("#c");
  const gl = canvas.getContext("webgl");

  if (!gl) {
    console.log("WebGL unavailable");
    return;
  }

  /*========== Define and Store the Geometry ==========*/

  // cube positions (36 vertices)
  const cube = [
    // front
    -0.75, -0.25, -0.5,
    -0.25, -0.25, -0.5,
    -0.25,  0.25, -0.5,

    -0.75, -0.25, -0.5,
    -0.25,  0.25, -0.5,
    -0.75,  0.25, -0.5,

    // back: offset (+0.15, -0.15)
    -0.60, -0.40, 0.5,
    -0.10, -0.40, 0.5,
    -0.10,  0.10, 0.5,

    -0.60, -0.40, 0.5,
    -0.10,  0.10, 0.5,
    -0.60,  0.10, 0.5,

    // top
    -0.75,  0.25, -0.5,
    -0.25,  0.25, -0.5,
    -0.10,  0.10,  0.5,

    -0.75,  0.25, -0.5,
    -0.10,  0.10,  0.5,
    -0.60,  0.10,  0.5,

    // bottom
    -0.75, -0.25, -0.5,
    -0.10, -0.40,  0.5,
    -0.25, -0.25, -0.5,

    -0.75, -0.25, -0.5,
    -0.60, -0.40,  0.5,
    -0.10, -0.40,  0.5,

    // left
    -0.75, -0.25, -0.5,
    -0.60, -0.40,  0.5,
    -0.60,  0.10,  0.5,

    -0.75, -0.25, -0.5,
    -0.60,  0.10,  0.5,
    -0.75,  0.25, -0.5,

    // right
    -0.25, -0.25, -0.5,
    -0.25,  0.25, -0.5,
    -0.10,  0.10,  0.5,

    -0.25, -0.25, -0.5,
    -0.10,  0.10,  0.5,
    -0.10, -0.40,  0.5
  ];

  // pentagonal prism
  const p = [
  [0.25,  0.25],
  [0.55,  0.25],
  [0.70,  0.00],
  [0.45, -0.25],
  [0.20,  0.00]
  ];

  const prism = [];

  // front
  prism.push(
    p[0][0], p[0][1], -0.5,
    p[1][0], p[1][1], -0.5,
    p[2][0], p[2][1], -0.5,

    p[0][0], p[0][1], -0.5,
    p[2][0], p[2][1], -0.5,
    p[3][0], p[3][1], -0.5,

    p[0][0], p[0][1], -0.5,
    p[3][0], p[3][1], -0.5,
    p[4][0], p[4][1], -0.5
  );

  // back: offset (+0.15, -0.15)
  prism.push(
    p[0][0] + 0.15, p[0][1] - 0.15, 0.5,
    p[2][0] + 0.15, p[2][1] - 0.15, 0.5,
    p[1][0] + 0.15, p[1][1] - 0.15, 0.5,

    p[0][0] + 0.15, p[0][1] - 0.15, 0.5,
    p[3][0] + 0.15, p[3][1] - 0.15, 0.5,
    p[2][0] + 0.15, p[2][1] - 0.15, 0.5,

    p[0][0] + 0.15, p[0][1] - 0.15, 0.5,
    p[4][0] + 0.15, p[4][1] - 0.15, 0.5,
    p[3][0] + 0.15, p[3][1] - 0.15, 0.5
  );

  // sides
  for (let i = 0; i < 5; i++) {
    const j = (i + 1) % 5;

    prism.push(
      p[i][0], p[i][1], -0.5,
      p[j][0], p[j][1], -0.5,
      p[j][0] + 0.15, p[j][1] - 0.15, 0.5,

      p[i][0], p[i][1], -0.5,
      p[j][0] + 0.15, p[j][1] - 0.15, 0.5,
      p[i][0] + 0.15, p[i][1] - 0.15, 0.5
    );
  }

  const positions = cube.concat(prism);

  // colours
  const cubeColors = [
    // front: gradient
    0,0,1,1,
    1,0,0,1,
    0,1,0,1,

    0,0,1,1,
    0,1,0,1,
    1,1,0,1,

    // back
    1,0,0,1,
    1,0,0,1,
    1,0,0,1,
    1,0,0,1,
    1,0,0,1,
    1,0,0,1,

    // top
    0,1,0,1,
    0,1,0,1,
    0,1,0,1,
    0,1,0,1,
    0,1,0,1,
    0,1,0,1,

    // bottom
    1,1,0,1,
    1,1,0,1,
    1,1,0,1,
    1,1,0,1,
    1,1,0,1,
    1,1,0,1,

    // left
    1,0,1,1,
    1,0,1,1,
    1,0,1,1,
    1,0,1,1,
    1,0,1,1,
    1,0,1,1,

    // right
    0,1,1,1,
    0,1,1,1,
    0,1,1,1,
    0,1,1,1,
    0,1,1,1,
    0,1,1,1
  ];

  const prismColors = [];

  // front: gradient
  prismColors.push(
    0,0,1,1,
    1,0,0,1,
    0,1,0,1,

    0,0,1,1,
    0,1,0,1,
    1,1,0,1,

    0,0,1,1,
    1,1,0,1,
    1,0,1,1
  );

  // back
  for (let i = 0; i < 9; i++) {
    prismColors.push(
      1,0,1,1
    );
  }

  // sides
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 6; j++) {
      prismColors.push(
        0.2 + i * 0.1,
        0.2,
        0.8,
        1
      );
    }
  }

  const colors = cubeColors.concat(prismColors);

  console.assert(
    colors.length === positions.length / 3 * 4
  );

  const buffers = initBuffers(gl, positions, colors);

  /*========== Shaders ==========*/
  const vsSource = `
    attribute vec4 aPosition;
    attribute vec4 aVertexColor;
    varying lowp vec4 vColor;

    void main() {
      gl_Position = aPosition;
      vColor = aVertexColor;
      gl_PointSize = 8.0;
    }
  `;

  const fsSource = `
    varying lowp vec4 vColor;

    void main() {
      gl_FragColor = vColor;
    }
  `;

  const program = createProgram(
    gl,
    createShader(gl, gl.VERTEX_SHADER, vsSource),
    createShader(gl, gl.FRAGMENT_SHADER, fsSource)
  );

  /*====== Connect the attributes with the vertex shader ======*/
  const posAttribLocation =
    gl.getAttribLocation(program, "aPosition");

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);

  gl.vertexAttribPointer(
    posAttribLocation,
    3,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.enableVertexAttribArray(posAttribLocation);

  const colorAttribLocation =
    gl.getAttribLocation(program, "aVertexColor");

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);

  gl.vertexAttribPointer(
    colorAttribLocation,
    4,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.enableVertexAttribArray(colorAttribLocation);

  /*========== Drawing ==========*/
  const state = {
    mode: gl.TRIANGLES,
    depth: true,
    cubeFirst: true
  };

  function render() {
    gl.clearColor(1, 1, 1, 1);

    gl.clear(
      gl.COLOR_BUFFER_BIT |
      gl.DEPTH_BUFFER_BIT
    );

    if (state.depth) {
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
    } else {
      gl.disable(gl.DEPTH_TEST);
    }

    const cubeCount = cube.length / 3;
    const prismCount = prism.length / 3;

    if (state.cubeFirst) {
      gl.drawArrays(
        state.mode,
        0,
        cubeCount
      );

      gl.drawArrays(
        state.mode,
        cubeCount,
        prismCount
      );
    } else {
      gl.drawArrays(
        state.mode,
        cubeCount,
        prismCount
      );

      gl.drawArrays(
        state.mode,
        0,
        cubeCount
      );
    }

    document.querySelector("#status").textContent =
      "Student ID: 241629" +
      " | Mode: " +
      (state.mode === gl.TRIANGLES ? "TRIANGLES" :
       state.mode === gl.LINE_LOOP ? "LINE_LOOP" :
       state.mode === gl.LINES ? "LINES" :
       state.mode === gl.LINE_STRIP ? "LINE_STRIP" :
       state.mode === gl.POINTS ? "POINTS" :
       "TRIANGLE_STRIP") +
      " | Depth: " +
      (state.depth ? "ON" : "OFF") +
      " | Order: " +
      (state.cubeFirst ? "Cube → Solid" : "Solid → Cube");
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "1") state.mode = gl.TRIANGLES;
    if (event.key === "2") state.mode = gl.LINE_LOOP;
    if (event.key === "3") state.mode = gl.LINES;
    if (event.key === "4") state.mode = gl.LINE_STRIP;
    if (event.key === "5") state.mode = gl.POINTS;
    if (event.key === "6") state.mode = gl.TRIANGLE_STRIP;

    if (event.key.toLowerCase() === "d") {
      state.depth = !state.depth;
    }

    if (event.key.toLowerCase() === "s") {
      state.cubeFirst = !state.cubeFirst;
    }

    render();
  });

  render();
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log(gl.getProgramInfoLog(program));
    return null;
  }

  gl.useProgram(program);

  return program;
}

function initBuffers(gl, positions, colors) {
  const positionBuffer = gl.createBuffer();

  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    positionBuffer
  );

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(positions),
    gl.STATIC_DRAW
  );

  const colorBuffer = gl.createBuffer();

  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    colorBuffer
  );

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(colors),
    gl.STATIC_DRAW
  );

  return {
    position: positionBuffer,
    color: colorBuffer
  };
}

