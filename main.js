/* locate the canvas element */
const canvas_element = document.getElementById("maincanvas");

/* obtain a webgl rendering context */
const gl = canvas_element.getContext("webgl");

/* get shader code from the <script> tags */
const vertex_shader_src = document.getElementById("shader-vs").text;
const fragment_shader_src = document.getElementById("shader-fs").text;

// Use our boilerplate utils to compile the shaders and link into a program
const mandelbrot_program = webglUtils.createProgramFromSources(gl, [
  vertex_shader_src,
  fragment_shader_src,
]);
// Tell it to use our program (pair of shaders)
gl.useProgram(mandelbrot_program);

/* create a vertex buffer for a full-screen triangle */
const vertex_buf = gl.createBuffer(gl.ARRAY_BUFFER);
gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buf);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([-1, -1, 3, -1, -1, 3]),
  gl.STATIC_DRAW
);

/* set up the position attribute */
const position_attrib_location = gl.getAttribLocation(
  mandelbrot_program,
  "a_Position"
);
gl.enableVertexAttribArray(position_attrib_location);
gl.vertexAttribPointer(position_attrib_location, 2, gl.FLOAT, false, 0, 0);

/* find uniform locations */
const zoom_center_uniform = gl.getUniformLocation(
  mandelbrot_program,
  "u_zoomCenter"
);
const zoom_size_uniform = gl.getUniformLocation(mandelbrot_program, "u_zoomSize");
const max_iterations_uniform = gl.getUniformLocation(
  mandelbrot_program,
  "u_maxIterations"
);

/* these hold the state of zoom operation */
const zoom_center = [0.0, 0.0];
let target_zoom_center = [0.0, 0.0];
let zoom_size = 4.0;
let stop_zooming = true;
let zoom_factor = 1.0;
const max_iterations = 500;

function renderFrame() {
  /* bind inputs & render frame */
  gl.uniform2f(zoom_center_uniform, zoom_center[0], zoom_center[1]);
  gl.uniform1f(zoom_size_uniform, zoom_size);
  gl.uniform1i(max_iterations_uniform, max_iterations);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  /* handle zoom */
  if (!stop_zooming) {
    /* zoom in */
    zoom_size *= zoom_factor;

    /* move zoom center towards target */
    zoom_center[0] += 0.1 * (target_zoom_center[0] - zoom_center[0]);
    zoom_center[1] += 0.1 * (target_zoom_center[1] - zoom_center[1]);

    window.requestAnimationFrame(renderFrame);
  } else if (max_iterations < 500) {
    window.requestAnimationFrame(renderFrame);
  }
}

/* input handling */
canvas_element.onmousedown = function (e) {
  const x_part = e.offsetX / canvas_element.width;
  const y_part = e.offsetY / canvas_element.height;
  target_zoom_center[0] = zoom_center[0] - zoom_size / 2.0 + x_part * zoom_size;
  target_zoom_center[1] = zoom_center[1] + zoom_size / 2.0 - y_part * zoom_size;
  stop_zooming = false;
  zoom_factor = e.buttons & 1 ? 0.99 : 1.01;
  renderFrame();
  return true;
};
canvas_element.oncontextmenu = function (e) {
  return false;
};
canvas_element.onmouseup = function (e) {
  stop_zooming = true;
};

/* display initial frame */
renderFrame();
