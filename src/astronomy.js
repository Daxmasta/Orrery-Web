// Low-precision heliocentric Keplerian elements near J2000.
// a (AU), e, inclination (deg), mean longitude (deg), perihelion longitude (deg),
// ascending node longitude (deg), and linear rates per Julian century.
// Source model: JPL/NASA approximate planetary elements (1800–2050).
export const planets = [
  {name:'Mercury',symbol:'☿',a:[.38709927,.00000037],e:[.20563593,.00001906],I:[7.00497902,-.00594749],L:[252.250324,149472.674112],p:[77.457796,.16047689],N:[48.330766,-.12534081]},
  {name:'Venus',symbol:'♀',a:[.72333566,.00000390],e:[.00677672,-.00004107],I:[3.39467605,-.00078890],L:[181.979100,58517.815388],p:[131.602467,.00268329],N:[76.679843,-.27769418]},
  {name:'Earth',symbol:'⊕',a:[1.00000261,.00000562],e:[.01671123,-.00004392],I:[-.00001531,-.01294668],L:[100.464572,35999.372450],p:[102.937682,.32327364],N:[0,0]},
  {name:'Mars',symbol:'♂',a:[1.52371034,.00001847],e:[.09339410,.00007882],I:[1.84969142,-.00813131],L:[-4.553432,19140.302685],p:[-23.943630,.44441088],N:[49.559539,-.29257343]},
  {name:'Jupiter',symbol:'♃',a:[5.20288700,-.00011607],e:[.04838624,-.00013253],I:[1.30439695,-.00183714],L:[34.396441,3034.746128],p:[14.728480,.21252668],N:[100.473909,.20469106]},
  {name:'Saturn',symbol:'♄',a:[9.53667594,-.00125060],e:[.05386179,-.00050991],I:[2.48599187,.00193609],L:[49.954244,1222.493622],p:[92.598878,-.41897216],N:[113.662424,-.28867794]},
  {name:'Uranus',symbol:'♅',a:[19.18916464,-.00196176],e:[.04725744,-.00004397],I:[.77263783,-.00242939],L:[313.238105,428.482027],p:[170.954276,.40805281],N:[74.016925,.04240589]},
  {name:'Neptune',symbol:'♆',a:[30.06992276,.00026291],e:[.00859048,.00005105],I:[1.77004347,.00035372],L:[-55.120030,218.459453],p:[44.964762,-.32241464],N:[131.784226,-.00508664]},
];
const radians=Math.PI/180;
const val=(x,T)=>(x[0]+x[1]*T);
export function heliocentric(date,planet){
  const T=(date.getTime()/86400000+2440587.5-2451545)/36525;
  const a=val(planet.a,T),e=val(planet.e,T);
  const I=val(planet.I,T)*radians,N=val(planet.N,T)*radians;
  const w=(val(planet.p,T)-val(planet.N,T))*radians;
  const M=((val(planet.L,T)-val(planet.p,T))%360)*radians;
  let E=M;for(let i=0;i<12;i++){const d=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));E-=d;if(Math.abs(d)<1e-12)break;}
  const xp=a*(Math.cos(E)-e),yp=a*Math.sqrt(1-e*e)*Math.sin(E);
  const x=(Math.cos(w)*Math.cos(N)-Math.sin(w)*Math.sin(N)*Math.cos(I))*xp+(-Math.sin(w)*Math.cos(N)-Math.cos(w)*Math.sin(N)*Math.cos(I))*yp;
  const y=(Math.cos(w)*Math.sin(N)+Math.sin(w)*Math.cos(N)*Math.cos(I))*xp+(-Math.sin(w)*Math.sin(N)+Math.cos(w)*Math.cos(N)*Math.cos(I))*yp;
  return {x,y,angle:Math.atan2(y,x),distance:Math.hypot(x,y)};
}
export function lunarPhase(date){
  // Reference near new moon: 2000-01-06 18:14 UTC.
  const synodic=29.530588853;
  const age=((date.getTime()-Date.UTC(2000,0,6,18,14))/86400000%synodic+synodic)%synodic;
  const fraction=age/synodic;
  const illumination=(1-Math.cos(2*Math.PI*fraction))/2;
  const names=['New Moon','Waxing Crescent','First Quarter','Waxing Gibbous','Full Moon','Waning Gibbous','Last Quarter','Waning Crescent'];
  const phaseName=names[Math.floor((fraction+1/16)*8)%8];
  return {age,fraction,illumination,phaseName};
}
