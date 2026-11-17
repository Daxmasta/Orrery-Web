import {planets,heliocentric,lunarPhase} from './astronomy.js?v=0.6.1';
const NS='http://www.w3.org/2000/svg';
const el=(name,attrs={},content='')=>{const n=document.createElementNS(NS,name);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));if(content)n.textContent=content;return n};
const svg=document.getElementById('orrery'),moon=document.getElementById('moon'),dateInput=document.getElementById('date-input');
const nowDate=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
dateInput.value=nowDate();
const safeDate=()=>{const d=new Date(dateInput.value+'T12:00:00Z');return Number.isNaN(d.getTime())?new Date():d};
function drawOrrery(date){
 svg.replaceChildren();
 // The view is intentionally schematic. Minimum orbit separation in the
 // compressed vertical direction exceeds the combined marker radii.
 const cx=900,cy=575,rx=[75,165,255,350,525,635,750,865],tilt=.57;
 svg.append(el('line',{x1:20,y1:cy,x2:1780,y2:cy,stroke:'#b5a17f','stroke-width':1,'stroke-dasharray':'3 6'}));
 svg.append(el('line',{x1:cx,y1:18,x2:cx,y2:1132,stroke:'#b5a17f','stroke-width':1,'stroke-dasharray':'3 6'}));
 planets.forEach((p,i)=>svg.append(el('ellipse',{cx,cy,rx:rx[i],ry:rx[i]*tilt,fill:'none',stroke:i===2?'#8a3026':'#a18c61','stroke-width':i===2?1.5:1})));

 // A continuous dotted belt between Mars and Jupiter.
 const beltR=414, beltWidth=20;
 for(let j=0;j<4;j++){
  const r=beltR+(j-1.5)*beltWidth/3;
  for(let k=0;k<180;k++){
   const angle=2*Math.PI*k/180;
   const x=cx+r*Math.cos(angle),y=cy-r*tilt*Math.sin(angle);
   const dotR=(k+j*7)%9===0?1.8:0.85;
   svg.append(el('circle',{cx:x,cy:y,r:dotR,fill:'#a18c61',opacity:.7}));
  }
 }

 // Approximate asteroid heliocentric longitudes from mean Keplerian elements.
 // Angles and periods are illustrative and not precision ephemerides.
 const asteroidElements=[
  {name:'Ceres',a:2.768,e:.076,meanAnomaly:95.99,perihelion:153.9,period:1681.6,track:407,symbol:'◆'},
  {name:'Pallas',a:2.77,e:.23,meanAnomaly:33.2,perihelion:123.3,period:1686,track:418,symbol:'◇'},
  {name:'Vesta',a:2.362,e:.089,meanAnomaly:20.9,perihelion:254.7,period:1325.8,track:428,symbol:'✦'}
 ];
 const days=(date.getTime()-Date.UTC(2000,0,1,12))/86400000;
 for(const asteroid of asteroidElements){
  const M=(asteroid.meanAnomaly+360*days/asteroid.period)*Math.PI/180;
  let E=M;
  for(let k=0;k<8;k++)E-=(E-asteroid.e*Math.sin(E)-M)/(1-asteroid.e*Math.cos(E));
  const nu=Math.atan2(Math.sqrt(1-asteroid.e*asteroid.e)*Math.sin(E),Math.cos(E)-asteroid.e);
  const angle=nu+asteroid.perihelion*Math.PI/180;
  const x=cx+asteroid.track*Math.cos(angle),y=cy-asteroid.track*tilt*Math.sin(angle);
  const group=el('g');
  group.append(el('circle',{cx:x,cy:y,r:9,fill:'#eadfca',stroke:'#8a3026','stroke-width':1.4}));
  group.append(el('text',{x,y:y+0.5,'text-anchor':'middle','dominant-baseline':'central','font-size':12,fill:'#8a3026'},asteroid.symbol));
  group.append(el('title',{},asteroid.name));
  svg.append(group);
 }

 svg.append(el('circle',{cx,cy,r:20,fill:'#b38a48',stroke:'#5c4936','stroke-width':2}));
 svg.append(el('text',{x:cx,y:cy+1,'text-anchor':'middle','dominant-baseline':'middle','font-size':24,fill:'#382e25','font-family':'Georgia, serif'},'☉'));
 const discScale={Mercury:.7,Mars:.8,Venus:.9,Earth:1,Neptune:1.1,Uranus:1.2,Saturn:1.3,Jupiter:1.4};
 planets.forEach((p,i)=>{
  const pos=heliocentric(date,p),angle=pos.angle,x=cx+rx[i]*Math.cos(angle),y=cy-rx[i]*tilt*Math.sin(angle);
  const earth=p.name==='Earth',scale=discScale[p.name],radius=19.5*scale;
  const disc=el('g');
  disc.append(el('circle',{cx:x,cy:y,r:radius,fill:earth?'#8a3026':'#584734',stroke:'#eadfca','stroke-width':1.5}));
  const glyph=el('text',{x:0,y:0,'font-size':radius*1.22,fill:earth?'#f7edcf':'#eadfca','font-family':'Georgia, serif','pointer-events':'none'},p.symbol);
  disc.append(glyph);
  disc.append(el('title',{},p.name));
  svg.append(disc);
  const bounds=glyph.getBBox();
  glyph.setAttribute('transform',`translate(${x-bounds.x-bounds.width/2} ${y-bounds.y-bounds.height/2})`);
 });
 svg.append(el('text',{x:36,y:35,'font-size':17,fill:'#6c563d','letter-spacing':2},'HELIOCENTRIC · ECLIPTIC'));
 svg.append(el('text',{x:36,y:60,'font-size':15,fill:'#765a3c'},date.toISOString().slice(0,10)+' · 12:00 UTC'));
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
