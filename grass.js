function Grass(option, texture){
  var geometry = new THREE.BufferGeometry()
  vertices = []
  var N=100
  for(var ix=0;ix<N;ix++)for(var iy=0;iy<N;iy++){
    var x=2*(ix+4*Math.random()-2.5)/N-1
    var y=2*(iy+4*Math.random()-2.5)/N-1
    vertices.push(x,y,-1)
    vertices.push(x,y,0)
    vertices.push(x,y,1)
  }
  geometry.addAttribute('position',new THREE.BufferAttribute(new Float32Array(vertices), 3))
  var material = Grass.shader()
  var mesh = new THREE.Mesh(geometry, material);
  this.mesh = mesh;
  this.material = material
  this.update = function(wave){
    mesh.material.uniforms.wave.value = wave
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
    transparent: false,
    depthTest: true
  });
  /*VERT
  uniform float t;
  uniform sampler2D wave;
  varying vec2 xycoord;
  varying float grassz;
  void main(){
    vec2 xy = position.xy;
    xycoord=xy;
    float l = position.z;
    float a = 1.0-l*l;
    grassz=a;
    vec4 texcol = texture2D(wave, xy*0.5+vec2(0.5,0.5));
    vec2 d = -(texcol.xy-vec2(0.5,0.5));
    d/=(2.0+16.0*dot(d,d));
    a*=0.5+2.0*texcol.a;
    l*=1.0+2.0*texcol.a;
    float z=sin(xy.x*2.7)+sin(xy.y*3.5)-cos(3.3*xy.x+2.9*xy.y)+cos(2.3*xy.x-3.1*xy.y);
    vec3 pos = vec3(
      xy.x + l*0.004+a*d.x+a*sin(xy.x*123.45)*0.01,
      xy.y + a*d.y+a*sin(xy.y*456.45)*0.01,
      0.15*a+z*0.1
    );
    gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1);
  }
  */
  /*FRAG
  varying vec2 xycoord;
  uniform sampler2D texture;
  varying float grassz;
  void main(){
    gl_FragColor = vec4(1,1,1,1);
    gl_FragColor.rb = 0.6+0.2*sin(xycoord);
    gl_FragColor.rgb *= 0.5+0.7*grassz;
  }
  */
}
