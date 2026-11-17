import {planets,heliocentric,lunarPhase} from './astronomy.js?v=0.5.0';
const NS='http://www.w3.org/2000/svg';
const el=(name,attrs={},content='')=>{const n=document.createElementNS(NS,name);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));if(content)n.textContent=content;return n};
const svg=document.getElementById('orrery'),moon=document.getElementById('moon'),dateInput=document.getElementById('date-input');
const nowDate=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
dateInput.value=nowDate();
const safeDate=()=>{const d=new Date(dateInput.value+'T12:00:00Z');return Number.isNaN(d.getTime())?new Date():d};
function drawOrrery(date){
 svg.replaceChildren();
 // Expanded schematic radii leave room for glyphs centered in each disc.
 const cx=500,cy=325,rx=[52,94,140,190,245,305,370,432],tilt=.64;
 svg.append(el('line',{x1:32,y1:cy,x2:968,y2:cy,stroke:'#b5a17f','stroke-width':1,'stroke-dasharray':'3 6'}));
 svg.append(el('line',{x1:cx,y1:18,x2:cx,y2:632,stroke:'#b5a17f','stroke-width':1,'stroke-dasharray':'3 6'}));
 planets.forEach((p,i)=>svg.append(el('ellipse',{cx,cy,rx:rx[i],ry:rx[i]*tilt,fill:'none',stroke:i===2?'#8a3026':'#a18c61','stroke-width':i===2?1.5:1})));
 svg.append(el('circle',{cx,cy,r:20,fill:'#b38a48',stroke:'#5c4936','stroke-width':2}));
 svg.append(el('text',{x:cx,y:cy+1,'text-anchor':'middle','dominant-baseline':'middle','font-size':24,fill:'#382e25','font-family':'Georgia, serif'},'☉'));
 // Rank-based visual diameters: Earth = 1.0, adjacent ranks differ by 10%.
 // These are intentionally not physical diameter ratios.
 const discScale={Mercury:.7,Mars:.8,Venus:.9,Earth:1,Neptune:1.1,Uranus:1.2,Saturn:1.3,Jupiter:1.4};
 planets.forEach((p,i)=>{
  const pos=heliocentric(date,p),a=pos.angle,x=cx+rx[i]*Math.cos(a),y=cy-rx[i]*tilt*Math.sin(a);
  const earth=p.name==='Earth',scale=discScale[p.name],radius=15*scale;
  const disc=el('g');
  disc.append(el('circle',{cx:x,cy:y,r:radius,fill:earth?'#8a3026':'#584734',stroke:'#eadfca','stroke-width':1.5}));
  // Center by the rendered glyph's measured bounds, not its font baseline.
  // This compensates for different symbol ascenders and descenders.
  const glyph=el('text',{x:0,y:0,'font-size':radius*1.22,fill:earth?'#f7edcf':'#eadfca','font-family':'Georgia, serif','pointer-events':'none'},p.symbol);
  disc.append(glyph);
  disc.append(el('title',{},p.name+' · '+pos.distance.toFixed(2)+' AU from Sun · '+scale.toFixed(2)+'× disc'));
  svg.append(disc);
  const bounds=glyph.getBBox();
  glyph.setAttribute('transform',`translate(${x-bounds.x-bounds.width/2} ${y-bounds.y-bounds.height/2})`);
 });
 svg.append(el('text',{x:36,y:35,'font-size':12,fill:'#6c563d','letter-spacing':2},'HELIOCENTRIC · ECLIPTIC'));
 svg.append(el('text',{x:36,y:52,'font-size':11,fill:'#765a3c'},date.toISOString().slice(0,10)+' · 12:00 UTC'));
}
function drawMoon(date){
 const phase=lunarPhase(date), f=phase.fraction;
 moon.replaceChildren();

 // Primary display: the Moon's phase as viewed from Earth.
 const px=105, py=113, r=62, steps=120;
 const side=f<0.5?1:-1, q=Math.cos(2*Math.PI*f);
 const pts=[];
 for(let i=0;i<=steps;i++){
  const y=-r+2*r*i/steps;
  pts.push([px+side*Math.sqrt(Math.max(0,r*r-y*y)),py+y]);
 }
 for(let i=steps;i>=0;i--){
  const y=-r+2*r*i/steps;
  pts.push([px+side*q*Math.sqrt(Math.max(0,r*r-y*y)),py+y]);
 }
 moon.append(el('circle',{cx:px,cy:py,r,fill:'#776b58',stroke:'#584734','stroke-width':1.4}));
 moon.append(el('polygon',{points:pts.map(p=>p.join(',')).join(' '),fill:'#f7edcf'}));
 moon.append(el('circle',{cx:px,cy:py,r,fill:'none',stroke:'#584734','stroke-width':1.4}));
 moon.append(el('text',{x:px,y:197,'text-anchor':'middle','font-size':12,fill:'#594831','letter-spacing':1},'VIEW FROM EARTH'));

 // Auxiliary top-down orbital schematic in the upper right.
 const ex=263, ey=64, orbitR=34, moonR=7;
 const theta=2*Math.PI*f;
 const mx=ex+orbitR*Math.cos(theta), my=ey-orbitR*Math.sin(theta);
 moon.append(el('text',{x:263,y:13,'text-anchor':'middle','font-size':10,fill:'#765a3c','letter-spacing':.7},'TOP DOWN'));
 moon.append(el('circle',{cx:ex,cy:ey,r:orbitR,fill:'none',stroke:'#a18c61','stroke-width':1.2,'stroke-dasharray':'3 4'}));
 moon.append(el('circle',{cx:ex,cy:ey,r:11,fill:'#8a3026',stroke:'#584734','stroke-width':1}));
 // Half the Moon facing the fixed Sun at the right is lit.
 moon.append(el('circle',{cx:mx,cy:my,r:moonR,fill:'#776b58',stroke:'#584734','stroke-width':.8}));
 const lit=[];
 for(let i=0;i<=32;i++){
  const y=-moonR+2*moonR*i/32;
  lit.push([mx+Math.sqrt(Math.max(0,moonR*moonR-y*y)),my+y]);
 }
 lit.push([mx,my+moonR],[mx,my-moonR]);
 moon.append(el('polygon',{points:lit.map(p=>p.join(',')).join(' '),fill:'#f7edcf'}));
 moon.append(el('circle',{cx:mx,cy:my,r:moonR,fill:'none',stroke:'#584734','stroke-width':.8}));
 // Fixed Sun outside the orbit, aligned with Earth.
 moon.append(el('text',{x:317,y:ey+8,'text-anchor':'middle','font-size':27,fill:'#8a3026','font-family':'Georgia, serif'},'☉'));
 moon.append(el('text',{x:263,y:114,'text-anchor':'middle','font-size':9,fill:'#765a3c'},'NOT TO SCALE'));
 document.getElementById('moon-label').textContent=phase.phaseName;
 document.getElementById('illumination').textContent=Math.round(phase.illumination*100)+'% illuminated · '+phase.age.toFixed(1)+' days since new moon';
}
function render(){const date=safeDate();drawOrrery(date);drawMoon(date)}
function tick(){const d=new Date();document.getElementById('clock').textContent=d.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit',second:'2-digit',hour12:true});document.getElementById('date').textContent=d.toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'});document.getElementById('zone').textContent=Intl.DateTimeFormat().resolvedOptions().timeZone||'Local time'}
document.getElementById('today').addEventListener('click',()=>{dateInput.value=nowDate();render()});
for(const [id,delta] of [['prev',-1],['next',1]])document.getElementById(id).addEventListener('click',()=>{const d=safeDate();d.setUTCDate(d.getUTCDate()+delta);dateInput.value=d.toISOString().slice(0,10);render()});
dateInput.addEventListener('change',render);render();tick();setInterval(tick,1000);
