#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

uniform vec2 u_zoomCenter;
uniform float u_zoomSize;
uniform int u_maxIterations;

// we need to declare an output for the fragment shader
out vec4 outColor;

vec2 f(vec2 x, vec2 c) {
  return mat2(x, -x.y, x.x) * x + c;
}
vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.28318f * (c * t + d));
}
void main() {
  vec2 uv = gl_FragCoord.xy / vec2(800.0f, 800.0f);
  vec2 c = u_zoomCenter + (uv * 4.0f - vec2(2.0f)) * (u_zoomSize / 4.0f);
  vec2 x = vec2(0.0f);
  bool escaped = false;
  int iterations = 0;
  for(int i = 0; i < 10000; i++) {
    if(i > u_maxIterations)
      break;
    iterations = i;
    x = f(x, c);
    if(length(x) > 2.0f) {
      escaped = true;
      break;
    }
  }
  outColor = escaped ? vec4(palette(float(iterations) / float(u_maxIterations), vec3(0.0f), vec3(0.59f, 0.55f, 0.75f), vec3(0.1f, 0.2f, 0.3f), vec3(0.75f)), 1.0f) : vec4(vec3(0.85f, 0.99f, 1.0f), 1.0f);
}