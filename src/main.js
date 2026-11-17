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
 const phase=lunarPhase(date),f=phase.fraction;
 moon.replaceChildren();
 moon.append(el('circle',{cx:76,cy:101,r:22,fill:'#8a3026',stroke:'#584734','stroke-width':1.5}));
 moon.append(el('text',{x:76,y:150,'text-anchor':'middle','font-size':13,fill:'#594831'},'EARTH'));
 // Draw the visible illuminated region from the phase angle.
 // New moon: 0% lit; first quarter: right half; full: 100%;
 // last quarter: left half. The terminator changes continuously.
 const c=202, cy=101, r=35, steps=120;
 const waxing=f<0.5;
 const side=waxing?1:-1;
 const q=Math.cos(2*Math.PI*f);
 const pts=[];
 // Traverse the illuminated outer limb from top to bottom.
 for(let i=0;i<=steps;i++){
  const y=-r+2*r*i/steps;
  const x=side*Math.sqrt(Math.max(0,r*r-y*y));
  pts.push([c+x,cy+y]);
 }
 // Return along the terminator from bottom to top.
 for(let i=steps;i>=0;i--){
  const y=-r+2*r*i/steps;
  const x=side*q*Math.sqrt(Math.max(0,r*r-y*y));
  pts.push([c+x,cy+y]);
 }
 moon.append(el('circle',{cx:c,cy,r,fill:'#776b58',stroke:'#584734','stroke-width':1}));
 moon.append(el('polygon',{points:pts.map(p=>p.join(',')).join(' '),fill:'#f7edcf'}));
 moon.append(el('text',{x:202,y:157,'text-anchor':'middle','font-size':12,fill:'#594831'},'MOON'));
 // Relative Sun direction in the lunar phase schematic:
 // new = right (Moon between Earth and Sun), first quarter = up,
 // full = left, last quarter = down. This is not a sky azimuth.
 const theta=2*Math.PI*f;
 const dx=Math.cos(theta), dy=-Math.sin(theta);
 const startR=42, endR=53, sunR=64;
 const sx=c+sunR*dx, sy=cy+sunR*dy;
 const ax=c+startR*dx, ay=cy+startR*dy;
 const bx=c+endR*dx, by=cy+endR*dy;
 moon.append(el('line',{x1:ax,y1:ay,x2:bx,y2:by,stroke:'#8a3026','stroke-width':2.2,'stroke-linecap':'round'}));
 // Arrowhead points outward, toward the Sun.
 const wing=5,back=7;
 const arrow=[[bx,by],[bx-back*dx-wing*(-dy),by-back*dy-wing*dx],[bx-back*dx+wing*(-dy),by-back*dy+wing*dx]];
 moon.append(el('polygon',{points:arrow.map(p=>p.join(',')).join(' '),fill:'#8a3026'}));
 const sun=el('text',{x:sx,y:sy+8,'text-anchor':'middle','font-size':25,fill:'#8a3026','font-family':'Georgia, serif'},'☉');
 sun.append(el('title',{},'Direction toward the Sun (schematic)'));
 moon.append(sun);
 moon.append(el('text',{x:12,y:20,'font-size':11,fill:'#594831','letter-spacing':1},'☉ SUN DIRECTION'));
 document.getElementById('moon-label').textContent=phase.phaseName;
 document.getElementById('illumination').textContent=Math.round(phase.illumination*100)+'% illuminated · '+phase.age.toFixed(1)+' days since new moon';
}
function render(){const date=safeDate();drawOrrery(date);drawMoon(date)}
function tick(){const d=new Date();document.getElementById('clock').textContent=d.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit',second:'2-digit',hour12:true});document.getElementById('date').textContent=d.toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'});document.getElementById('zone').textContent=Intl.DateTimeFormat().resolvedOptions().timeZone||'Local time'}
document.getElementById('today').addEventListener('click',()=>{dateInput.value=nowDate();render()});
for(const [id,delta] of [['prev',-1],['next',1]])document.getElementById(id).addEventListener('click',()=>{const d=safeDate();d.setUTCDate(d.getUTCDate()+delta);dateInput.value=d.toISOString().slice(0,10);render()});
dateInput.addEventListener('change',render);render();tick();setInterval(tick,1000);
