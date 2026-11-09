/* Stylised educational dynamics, not an estimated MARTIN solver.
   Quarterly supply-pressure decay: 0.72; inflation persistence: 0.92.
   Inflation target: 2.5%; game neutral nominal rate: 4.0%.
   Monetary stance adjusts gradually (20% per quarter) to the rate level.
   These coefficients are transparent game calibration assumptions. */
(function(root){
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const initial=()=>({rate:4.85,inflation:4.2,unemployment:4.5,gdp:100,aud:100,housing:100,wellbeing:68,standing:65,oil:140,freight:125,pressure:0,supplyPressure:0,policyStance:0,aiInvestment:100,adoption:0,election:null});


// Fictional event shocks, not party forecasts or MARTIN estimates.
function event(s,r){
 const fast=s.election==='republican', exposed=Math.max(0,(s.aiInvestment||100)-100)/100,adopt=(s.adoption||0)/100;
 if(r===3)return fast?{title:'The AI boom gets a green light.',tag:'REPUBLICAN MIDTERM WIN',text:'Continued AI funding sends investment higher. Australian data centres compete for power, capital and workers.',chip:'AI FUNDING ↑ · POWER DEMAND ↑',inflation:.65,gdp:2.2,u:-.45,aud:2,housing:1,investment:40,adoption:15,fallout:'Capital pours in. Power bills follow.',body:'AI construction and hiring lift activity, but scarce electricity and skilled labour push costs higher.'}:{title:'The AI boom hits the brakes.',tag:'DEMOCRATIC MIDTERM WIN',text:'Tighter AI restrictions slow investment. Australian suppliers lose contracts, while power-demand pressures ease.',chip:'AI INVESTMENT ↓ · EXPANSION SLOWS',inflation:-.7,gdp:-1.3,u:.55,aud:-2,housing:-1,investment:-25,adoption:5,fallout:'Less heat. Fewer new jobs.',body:'Lower AI spending eases capacity pressures, but suppliers and construction workers lose opportunities.'};
 if(r===4)return {title:'The chip supply line snaps.',tag:'THE CHIP STANDOFF',text:fast?'Your funding boom meets a semiconductor export blockade. Half-built data centres face delays and expensive hardware.':'The same chip blockade hits a smaller AI sector. Your slower investment path limits exposure, but imports still cost more.',chip:'CHIP EXPORTS RESTRICTED · HARDWARE COSTS ↑',inflation:.65+exposed*.8,gdp:-1.1-exposed*1.7,u:.35+exposed*.45,aud:-2,housing:-1,investment:-15-exposed*15,adoption:-3,fallout:'Big plans. Missing chips.',body:fast?'The investment boom made this blockade more painful. Delays spread through data centres, contractors and supply chains.':'The smaller AI build-out absorbs less damage. Equipment shortages still squeeze firms and imported goods.'};
 if(r===5)return {title:'AGI leaves the lab.',tag:'THE AGI BREAKTHROUGH',text:fast?'A claimed AGI breakthrough reaches commercial users. Your earlier investment speeds adoption—output surges, and so does demand for energy.':'A claimed AGI breakthrough reaches commercial users. Tighter deployment rules slow adoption, cushioning disruption but delaying productivity gains.',chip:'AGI DEPLOYMENT · PRODUCTIVITY ↑',inflation:fast?-.7:-.45,gdp:fast?3.5:1.8,u:fast?.45:.2,aud:fast?3:1,housing:1,investment:fast?25:10,adoption:fast?45:22,fallout:'More output. An uncertain workforce.',body:fast?'Faster adoption lifts productive capacity and lowers some costs. A fresh infrastructure rush competes with workers already facing automation.':'Slower deployment delivers smaller productivity gains, with more time for workers and firms to adjust.'};
 return {title:'The productivity boom gets personal.',tag:'THE AUTOMATION RECKONING',text:adopt>.4?'AGI spreads through office work. Profits rise, but layoffs hit household spending. Your faster adoption path makes the adjustment sharper.':'Automation reaches more firms. Layoffs rise, though slower adoption has given workers more breathing room.',chip:'LAYOFFS ↑ · CONSUMPTION UNDER PRESSURE',inflation:-.6-adopt*.5,gdp:-.3-adopt*.8,u:.4+adopt*1.2,aud:-1,housing:-2,investment:-5,adoption:10,fallout:'The gains arrive unevenly.',body:'Cheaper output helps consumers, but displaced workers lose income. Interest rates can support demand; they cannot retrain the workforce.'};
}

function simulate(s,delta,round){
 if(!Number.isFinite(delta)||s.rate+delta<0||s.rate+delta>12)throw new Error('Cash rate must stay between 0% and 12%.');
 const shock=round>2?event(s,round):round===1?{inflation:.8,gdp:-.9,u:.35,aud:-3,housing:-1}:{inflation:2.8,gdp:-3.2,u:1.1,aud:-9,housing:-5};
 const rate=+(s.rate+delta).toFixed(2),path=[{inflation:s.inflation,gdp:s.gdp,unemployment:s.unemployment}];
 let inflation=s.inflation,gdp=s.gdp,unemployment=s.unemployment;
 let supply=s.supplyPressure||0,stance=s.policyStance||0;
 for(let q=1;q<=8;q++){
  // Each event arrives once; its effect does not permanently raise inflation.
  if(q===1)supply+=shock.inflation;
  stance=.8*stance+.2*(rate-4.0);
  inflation=clamp(2.5+.92*(inflation-2.5)+.30*supply-.035*stance,-5,40);
  supply*=.72;
  gdp*=1+(shock.gdp/8-.04*stance)/100;
  unemployment=clamp(4.2+.96*(unemployment-4.2)+shock.u/8+.012*stance,0,30);
  path.push({inflation,gdp,unemployment});
 }
 let n={...s,inflation,gdp,unemployment,rate,supplyPressure:supply,policyStance:stance,pressure:0,
 aud:clamp(s.aud+shock.aud+delta*2,40,160),housing:clamp(s.housing+shock.housing-delta*3.5-.3*stance,30,200),
 oil:round===1?155:round===2?240:100+(s.oil-100)*.9**8,
 freight:round===1?140:round===2?210:100+(s.freight-100)*.9**8,
 aiInvestment:clamp((s.aiInvestment||100)+(shock.investment||0)-delta*3-.5*stance,10,400),adoption:clamp((s.adoption||0)+(shock.adoption||0),0,100)};
 n.wellbeing=clamp(100-6*Math.max(0,n.inflation-2.5)-9*Math.max(0,n.unemployment-4)-3*Math.max(0,n.rate-4.85)-(round>=2?8:0),0,100);
 n.standing=clamp(85-5*Math.abs(n.inflation-2.5)-3*Math.max(0,n.unemployment-4)-2*Math.abs(delta)-(round>=2?7:0),0,100);
 return {state:n,path,shock,delta};
}
// Compare policy performance with a full-campaign hold-rate counterfactual.
// Replaying the same election branch preserves exogenous scenario severity,
// while allowing policy-driven investment/adoption exposure to differ.
function score(s,history=[]){
 let reference=initial();
 for(const h of history){reference.election=h.before.election||s.election||null;reference=simulate(reference,0,h.round).state;}
 const inflationGain=Math.abs(reference.inflation-2.5)-Math.abs(s.inflation-2.5);
 const jobsGain=reference.unemployment-s.unemployment;
 const debtGain=reference.rate-s.rate;
 const outputGain=100*(s.gdp/reference.gdp-1);
 const price=clamp(75+8*inflationGain,0,100);
 const human=clamp(75+8*jobsGain+3*debtGain+2*outputGain,0,100);
 const global=clamp(75+4*inflationGain+4*jobsGain-2*Math.abs(s.rate-reference.rate),0,100);
 return {price:Math.round(price),human:Math.round(human),global:Math.round(global),total:Math.round(price*.4+human*.4+global*.2)};
}
const api={initial,simulate,score,clamp,event};root.Economy=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
