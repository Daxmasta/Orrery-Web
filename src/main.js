import {planets,heliocentric,lunarPhase} from './astronomy.js';
const NS='http://www.w3.org/2000/svg';
const el=(name,attrs={},content='')=>{const n=document.createElementNS(NS,name);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));if(content)n.textContent=content;return n};
const svg=document.getElementById('orrery'),moon=document.getElementById('moon'),dateInput=document.getElementById('date-input');
const nowDate=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
dateInput.value=nowDate();
const safeDate=()=>{const d=new Date(dateInput.value+'T12:00:00Z');return Number.isNaN(d.getTime())?new Date():d};
function drawOrrery(date){
 svg.replaceChildren();
 const cx=410,cy=267,rx=[39,66,94,125,161,202,246,289],tilt=.70;
 svg.append(el('line',{x1:36,y1:cy,x2:784,y2:cy,stroke:'#253746','stroke-width':1,'stroke-dasharray':'3 6'}));
 svg.append(el('line',{x1:cx,y1:18,x2:cx,y2:516,stroke:'#253746','stroke-width':1,'stroke-dasharray':'3 6'}));
 planets.forEach((p,i)=>svg.append(el('ellipse',{cx,cy,rx:rx[i],ry:rx[i]*tilt,fill:'none',stroke:i===2?'#718b97':'#415262','stroke-width':i===2?1.5:1})));
 svg.append(el('circle',{cx,cy,r:13,fill:'#e9c97c',stroke:'#fff0bf','stroke-width':2}));
 svg.append(el('text',{x:cx,y:cy+4,'text-anchor':'middle','font-size':13,fill:'#33250b'},'☉'));
 planets.forEach((p,i)=>{
  const pos=heliocentric(date,p),a=pos.angle,x=cx+rx[i]*Math.cos(a),y=cy-rx[i]*tilt*Math.sin(a);
  svg.append(el('circle',{cx:x,cy:y,r:i===2?6:4.7,fill:i===2?'#b3d7ed':'#e4d9bb',stroke:'#0b111b','stroke-width':1.5}));
  const offset=(i%2===0)?-11:18;
  const label=el('text',{x:x+8,y:y+offset,'font-size':15,fill:'#e5d8b4','font-family':'Georgia, serif'},p.symbol);
  const title=el('title',{},p.name+' · '+pos.distance.toFixed(2)+' AU from Sun');
  label.append(title);svg.append(label);
 });
 svg.append(el('text',{x:36,y:35,'font-size':12,fill:'#9aaab8','letter-spacing':2},'HELIOCENTRIC · ECLIPTIC'));
 svg.append(el('text',{x:36,y:52,'font-size':11,fill:'#788b99'},date.toISOString().slice(0,10)+' · 12:00 UTC'));
}
function drawMoon(date){
 const phase=lunarPhase(date),f=phase.fraction;
 moon.replaceChildren();
 moon.append(el('circle',{cx:82,cy:102,r:13,fill:'#75a7c7'}));
 moon.append(el('text',{x:82,y:143,'text-anchor':'middle','font-size':12,fill:'#b2c7d6'},'EARTH'));
 moon.append(el('ellipse',{cx:174,cy:101,rx:71,ry:63,fill:'none',stroke:'#46596a','stroke-width':1.3,'stroke-dasharray':'4 6'}));
 // Sunlight comes from the right in the inset; phase shadow is represented by the illuminated shape.
 const c=202,r=35,steps=80;
 const waxing=f<.5;
 const q=Math.cos(2*Math.PI*f);
 // Visible lit region bounded by limb and terminator; crescent/gibbous controlled by q.
 let pts=[];
 const start=waxing?-Math.PI/2:Math.PI/2;
 for(let i=0;i<=steps;i++){const a=start+(waxing?1:-1)*Math.PI*i/steps;pts.push([c+r*Math.cos(a),101+r*Math.sin(a)])}
 for(let i=steps;i>=0;i--){const y=-r+2*r*i/steps;const xx=q*Math.sqrt(Math.max(0,r*r-y*y));pts.push([c+xx,101+y])}
 moon.append(el('circle',{cx:c,cy:101,r,fill:'#27313c',stroke:'#71808c','stroke-width':1}));
 moon.append(el('polygon',{points:pts.map(p=>p.join(',')).join(' '),fill:'#e6e3d2'}));
 moon.append(el('text',{x:202,y:157,'text-anchor':'middle','font-size':12,fill:'#b2c7d6'},'MOON'));
 moon.append(el('text',{x:276,y:25,'text-anchor':'end','font-size':11,fill:'#e6c77d'},'☉ SUN →'));
 document.getElementById('moon-label').textContent=phase.phaseName;
 document.getElementById('illumination').textContent=Math.round(phase.illumination*100)+'% illuminated · '+phase.age.toFixed(1)+' days since new moon';
}
function render(){const date=safeDate();drawOrrery(date);drawMoon(date)}
function tick(){const d=new Date();document.getElementById('clock').textContent=d.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit',second:'2-digit',hour12:true});document.getElementById('date').textContent=d.toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'});document.getElementById('zone').textContent=Intl.DateTimeFormat().resolvedOptions().timeZone||'Local time'}
document.getElementById('today').addEventListener('click',()=>{dateInput.value=nowDate();render()});
for(const [id,delta] of [['prev',-1],['next',1]])document.getElementById(id).addEventListener('click',()=>{const d=safeDate();d.setUTCDate(d.getUTCDate()+delta);dateInput.value=d.toISOString().slice(0,10);render()});
dateInput.addEventListener('change',render);render();tick();setInterval(tick,1000);
