uniform sampler2D u_paths;
uniform sampler2D u_noise;
uniform float u_noise_radius;
uniform float u_noise_speed;
uniform float u_time;

attribute float textureRank;
attribute float offset;
attribute float id;

#define M_PI 3.1415926535897932384626433832795
#define EACH 0.001953125 // 1/512

varying vec3 color;

void main() {

  float x = (sin(u_time + offset) + 1.)/2.;
  float modX = mod(x, EACH);

  vec3 from = texture2D(u_paths, vec2(x - modX, id)).xyz;
  vec3 to = texture2D(u_paths, vec2(x - modX + EACH, id)).xyz;
  vec3 normal = normalize(to - from);

  color = (normal + 1.)/2.; 

  vec3 newPosition = from + (to - from)*min(modX/EACH, 1.);

  vec3 noise = texture2D(u_noise, newPosition.xy*0.9 + offset*0.1).xyz;


  newPosition *= 2000.; 
  newPosition += position;
  newPosition += noise*u_noise_radius - u_noise_radius/2.;

  gl_PointSize = 3.;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition , 1.0);
}