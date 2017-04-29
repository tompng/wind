function Grass(option, texture){
  var geometry = new THREE.BufferGeometry()
  vertices = []
  var N=64
  for(var ix=0;ix<N;ix++)for(var iy=0;iy<N;iy++){
    var x=2*(ix+Math.random())/N-1
    var y=2*(iy+Math.random())/N-1
    vertices.push(x,y,-1)
    vertices.push(x,y,0)
    vertices.push(x,y,1)
  }
  geometry.addAttribute('position',new THREE.BufferAttribute(new Float32Array(vertices), 3))
  var material = Grass.shader()
  var mesh = new THREE.Mesh(geometry, material);
  this.mesh = mesh;
  this.material = material
  this.update = function(dt, option){
    mesh.material.uniforms.t.value = performance.now()/1000
    mesh.material.uniforms.wave.value = this.material.wave
  }
}

Grass.shader = function(texture){
  var uniforms = {t: {type: 'f'}, wave: {type: "t"}};
  if(texture)uniforms.texture = {type: 't', value: texture};
  return new THREE.ShaderMaterial({
    defines: {TEXTURE: !!texture},
    uniforms: uniforms,
    vertexShader: WaveSimulator.shaderCode(arguments.callee, 'VERT'),
    fragmentShader: WaveSimulator.shaderCode(arguments.callee, 'FRAG'),
    side: THREE.DoubleSide,
    transparent: true,
    depthTest: false,
    blending: THREE.AdditiveBlending
  });
  /*VERT
  uniform float t;
  uniform sampler2D wave;
  varying vec2 xycoord;
  varying vec3 gpos, norm;
  void main(){
    vec2 xy = position.xy;
    xycoord=xy;
    float l = position.z;
    float a = 1.0-l*l;
    vec2 d = -0.4*(texture2D(wave, xy*0.5+vec2(0.5,0.5)).xy-vec2(0.5,0.5));
    vec3 pos = vec3(xy.x + l*0.005+a*d.x+a*sin(xy.x*123.45)*0.01, xy.y+0.01*a+a*d.y, 0.1*a);
    gl_Position=projectionMatrix*vec4(pos,1);
  }
  */
  /*FRAG
  varying vec2 xycoord;
  varying vec3 gpos, norm;
  uniform vec3 color;
  uniform sampler2D texture;
  void main(){
    gl_FragColor = vec4(1,1,1,1);
    gl_FragColor.rb = 0.8+0.2*sin(xycoord);
  }
  */
}
