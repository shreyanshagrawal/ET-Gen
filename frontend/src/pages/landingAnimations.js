export function initLandingAnimations() {
  if (typeof window === "undefined" || !window.gsap) return;
/* ═══════════════════════════════════════════════════════
   TARGET CURSOR — GSAP-powered
═══════════════════════════════════════════════════════ */
(function(){
  const wrapper = document.getElementById('target-cursor-wrapper');
  const dot     = document.getElementById('target-cursor-dot');
  const corners = Array.from(document.querySelectorAll('.target-cursor-corner'));
  const TARGET  = '.cursor-target';
  const SPIN_DUR = 2;
  const HOVER_DUR = 0.2;
  const PARALLAX = true;
  const CORNER_SIZE = 12;
  const BORDER_W = 3;

  let spinTl = null;
  let activeTarget = null;
  let currentLeaveHandler = null;
  let resumeTimeout = null;
  let mouseRef = {x:0.5, y:0.5};
  let smoothMouse = {x:0.5, y:0.5};
  let targetCornerPositions = null;
  let isActive = false;
  let activeStrength = {current:0};
  let tickerAdded = false;

  gsap.set(wrapper, {xPercent:-50, yPercent:-50, x:window.innerWidth/2, y:window.innerHeight/2});

  /* Spin */
  function createSpin(){
    if(spinTl) spinTl.kill();
    spinTl = gsap.timeline({repeat:-1}).to(wrapper, {rotation:'+=360', duration:SPIN_DUR, ease:'none'});
  }
  createSpin();

  /* Mouse move */
  window.addEventListener('mousemove', e => {
    gsap.to(wrapper, {x:e.clientX, y:e.clientY, duration:0.1, ease:'power3.out'});
    mouseRef = {x: e.clientX/window.innerWidth, y: e.clientY/window.innerHeight};
  });

  /* Ticker for parallax corners */
  function tickerFn(){
    if(!targetCornerPositions || activeStrength.current===0) return;
    const strength = activeStrength.current;
    const wx = gsap.getProperty(wrapper,'x');
    const wy = gsap.getProperty(wrapper,'y');
    corners.forEach((corner,i) => {
      const cx = gsap.getProperty(corner,'x');
      const cy = gsap.getProperty(corner,'y');
      const tx = targetCornerPositions[i].x - wx;
      const ty = targetCornerPositions[i].y - wy;
      const fx = cx + (tx - cx) * strength;
      const fy = cy + (ty - cy) * strength;
      const dur = strength >= 0.99 ? (PARALLAX ? 0.2 : 0) : 0.05;
      gsap.to(corner, {x:fx, y:fy, duration:dur, ease: dur===0?'none':'power1.out', overwrite:'auto'});
    });
  }

  /* Mouse click effects */
  window.addEventListener('mousedown', () => {
    gsap.to(dot, {scale:0.7, duration:0.3});
    gsap.to(wrapper, {scale:0.9, duration:0.2});
  });
  window.addEventListener('mouseup', () => {
    gsap.to(dot, {scale:1, duration:0.3});
    gsap.to(wrapper, {scale:1, duration:0.2});
  });

  function cleanupTarget(target){
    if(currentLeaveHandler) target.removeEventListener('mouseleave', currentLeaveHandler);
    currentLeaveHandler = null;
  }

  /* Reset corners to default positions */
  function resetCorners(){
    const positions = [
      {x:-CORNER_SIZE*1.5, y:-CORNER_SIZE*1.5},
      {x:CORNER_SIZE*0.5,  y:-CORNER_SIZE*1.5},
      {x:CORNER_SIZE*0.5,  y:CORNER_SIZE*0.5},
      {x:-CORNER_SIZE*1.5, y:CORNER_SIZE*0.5}
    ];
    const tl = gsap.timeline();
    corners.forEach((corner,i) => {
      tl.to(corner, {x:positions[i].x, y:positions[i].y, duration:0.3, ease:'power3.out'}, 0);
    });
  }

  window.addEventListener('mouseover', e => {
    const target = e.target.closest(TARGET);
    if(!target) return;
    if(activeTarget === target) return;
    if(activeTarget) cleanupTarget(activeTarget);
    if(resumeTimeout){clearTimeout(resumeTimeout); resumeTimeout=null;}

    activeTarget = target;
    corners.forEach(c => gsap.killTweensOf(c));
    gsap.killTweensOf(wrapper,'rotation');
    spinTl?.pause();
    gsap.set(wrapper,{rotation:0});

    const rect = target.getBoundingClientRect();
    const wx = gsap.getProperty(wrapper,'x');
    const wy = gsap.getProperty(wrapper,'y');

    targetCornerPositions = [
      {x: rect.left - BORDER_W,              y: rect.top - BORDER_W},
      {x: rect.right + BORDER_W - CORNER_SIZE, y: rect.top - BORDER_W},
      {x: rect.right + BORDER_W - CORNER_SIZE, y: rect.bottom + BORDER_W - CORNER_SIZE},
      {x: rect.left - BORDER_W,              y: rect.bottom + BORDER_W - CORNER_SIZE}
    ];

    isActive = true;
    if(!tickerAdded){
      gsap.ticker.add(tickerFn);
      tickerAdded = true;
    }
    gsap.to(activeStrength, {current:1, duration:HOVER_DUR, ease:'power2.out'});

    corners.forEach((corner,i) => {
      gsap.to(corner, {
        x: targetCornerPositions[i].x - wx,
        y: targetCornerPositions[i].y - wy,
        duration:0.2, ease:'power2.out'
      });
    });

    const leaveHandler = () => {
      gsap.ticker.remove(tickerFn);
      tickerAdded = false;
      isActive = false;
      targetCornerPositions = null;
      gsap.set(activeStrength, {current:0, overwrite:true});
      activeTarget = null;
      corners.forEach(c => gsap.killTweensOf(c));
      resetCorners();

      resumeTimeout = setTimeout(() => {
        if(!activeTarget && spinTl){
          const cur = gsap.getProperty(wrapper,'rotation') % 360;
          spinTl.kill();
          spinTl = gsap.timeline({repeat:-1}).to(wrapper,{rotation:'+=360', duration:SPIN_DUR, ease:'none'});
          gsap.to(wrapper,{
            rotation: cur + 360,
            duration: SPIN_DUR * (1 - cur/360),
            ease:'none',
            onComplete: () => spinTl?.restart()
          });
        }
        resumeTimeout = null;
      }, 50);

      cleanupTarget(target);
    };

    currentLeaveHandler = leaveHandler;
    target.addEventListener('mouseleave', leaveHandler);
  }, {passive:true});
})();

/* ═══════════════════════════════════════════════════════
   LIGHT RAYS — WebGL, per-section (top-center origin, purple)
   Intensity reduced to 70% of original
═══════════════════════════════════════════════════════ */
function hexToRgb(hex){
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1],16)/255, parseInt(m[2],16)/255, parseInt(m[3],16)/255] : [1,1,1];
}

function getAnchorAndDir(origin, w, h){
  const outside = 0.2;
  switch(origin){
    case 'top-left':   return {anchor:[0,-outside*h],                dir:[0,1]};
    case 'top-right':  return {anchor:[w,-outside*h],                dir:[0,1]};
    case 'left':       return {anchor:[-outside*w, 0.5*h],           dir:[1,0]};
    case 'right':      return {anchor:[(1+outside)*w, 0.5*h],        dir:[-1,0]};
    case 'bottom-left':  return {anchor:[0,(1+outside)*h],          dir:[0,-1]};
    case 'bottom-center':return {anchor:[0.5*w,(1+outside)*h],      dir:[0,-1]};
    case 'bottom-right': return {anchor:[w,(1+outside)*h],          dir:[0,-1]};
    default: return {anchor:[0.5*w,-outside*h], dir:[0,1]};
  }
}

function initLightRays(containerId, options){
  const container = document.getElementById(containerId);
  if(!container) return;

  const cfg = Object.assign({
    raysOrigin:'top-center',
    raysColor:'#ae00ff',
    raysSpeed:1.6,
    lightSpread:0.9,
    rayLength:3,
    pulsating:false,
    fadeDistance:1.3,
    saturation:1.0,
    followMouse:true,
    mouseInfluence:0.1,
    noiseAmount:0.0,
    distortion:0.0
  }, options);

  const canvas = document.createElement('canvas');
  canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none';
  container.appendChild(canvas);

  const gl = canvas.getContext('webgl',{alpha:true, premultipliedAlpha:false});
  if(!gl){ console.warn('WebGL not available'); return; }

  let W=0, H=0;
  const mouseRef   = {x:0.5, y:0.5};
  const smoothMouse = {x:0.5, y:0.5};

  function resize(){
    const p = container.parentElement || container;
    W = p.clientWidth; H = p.clientHeight;
    canvas.width  = W * Math.min(devicePixelRatio,2);
    canvas.height = H * Math.min(devicePixelRatio,2);
    canvas.style.width  = W+'px';
    canvas.style.height = H+'px';
    gl.viewport(0,0,canvas.width,canvas.height);
    if(uniforms) updatePlacement();
  }

  window.addEventListener('resize', resize);

  const sec = container.parentElement;
  if(sec){
    sec.addEventListener('mousemove', e => {
      const r = sec.getBoundingClientRect();
      mouseRef.x = (e.clientX - r.left) / r.width;
      mouseRef.y = (e.clientY - r.top)  / r.height;
    });
  }

  const VS = `
    attribute vec2 position;
    varying vec2 vUv;
    void main(){
      vUv = position * 0.5 + 0.5;
      gl_Position = vec4(position, 0.0, 1.0);
    }`;

  const FS = `
    precision highp float;
    uniform float iTime;
    uniform vec2  iResolution;
    uniform vec2  rayPos;
    uniform vec2  rayDir;
    uniform vec3  raysColor;
    uniform float raysSpeed;
    uniform float lightSpread;
    uniform float rayLength;
    uniform float pulsating;
    uniform float fadeDistance;
    uniform float saturation;
    uniform vec2  mousePos;
    uniform float mouseInfluence;
    uniform float noiseAmount;
    uniform float distortion;
    varying vec2 vUv;

    float noise(vec2 st){
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord, float seedA, float seedB, float speed){
      vec2 sourceToCoord = coord - raySource;
      vec2 dirNorm = normalize(sourceToCoord);
      float cosAngle = dot(dirNorm, rayRefDirection);
      float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;
      float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));
      float distance = length(sourceToCoord);
      float maxDistance = iResolution.x * rayLength;
      float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);
      float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);
      float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;
      float baseStrength = clamp(
        (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
        (0.3  + 0.2  * cos(-distortedAngle * seedB + iTime * speed)),
        0.0, 1.0
      );
      return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
    }

    void mainImage(out vec4 fragColor, in vec2 fragCoord){
      vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
      vec2 finalRayDir = rayDir;
      if(mouseInfluence > 0.0){
        vec2 mouseScreenPos = mousePos * iResolution.xy;
        vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
        finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
      }
      vec4 rays1 = vec4(1.0) * rayStrength(rayPos, finalRayDir, coord, 36.2214,  21.11349, 1.5 * raysSpeed);
      vec4 rays2 = vec4(1.0) * rayStrength(rayPos, finalRayDir, coord, 22.3991,  18.0234,  1.1 * raysSpeed);
      vec4 rays3 = vec4(1.0) * rayStrength(rayPos, finalRayDir, coord, 14.7652,  27.4891,  0.8 * raysSpeed);
      fragColor = rays1 * 0.6 + rays2 * 0.45 + rays3 * 0.3;
      if(noiseAmount > 0.0){
        float n = noise(coord * 0.01 + iTime * 0.1);
        fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
      }
      float brightness = 1.0 - (coord.y / iResolution.y);
      /* Purple-white tint */
      fragColor.x *= 0.55 + brightness * 0.55;
      fragColor.y *= 0.38 + brightness * 0.52;
      fragColor.z *= 0.72 + brightness * 0.38;
      if(saturation != 1.0){
        float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
        fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
      }
      fragColor.rgb *= raysColor;
      /* Intensity at ~55% of original: 1.7 * 0.55 = 0.935, 1.4 * 0.55 = 0.77 */
      fragColor.rgb *= 0.935;
      fragColor.a   *= 0.77;
    }

    void main(){
      vec4 color;
      mainImage(color, gl_FragCoord.xy);
      gl_FragColor = color;
    }`;

  function mkShader(type, src){
    const s = gl.createShader(type);
    gl.shaderSource(s,src); gl.compileShader(s); return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog); gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  const al = gl.getAttribLocation(prog,'position');
  gl.enableVertexAttribArray(al);
  gl.vertexAttribPointer(al,2,gl.FLOAT,false,0,0);

  const uniforms = {
    iTime:          gl.getUniformLocation(prog,'iTime'),
    iResolution:    gl.getUniformLocation(prog,'iResolution'),
    rayPos:         gl.getUniformLocation(prog,'rayPos'),
    rayDir:         gl.getUniformLocation(prog,'rayDir'),
    raysColor:      gl.getUniformLocation(prog,'raysColor'),
    raysSpeed:      gl.getUniformLocation(prog,'raysSpeed'),
    lightSpread:    gl.getUniformLocation(prog,'lightSpread'),
    rayLength:      gl.getUniformLocation(prog,'rayLength'),
    pulsating:      gl.getUniformLocation(prog,'pulsating'),
    fadeDistance:   gl.getUniformLocation(prog,'fadeDistance'),
    saturation:     gl.getUniformLocation(prog,'saturation'),
    mousePos:       gl.getUniformLocation(prog,'mousePos'),
    mouseInfluence: gl.getUniformLocation(prog,'mouseInfluence'),
    noiseAmount:    gl.getUniformLocation(prog,'noiseAmount'),
    distortion:     gl.getUniformLocation(prog,'distortion')
  };

  const rgb = hexToRgb(cfg.raysColor);

  function updatePlacement(){
    const dpr = Math.min(devicePixelRatio,2);
    const rw = canvas.width;
    const rh = canvas.height;
    gl.uniform2f(uniforms.iResolution, rw, rh);
    const {anchor, dir} = getAnchorAndDir(cfg.raysOrigin, rw, rh);
    gl.uniform2f(uniforms.rayPos, anchor[0], anchor[1]);
    gl.uniform2f(uniforms.rayDir, dir[0], dir[1]);
  }

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const t0 = performance.now();

  function frame(now){
    const t = (now - t0) * 0.001;

    const sm = 0.92;
    smoothMouse.x = smoothMouse.x * sm + mouseRef.x * (1-sm);
    smoothMouse.y = smoothMouse.y * sm + mouseRef.y * (1-sm);

    gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uniforms.iTime, t);
    gl.uniform3f(uniforms.raysColor, rgb[0], rgb[1], rgb[2]);
    gl.uniform1f(uniforms.raysSpeed, cfg.raysSpeed);
    gl.uniform1f(uniforms.lightSpread, cfg.lightSpread);
    gl.uniform1f(uniforms.rayLength, cfg.rayLength);
    gl.uniform1f(uniforms.pulsating, cfg.pulsating ? 1.0 : 0.0);
    gl.uniform1f(uniforms.fadeDistance, cfg.fadeDistance);
    gl.uniform1f(uniforms.saturation, cfg.saturation);
    gl.uniform2f(uniforms.mousePos, smoothMouse.x, smoothMouse.y);
    gl.uniform1f(uniforms.mouseInfluence, cfg.mouseInfluence);
    gl.uniform1f(uniforms.noiseAmount, cfg.noiseAmount);
    gl.uniform1f(uniforms.distortion, cfg.distortion);
    updatePlacement();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(frame);
  }

  resize();
  requestAnimationFrame(frame);
}

initLightRays('hero-rays-container', {raysColor:'#d4aaff', rayLength:4, lightSpread:1.1, fadeDistance:1.6, mouseInfluence:0.12});
initLightRays('cta-rays-container', {raysOrigin:'bottom-center', raysColor:'#d4aaff', rayLength:4, lightSpread:1.1, fadeDistance:1.6, mouseInfluence:0.08});

/* ═══════════════════════════════════════════════════════
   PARTICLES
═══════════════════════════════════════════════════════ */
(function(){
  ['hero','cta'].forEach(id=>{
    const sec = document.getElementById(id);
    if(!sec) return;
    const pc = document.createElement('canvas');
    pc.className='particles-canvas';
    sec.appendChild(pc);
    const ctx = pc.getContext('2d');
    if(!ctx) return;

    let W=0,H=0,mX=-999,mY=-999;
    function resize(){W=sec.clientWidth;H=sec.clientHeight;pc.width=W;pc.height=H;}
    resize();
    window.addEventListener('resize',()=>{resize();init();});
    sec.addEventListener('mousemove',e=>{const r=sec.getBoundingClientRect();mX=e.clientX-r.left;mY=e.clientY-r.top;});
    sec.addEventListener('mouseleave',()=>{mX=-999;mY=-999;});

    const COLS=[[123,31,250],[179,157,219],[201,184,232],[90,18,200],[155,100,240],[210,190,245],[140,60,255]];
    let pts=[];

    function init(){
      const n=Math.min(Math.floor((W*H)/3000),250);
      pts=Array.from({length:n},()=>{
        const c=COLS[Math.floor(Math.random()*COLS.length)];
        return{x:Math.random()*W,y:Math.random()*H,
               vx:(Math.random()-.5)*.5,vy:(Math.random()-.5)*.5,
               r:Math.random()*4+1.5,base:Math.random()*.6+.25,
               col:c,phase:Math.random()*Math.PI*2};
      });
    }
    init();

    function loop(){
      const t=performance.now()*.001;
      ctx.clearRect(0,0,W,H);
      for(let i=0;i<pts.length;i++){
        const p=pts[i];
        const dx=p.x-mX,dy=p.y-mY,d2=dx*dx+dy*dy;
        if(d2<14400&&d2>0){const d=Math.sqrt(d2);const f=(120-d)/120*.75;p.vx+=(dx/d)*f;p.vy+=(dy/d)*f;}
        p.vx*=.974;p.vy*=.974;
        p.x+=p.vx;p.y+=p.vy;
        if(p.x<-8)p.x=W+8; if(p.x>W+8)p.x=-8;
        if(p.y<-8)p.y=H+8; if(p.y>H+8)p.y=-8;
        const alpha=p.base*(0.6+0.4*Math.sin(t*1.3+p.phase));
        const [r,g,b]=p.col;
        const g2=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*3.5);
        g2.addColorStop(0,`rgba(${r},${g},${b},${(alpha*.6).toFixed(3)})`);
        g2.addColorStop(1,`rgba(${r},${g},${b},0)`);
        ctx.beginPath();ctx.arc(p.x,p.y,p.r*3.5,0,Math.PI*2);
        ctx.fillStyle=g2;ctx.fill();
        ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(${r},${g},${b},${alpha.toFixed(3)})`;ctx.fill();
        for(let j=i+1;j<pts.length;j++){
          const q=pts[j];
          const ex=p.x-q.x,ey=p.y-q.y,ed=Math.sqrt(ex*ex+ey*ey);
          if(ed<110){
            ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);
            ctx.strokeStyle=`rgba(${r},${g},${b},${((1-ed/110)*.2).toFixed(3)})`;
            ctx.lineWidth=.7;ctx.stroke();
          }
        }
      }
      requestAnimationFrame(loop);
    }
    loop();
  });
})();

/* ═══════════════════════════════════════════════════════
   GLOW CARD BORDERS
═══════════════════════════════════════════════════════ */
document.addEventListener('pointermove', e => {
  document.querySelectorAll('.feat-cell').forEach(card => {
    card.style.setProperty('--x', e.clientX.toFixed(2));
    card.style.setProperty('--xp', (e.clientX/window.innerWidth).toFixed(2));
    card.style.setProperty('--y', e.clientY.toFixed(2));
    card.style.setProperty('--yp', (e.clientY/window.innerHeight).toFixed(2));
    card.style.setProperty('--hue', (280 + (e.clientX/window.innerWidth)*300).toFixed(0));
  });
});

document.querySelectorAll('.gcard').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%';
    const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
    card.style.setProperty('--mx', x);
    card.style.setProperty('--my', y);
  });
});

/* ═══════════════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════════════ */
const NAV = document.getElementById('nav');
let lastY=0;
window.addEventListener('scroll',()=>{
  const y=window.scrollY;
  NAV.classList.toggle('scrolled',y>60);
  NAV.style.transform=(y>lastY&&y>180)?'translateY(-100%)':'';
  lastY=y;
},{passive:true});

/* ═══════════════════════════════════════════════════════
   BLUR TEXT
═══════════════════════════════════════════════════════ */
function buildBlur(wrap,text,base,step,dir){
  if(!wrap)return;
  wrap.innerHTML='';
  const words=text.split(' ');
  words.forEach((w,i)=>{
    const s=document.createElement('span');
    s.className='blur-word';
    s.textContent=w;
    s.style.transitionDelay=(base+i*step)+'ms';
    if(dir==='bottom') s.style.transform='translateY(24px)';
    wrap.appendChild(s);
    if(i<words.length-1){
      const g=document.createElement('span');
      g.innerHTML='\u00A0';
      g.style.cssText='display:inline-block;width:.28em';
      wrap.appendChild(g);
    }
  });
}

document.querySelectorAll('[data-blur-text]').forEach(el=>{
  buildBlur(el, el.getAttribute('data-blur-text'),
    parseInt(el.getAttribute('data-delay')||'0',10), 40, 'top');
});

const bIO=new IntersectionObserver(es=>{
  es.forEach(e=>{
    if(e.isIntersecting){
      e.target.querySelectorAll('.blur-word').forEach(w=>w.classList.add('visible'));
      bIO.unobserve(e.target);
    }
  });
},{threshold:.15});
document.querySelectorAll('[data-blur-text]').forEach(el=>bIO.observe(el));

window.addEventListener('load',()=>{
  setTimeout(()=>{
    document.querySelectorAll('[data-blur-text] .blur-word').forEach(w=>w.classList.add('visible'));
  },180);
});

(function(){
  const sub=document.getElementById('cta-blur-sub');
  if(!sub)return;
  const txt=sub.textContent.trim();
  const wrap=document.createElement('span');
  wrap.style.cssText='display:flex;flex-wrap:wrap;justify-content:center';
  buildBlur(wrap,txt,0,35,'bottom');
  sub.innerHTML=''; sub.appendChild(wrap);
  const io=new IntersectionObserver(es=>{
    es.forEach(e=>{
      if(e.isIntersecting){
        Array.from(e.target.querySelectorAll('.blur-word')).forEach((w,i)=>{
          setTimeout(()=>w.classList.add('visible'),i*35);
        });
        io.unobserve(e.target);
      }
    });
  },{threshold:.25});
  io.observe(sub);
})();

/* ═══════════════════════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════════════════════ */
const rIO=new IntersectionObserver(es=>{
  es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('on');});
},{threshold:.1});
document.querySelectorAll('.r').forEach(el=>rIO.observe(el));

/* ═══════════════════════════════════════════════════════
   COUNTER
═══════════════════════════════════════════════════════ */
const cIO=new IntersectionObserver(es=>{
  es.forEach(e=>{
    if(e.isIntersecting&&!e.target.dataset.done){
      e.target.dataset.done='1';
      const tgt=+e.target.dataset.target,dur=1800,s0=performance.now();
      const tick=n=>{
        const pr=Math.min((n-s0)/dur,1),ease=1-Math.pow(1-pr,4);
        e.target.textContent=Math.round(ease*tgt).toLocaleString();
        if(pr<1)requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  });
},{threshold:.5});
document.querySelectorAll('.counter').forEach(el=>cIO.observe(el));

/* ═══════════════════════════════════════════════════════
   STEP ACTIVE
═══════════════════════════════════════════════════════ */
const sIO=new IntersectionObserver(es=>{
  es.forEach(e=>{
    if(e.isIntersecting){
      document.querySelectorAll('.step').forEach(s=>s.classList.remove('active'));
      e.target.classList.add('active');
    }
  });
},{threshold:.55,rootMargin:'-22% 0px -22% 0px'});
document.querySelectorAll('.step').forEach(s=>sIO.observe(s));
}
