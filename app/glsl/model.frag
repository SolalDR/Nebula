uniform sampler2D u_flare;
uniform vec3 u_particle_color;
varying float size;


void main () {
  vec2 uv = vec2(gl_PointCoord.x, gl_PointCoord.y);
  vec4 color = texture2D(u_flare, uv);
  gl_FragColor = vec4(u_particle_color, color.x);
}