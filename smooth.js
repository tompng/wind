function TimeSmoother(size, renderer, option) {
  var camera = new THREE.Camera();
  var scene = new THREE.Scene();
  camera.position.z = 1;
  gl = renderer.getContext();
  var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2));
  scene.add(mesh);
  var smooth1A = createRenderTarget(size,size,option);
  var smooth1B = createRenderTarget(size,size,option);
  var smooth2A = createRenderTarget(size,size,option);
  var smooth2B = createRenderTarget(size,size,option);
  var smoothed = createRenderTarget(size,size,option);
  this.smoothed = smoothed
  function createRenderTarget(w,h,option){
    return new THREE.WebGLRenderTarget(w, h, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: option.format || THREE.RGBAFormat,
      type: option.type || THREE.UnsignedByteType,
      stencilBuffer: false,
      depthBuffer: false
    });
  }
  var smoothShader = TimeSmoother.smoothShader(size);
  var composeShader = TimeSmoother.composeShader(size);
  var scale = option.scale||1
  var p=Math.exp(-1/(scale*60))
  var initialized = false
  this.calc = function(texture){
    mesh.material = smoothShader
    smoothShader.uniforms.texture.value = texture
    smoothShader.uniforms.p.value = initialized ? p : 0
    smoothShader.uniforms.state.value = smooth1A
    smoothShader.uniforms.i.value = 1
    renderer.render(scene, camera, smooth1B)
    var tmp=smooth1A;smooth1A=smooth1B;smooth1B=tmp;
    smoothShader.uniforms.state.value = smooth2A
    smoothShader.uniforms.i.value = 2
    renderer.render(scene, camera, smooth2B)
    var tmp=smooth2A;smooth2A=smooth2B;smooth2B=tmp;
    mesh.material=composeShader
    composeShader.uniforms.smooth1.value=smooth1B
    composeShader.uniforms.smooth2.value=smooth2B
    renderer.render(scene, camera, smoothed)
    initialized = true
  }
}

TimeSmoother.smoothShader = function(size){
  return new THREE.ShaderMaterial({
    defines: {SIZE: size.toFixed(2)},
    uniforms: {p:{type:'f'},i:{type:'i'},state:{type:'t'},texture:{type:'t'}},
    vertexShader: WaveSimulator.vertexShaderCode,
    fragmentShader: WaveSimulator.shaderCode(arguments.callee, 'FRAG'),
    transparent: true,
    blending: THREE.NoBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.ZeroFactor
  });
  /*FRAG
  uniform float p;
  uniform sampler2D texture, state;
  uniform int i;
  void main(){
    vec2 coord = gl_FragCoord.xy/SIZE;
    float rand=12.34*sin(coord.x*123.4+coord.y*234.5+456.7*sin(coord.x*123.4+coord.y*1234.5));
    rand -= floor(rand);
    float a=pow(p,1.0+4.0*rand);
    if(i==2)a*=a;
    gl_FragColor=texture2D(state,coord)*a+(1.0-a)*texture2D(texture,coord);
  }
  */
}
TimeSmoother.composeShader = function(size,a,b){
  return new THREE.ShaderMaterial({
    defines: {SIZE: size.toFixed(2)},
    uniforms: {smooth1:{type:'t'},smooth2:{type:'t'}},
    vertexShader: WaveSimulator.vertexShaderCode,
    fragmentShader: WaveSimulator.shaderCode(arguments.callee, 'FRAG'),
    transparent: true,
    blending: THREE.NoBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.ZeroFactor
  });
  /*FRAG
  uniform sampler2D smooth1, smooth2;
  void main(){
    vec2 coord = gl_FragCoord.xy/SIZE;
    gl_FragColor=texture2D(smooth1,coord)*2.0-texture2D(smooth2,coord);
  }
  */
}
