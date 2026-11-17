import {planets,heliocentric,lunarPhase} from './astronomy.js?v=0.2.0';
const NS='http://www.w3.org/2000/svg';
const el=(name,attrs={},content='')=>{const n=document.createElementNS(NS,name);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));if(content)n.textContent=content;return n};
const svg=document.getElementById('orrery'),moon=document.getElementById('moon'),dateInput=document.getElementById('date-input');
const nowDate=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
dateInput.value=nowDate();
const safeDate=()=>{const d=new Date(dateInput.value+'T12:00:00Z');return Number.isNaN(d.getTime())?new Date():d};
function drawOrrery(date){
 svg.replaceChildren();
 const cx=410,cy=267,rx=[39,66,94,125,161,202,246,289],tilt=.70;
 svg.append(el('line',{x1:36,y1:cy,x2:784,y2:cy,stroke:'#b5a17f','stroke-width':1,'stroke-dasharray':'3 6'}));
 svg.append(el('line',{x1:cx,y1:18,x2:cx,y2:516,stroke:'#b5a17f','stroke-width':1,'stroke-dasharray':'3 6'}));
 planets.forEach((p,i)=>svg.append(el('ellipse',{cx,cy,rx:rx[i],ry:rx[i]*tilt,fill:'none',stroke:i===2?'#8a3026':'#a18c61','stroke-width':i===2?1.5:1})));
 svg.append(el('circle',{cx,cy,r:13,fill:'#b38a48',stroke:'#5c4936','stroke-width':2}));
 svg.append(el('text',{x:cx,y:cy+4,'text-anchor':'middle','font-size':13,fill:'#382e25'},'☉'));
 planets.forEach((p,i)=>{
  const pos=heliocentric(date,p),a=pos.angle,x=cx+rx[i]*Math.cos(a),y=cy-rx[i]*tilt*Math.sin(a);
  svg.append(el('circle',{cx:x,cy:y,r:i===2?6:4.7,fill:i===2?'#8a3026':'#584734',stroke:'#eadfca','stroke-width':1.5}));
  const offset=(i%2===0)?-11:18;
  const label=el('text',{x:x+8,y:y+offset,'font-size':15,fill:'#382e25','font-family':'Georgia, serif'},p.symbol);
  const title=el('title',{},p.name+' · '+pos.distance.toFixed(2)+' AU from Sun');
  label.append(title);svg.append(label);
 });
 svg.append(el('text',{x:36,y:35,'font-size':12,fill:'#6c563d','letter-spacing':2},'HELIOCENTRIC · ECLIPTIC'));
 svg.append(el('text',{x:36,y:52,'font-size':11,fill:'#765a3c'},date.toISOString().slice(0,10)+' · 12:00 UTC'));
}
function drawMoon(date){
 const phase=lunarPhase(date), f=phase.fraction;
 moon.replaceChildren();

 // Top-down synodic schematic: sunlight enters from the right.
 // The Moon moves counterclockwise around Earth as the phase increases.
 const ex=116, ey=115, orbitR=67, moonR=13;
 const theta=2*Math.PI*f;
 const mx=ex+orbitR*Math.cos(theta), my=ey-orbitR*Math.sin(theta);

 moon.append(el('circle',{cx:ex,cy:ey,r:orbitR,fill:'none',stroke:'#a18c61','stroke-width':1.3,'stroke-dasharray':'4 5'}));
 moon.append(el('line',{x1:ex,y1:ey,x2:mx,y2:my,stroke:'#a18c61','stroke-width':1,'stroke-dasharray':'2 5'}));
 moon.append(el('circle',{cx:ex,cy:ey,r:21,fill:'#8a3026',stroke:'#584734','stroke-width':1.5}));
 moon.append(el('text',{x:ex,y:ey+36,'text-anchor':'middle','font-size':11,fill:'#594831'},'EARTH'));

 // The near side of the Moon always faces Earth; the illuminated half
 // faces the fixed Sun to the right of this diagram.
 moon.append(el('circle',{cx:mx,cy:my,r:moonR,fill:'#776b58',stroke:'#584734','stroke-width':1}));
 const lit=[];
 for(let i=0;i<=48;i++){
  const y=-moonR+2*moonR*i/48;
  lit.push([mx+Math.sqrt(Math.max(0,moonR*moonR-y*y)),my+y]);
 }
 lit.push([mx,my+moonR],[mx,my-moonR]);
 moon.append(el('polygon',{points:lit.map(p=>p.join(',')).join(' '),fill:'#f7edcf'}));
 moon.append(el('circle',{cx:mx,cy:my,r:moonR,fill:'none',stroke:'#584734','stroke-width':1}));
 
 // Sun is external to the Earth-Moon system, with fixed light direction.
 moon.append(el('text',{x:292,y:27,'text-anchor':'middle','font-size':27,fill:'#8a3026','font-family':'Georgia, serif'},'☉'));
 moon.append(el('text',{x:292,y:44,'text-anchor':'middle','font-size':10,fill:'#594831','letter-spacing':1},'SUN'));
 for(const y of [63,79,95]){
  moon.append(el('line',{x1:310,y1:y,x2:249,y2:y,stroke:'#8a3026','stroke-width':1.6,'stroke-linecap':'round'}));
  moon.append(el('polygon',{points:`249,${y} 257,${y-4} 257,${y+4}`,fill:'#8a3026'}));
 }

 // Separate observer's view: the Moon as seen from Earth.
 const px=276,py=167,r=24,steps=96,side=f<.5?1:-1,q=Math.cos(2*Math.PI*f);
 const pts=[];
 for(let i=0;i<=steps;i++){
  const y=-r+2*r*i/steps;
  pts.push([px+side*Math.sqrt(Math.max(0,r*r-y*y)),py+y]);
 }
 for(let i=steps;i>=0;i--){
  const y=-r+2*r*i/steps;
  pts.push([px+side*q*Math.sqrt(Math.max(0,r*r-y*y)),py+y]);
 }
 moon.append(el('circle',{cx:px,cy:py,r,fill:'#776b58',stroke:'#584734','stroke-width':1}));
 moon.append(el('polygon',{points:pts.map(p=>p.join(',')).join(' '),fill:'#f7edcf'}));
 moon.append(el('circle',{cx:px,cy:py,r,fill:'none',stroke:'#584734','stroke-width':1}));
 moon.append(el('text',{x:px,y:205,'text-anchor':'middle','font-size':10,fill:'#594831','letter-spacing':.5},'FROM EARTH'));
 moon.append(el('text',{x:13,y:217,'font-size':10,fill:'#765a3c'},'SCHEMATIC · NOT TO SCALE'));
 document.getElementById('moon-label').textContent=phase.phaseName;
 document.getElementById('illumination').textContent=Math.round(phase.illumination*100)+'% illuminated · '+phase.age.toFixed(1)+' days since new moon';
}
function render(){const date=safeDate();drawOrrery(date);drawMoon(date)}
function tick(){const d=new Date();document.getElementById('clock').textContent=d.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit',second:'2-digit',hour12:true});document.getElementById('date').textContent=d.toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'});document.getElementById('zone').textContent=Intl.DateTimeFormat().resolvedOptions().timeZone||'Local time'}
document.getElementById('today').addEventListener('click',()=>{dateInput.value=nowDate();render()});
for(const [id,delta] of [['prev',-1],['next',1]])document.getElementById(id).addEventListener('click',()=>{const d=safeDate();d.setUTCDate(d.getUTCDate()+delta);dateInput.value=d.toISOString().slice(0,10);render()});
dateInput.addEventListener('change',render);render();tick();setInterval(tick,1000);
