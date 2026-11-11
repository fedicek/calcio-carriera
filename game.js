"use strict";
const KEY="carriera_save",N_SETT=14;
const SQUADRE=["Atletico Riva","Sporting Valle","Virtus Monte","Union Porto","Calcio Rosa","Olimpia Sud","Fortitudo"];
const SCELTE=[
 {ic:"💪",t:"Allenamento extra",fx:{f:8,e:-20,h:-3}},
 {ic:"😴",t:"Riposo totale",fx:{e:25,h:3}},
 {ic:"🍕",t:"Serata con gli amici",fx:{h:12,e:-10,soldi:-150}},
 {ic:"📱",t:"Sponsor social",fx:{fama:6,e:-8,soldi:400}},
 {ic:"🧘",t:"Fisioterapia",fx:{e:12,f:2,soldi:-100}},
 {ic:"🛍️",t:"Shopping di lusso",fx:{h:9,fama:2,soldi:-350}}
];
const ETI={f:"Forma",e:"Energia",h:"Felicità",fama:"Fama",soldi:"€"};
const FILLER=["Gioco spezzettato a centrocampo.","Fallo a metà campo, punizione.","Le squadre si studiano, ritmo alto.","Cross dalla fascia, la difesa spazza.","Il pubblico spinge la squadra di casa."];
const NOI_FALLITA=["Occasione per noi: palla di poco a lato.","Tiro forte, ma il portiere respinge.","Un attimo di ritardo e l'occasione svanisce."];
const $=id=>document.getElementById(id);
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const rnd=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const euro=n=>"€ "+Math.round(n).toLocaleString("it-IT");
const sign=n=>(n>0?"+":"−")+Math.abs(n);
const ini=s=>s.split(" ").map(p=>p[0]).join("").slice(0,2).toUpperCase();
const gp=f=>{let n=0;for(let i=0;i<5;i++)if(Math.random()<.12+f/400)n++;return n};
const chip=(k,v)=>'<em class="'+(v>0?"up":"dn")+'">'+(k==="soldi"?sign(v)+" €":ETI[k]+" "+sign(v))+"</em>";

let g=null,sel=-1;
try{g=JSON.parse(localStorage.getItem(KEY))}catch(e){}
const salva=()=>localStorage.setItem(KEY,JSON.stringify(g));

function nuovaLega(){
 g.lega={};
 [g.squadra,...SQUADRE].forEach(n=>g.lega[n]={pt:0,g:0,gf:0,gs:0});
}
function tabella(){
 return Object.entries(g.lega).map(([n,t])=>({n,...t}))
  .sort((a,b)=>b.pt-a.pt||(b.gf-b.gs)-(a.gf-a.gs)||b.gf-a.gf);
}
function opp(){const i=(g.sett-1)%7;return{nome:SQUADRE[i],forza:38+i*4}}

function render(){
 $("avatar").textContent=ini(g.nome);
 $("pn").textContent=g.nome;
 $("pm").textContent=g.squadra+" · "+g.eta+" anni";
 $("ovr").textContent=Math.round(45+g.f*.5);
 $("sub").textContent="Stagione "+g.stag+" · G."+g.sett+"/"+N_SETT;
 $("soldi").textContent=euro(g.soldi);
 $("gol").textContent=g.gol;
 const R=[["Energia",g.e,"var(--green)"],["Forma",g.f,"var(--blue)"],["Felicità",g.h,"var(--gold)"],["Fama",g.fama,"#b57cff"]];
 $("stats").innerHTML=R.map(r=>'<div class="stat"><div class="ring" style="--v:'+r[1]+';--c:'+r[2]+'"><b>'+r[1]+'</b></div>'+r[0]+'</div>').join("");
 $("choices").innerHTML=SCELTE.map((s,i)=>
  '<button class="choice'+(i===sel?" on":"")+'" data-i="'+i+'"><span class="ic">'+s.ic+'</span><b>'+s.t+'</b><span class="fx">'+
  Object.entries(s.fx).map(([k,v])=>chip(k,v)).join("")+'</span></button>').join("");
 document.querySelectorAll(".choice").forEach(b=>b.onclick=()=>{sel=+b.dataset.i;render()});
 $("tab").innerHTML=tabella().map((r,i)=>{
  const d=r.gf-r.gs;
  return '<tr class="'+(r.n===g.squadra?"me":"")+'"><td>'+(i+1)+'</td><td>'+r.n+'</td><td>'+r.g+'</td><td>'+(d>0?"+":"")+d+'</td><td><b>'+r.pt+'</b></td></tr>';
 }).join("");
 $("next").textContent="Prossima: giornata "+g.sett+" contro "+opp().nome;
 $("go").disabled=sel<0;
}

function avvia(){
 const sc=SCELTE[sel],o=opp();
 const snap={e:g.e,f:g.f,h:g.h,fama:g.fama,soldi:g.soldi};
 for(const k in sc.fx){
  if(k==="soldi")g.soldi=Math.max(0,g.soldi+sc.fx[k]);
  else g[k]=clamp(g[k]+sc.fx[k]);
 }
 const power=g.f*.5+g.e*.25+g.h*.25;
 const pNoi=clamp(.5+(45+(power-50)*.35-o.forza)/150,.25,.75);
 const m={noi:0,loro:0,gol:0,voto:6};
 const MIN=[6,18,29,41,52,63,74,85],DEC=5,hasDec=Math.random()<.85;
 let i=0;

 function ev(min,txt,cl){
  const d=document.createElement("div");d.className="ev "+(cl||"");
  const t=document.createElement("time");t.textContent=min+"'";
  const p=document.createElement("p");p.textContent=txt;
  d.append(t,p);$("feed").prepend(d);
 }
 function agg(min){
  $("sc").textContent=m.noi+" - "+m.loro;
  $("mn").textContent=min+"'";
  $("pg").style.width=Math.min(100,min/90*100)+"%";
 }
 function occasione(min){
  if(Math.random()>.55){ev(min,pick(FILLER));return}
  if(Math.random()<pNoi){
   if(Math.random()<.45){
    m.noi++;
    if(Math.random()<.25+g.f/250){m.gol++;g.gol++;m.voto+=1.2;ev(min,"⚽ GOL! "+g.nome+" la butta dentro!","goal")}
    else{m.voto+=.4;ev(min,"⚽ GOL! Un tuo compagno segna su tuo cross.","goal")}
   }else{m.voto-=.1;ev(min,pick(NOI_FALLITA))}
  }else{
   if(Math.random()<.4){m.loro++;m.voto-=.2;ev(min,"🥅 Gol degli avversari. Si complica.","bad")}
   else ev(min,"🧤 Pericolo! Parata del nostro portiere.");
  }
 }
 function decisione(min){
  ev(min,Math.random()<.5?"🎯 RIGORE per noi! Sul dischetto vai tu, "+g.nome+".":"⚡ CONTROPIEDE! Sei solo davanti al portiere.");
  const pP=Math.min(.9,.25+g.f/160),pC=Math.min(.9,.4+g.e/300+g.h/500);
  const d=$("dec");
  d.innerHTML='<h4>Momento chiave! Come concludi?</h4><div class="two">'+
   '<button class="opt" data-p="'+pP+'">💥 Potenza<small>dipende dalla Forma</small></button>'+
   '<button class="opt" data-p="'+pC+'">🎯 Precisione<small>Energia e Morale</small></button></div>';
  d.hidden=false;
  d.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{
   d.hidden=true;
   if(Math.random()<parseFloat(b.dataset.p)){m.noi++;m.gol++;g.gol++;m.voto+=1.5;ev(min,"⚽ GOL!! Esplode lo stadio, "+g.nome+" non sbaglia!","goal")}
   else{m.voto-=.4;ev(min,pick(["🧤 Parato! Il portiere ci arriva.","😬 Palla fuori di un soffio."]),"bad")}
   agg(min);i++;setTimeout(step,1100);
  });
 }
 function step(){
  if(i>=MIN.length)return fine();
  const min=MIN[i];agg(min);
  if(i===DEC&&hasDec){decisione(min);return}
  occasione(min);agg(min);i++;setTimeout(step,1100);
 }
 function fine(){
  agg(90);
  const esito=m.noi>m.loro?"V":m.noi<m.loro?"S":"P";
  ev(90,"🏁 Fischio finale: "+m.noi+" - "+m.loro+".");
  const reg=(n,a,b)=>{const t=g.lega[n];if(!t)return;t.g++;t.gf+=a;t.gs+=b;t.pt+=a>b?3:a===b?1:0};
  reg(g.squadra,m.noi,m.loro);reg(o.nome,m.loro,m.noi);
  const altre=SQUADRE.filter(n=>n!==o.nome).sort(()=>Math.random()-.5);
  for(let k=0;k+1<altre.length;k+=2){
   const a=altre[k],b=altre[k+1];
   const ga=gp(38+SQUADRE.indexOf(a)*4),gb=gp(38+SQUADRE.indexOf(b)*4);
   reg(a,ga,gb);reg(b,gb,ga);
  }
  const voto=clamp(m.voto+rnd(-.3,.3),4,10);
  g.e=clamp(g.e-15);
  g.h=clamp(g.h+(esito==="V"?6:esito==="P"?1:-5));
  g.fama=clamp(g.fama+Math.round((voto-6)*1.2)+(esito==="V"?1:0));
  g.soldi+=200+g.fama*8;
  let nota="Salvataggio automatico ✓",ritirato=false;
  g.sett++;
  if(g.sett>N_SETT){
   const pos=tabella().findIndex(r=>r.n===g.squadra)+1;
   g.eta++;g.sett=1;g.stag++;nuovaLega();
   nota="🏁 Fine stagione: chiudi "+pos+"° in classifica! Compleanno: ora hai "+g.eta+" anni.";
   if(g.eta>36){
    ritirato=true;
    nota="🏆 Dopo "+(g.stag-1)+" stagioni ti ritiri con "+g.gol+" gol in carriera. Sei una leggenda!";
   }
  }
  if(ritirato)localStorage.removeItem(KEY);else salva();
  const chips=Object.keys(snap).map(k=>{
   const d=Math.round((k==="soldi"?g.soldi:g[k])-snap[k]);
   return d?chip(k,d):"";
  }).join("");
  const titolo=esito==="V"?"🏆 Vittoria!":esito==="P"?"🤝 Pareggio":"😞 Sconfitta";
  $("end").innerHTML='<h4>'+titolo+' '+m.noi+' - '+m.loro+'</h4>'+
   '<div class="voto"><span>Il tuo voto</span><b>'+voto.toFixed(1)+'</b></div>'+
   (m.gol?'<p class="note">⚽ Hai segnato '+m.gol+(m.gol>1?" gol!":" gol!")+'</p>':"")+
   '<div class="fx">'+chips+'</div><p class="note">'+nota+'</p>'+
   '<button class="cta" id="cont">'+(ritirato?"Torna al menu":"Continua")+'</button>';
  $("end").hidden=false;
  $("cont").onclick=()=>{
   if(ritirato){location.replace("index.html");return}
   $("match").hidden=true;sel=-1;render();window.scrollTo(0,0);
  };
 }

 $("feed").innerHTML="";$("dec").hidden=true;$("end").hidden=true;
 $("cA").textContent=ini(g.squadra);$("cB").textContent=ini(o.nome);
 $("nA").textContent=g.squadra;$("nB").textContent=o.nome;
 $("match").hidden=false;
 agg(0);
 ev(0,"Fischio d'inizio! Giornata "+g.sett+" contro "+o.nome+".");
 setTimeout(step,1200);
}

function init(){
 g.nome=g.nome||"Giocatore";g.squadra=g.squadra||"Real Borgo U17";
 if(typeof g.soldi!=="number")g.soldi=500;
 g.gol=g.gol||0;g.stag=g.stag||1;
 if(!g.sett||g.sett>N_SETT)g.sett=1;
 if(!g.lega)nuovaLega();
 $("go").onclick=avvia;
 render();
}
if(!g)location.replace("index.html");else init();
