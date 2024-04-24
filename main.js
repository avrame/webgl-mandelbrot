import './style.css'

const vertexShaderURL = '/shaders/basic.vert'
const fragmentShaderURL = '/shaders/basic.frag'

const shadersResponses = await Promise.all([fetch(vertexShaderURL), fetch(fragmentShaderURL)])
const [vertexShaderSource, fragmentShaderSource] = await Promise.all(shadersResponses.map(sr => sr.text()))

function createShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) {
    return shader
  }

  console.log(gl.getShaderInfoLog(shader))  // eslint-disable-line
  gl.deleteShader(shader)
  return undefined
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  const success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (success) {
    return program
  }

  console.log(gl.getProgramInfoLog(program))  // eslint-disable-line
  gl.deleteProgram(program)
  return undefined
}

function main() {
  // Get A WebGL context
  const canvas = document.querySelector("#canvas");
  const gl = canvas.getContext("webgl2");
  if (!gl) {
    return
  }

  // create GLSL shaders, upload the GLSL source, compile the shaders
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

  // Link the two shaders into a program
  const program = createProgram(gl, vertexShader, fragmentShader)

  // look up where the vertex data needs to go.
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position")

  // Create a buffer and put three 2d clip space points in it
  const positionBuffer = gl.createBuffer()

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  var positions = [
    0, 0,
    0, 0.5,
    0.7, 0,
  ]
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

  // Create a vertex array object (attribute state)
  const vao = gl.createVertexArray()

  // and make it the one we're currently working with
  gl.bindVertexArray(vao)

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation)

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  const size = 2          // 2 components per iteration
  const type = gl.FLOAT   // the data is 32bit floats
  const normalize = false // don't normalize the data
  const stride = 0        // 0 = move forward size * sizeof(type) each iteration to get the next position
  const offset_1 = 0      // start at the beginning of the buffer
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset_1)

  webglUtils.resizeCanvasToDisplaySize(gl.canvas)

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program)

  // Bind the attribute/buffer set we want.
  gl.bindVertexArray(vao)

  // draw
  const primitiveType = gl.TRIANGLES
  const offset_2 = 0
  const count = 3
  gl.drawArrays(primitiveType, offset_2, count);
}

main()

