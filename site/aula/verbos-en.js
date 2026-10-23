/* Verbos en inglés generados · Tu profe por el mundo
   Ejercicios de huecos que no se agotan para la práctica diaria del inglés: un verbo, una persona y un tiempo del nivel que toca.
   Todas las formas están escritas a mano (base · 3.ª persona · pasado · participio · -ing); «a/b» marca dos formas válidas.
   Cada ejercicio tiene un id estable (ve.verbo.tiempo.persona) para que el repaso espaciado lo recuerde. */

const VE_P=['I','you','she','we','they'];
/* lv = nivel del MCER en el que se trabaja el tiempo (0 = A1 … 5 = C2) */
const VE_TENSES=[
 {k:'pres',lv:0,n:'present simple'},
 {k:'cont',lv:0,n:'present continuous'},
 {k:'past',lv:1,n:'past simple'},
 {k:'pcont',lv:1,n:'past continuous'},
 {k:'pperf',lv:2,n:'present perfect'},
 {k:'plup',lv:3,n:'past perfect'},
 {k:'pperfc',lv:3,n:'present perfect continuous'},
 {k:'cond3',lv:4,n:'would + perfect'},
 {k:'modp',lv:5,n:'should + perfect'}
];
const veW=s=>s.split(' ');
/* irr = pasado o participio irregular */
const VE_V={
 go:veW('go goes went gone going'),have:veW('have has had had having'),do:veW('do does did done doing'),
 make:veW('make makes made made making'),take:veW('take takes took taken taking'),come:veW('come comes came come coming'),
 see:veW('see sees saw seen seeing'),get:veW('get gets got got/gotten getting'),give:veW('give gives gave given giving'),
 know:veW('know knows knew known knowing'),think:veW('think thinks thought thought thinking'),buy:veW('buy buys bought bought buying'),
 bring:veW('bring brings brought brought bringing'),write:veW('write writes wrote written writing'),read:veW('read reads read read reading'),
 eat:veW('eat eats ate eaten eating'),drink:veW('drink drinks drank drunk drinking'),speak:veW('speak speaks spoke spoken speaking'),
 find:veW('find finds found found finding'),leave:veW('leave leaves left left leaving'),feel:veW('feel feels felt felt feeling'),
 begin:veW('begin begins began begun beginning'),swim:veW('swim swims swam swum swimming'),run:veW('run runs ran run running'),
 sleep:veW('sleep sleeps slept slept sleeping'),teach:veW('teach teaches taught taught teaching'),catch:veW('catch catches caught caught catching'),
 choose:veW('choose chooses chose chosen choosing'),forget:veW('forget forgets forgot forgotten forgetting'),break:veW('break breaks broke broken breaking'),
 win:veW('win wins won won winning'),lose:veW('lose loses lost lost losing'),pay:veW('pay pays paid paid paying'),
 send:veW('send sends sent sent sending'),spend:veW('spend spends spent spent spending'),understand:veW('understand understands understood understood understanding'),
 meet:veW('meet meets met met meeting'),sell:veW('sell sells sold sold selling'),tell:veW('tell tells told told telling'),
 fly:veW('fly flies flew flown flying'),wear:veW('wear wears wore worn wearing'),drive:veW('drive drives drove driven driving'),
 put:veW('put puts put put putting'),learn:veW('learn learns learned/learnt learned/learnt learning'),
 work:veW('work works worked worked working'),play:veW('play plays played played playing'),study:veW('study studies studied studied studying'),
 watch:veW('watch watches watched watched watching'),live:veW('live lives lived lived living'),stop:veW('stop stops stopped stopped stopping'),
 travel:veW('travel travels travelled/traveled travelled/traveled travelling/traveling'),try:veW('try tries tried tried trying'),
 visit:veW('visit visits visited visited visiting'),finish:veW('finish finishes finished finished finishing'),plan:veW('plan plans planned planned planning'),
 listen:veW('listen listens listened listened listening'),cook:veW('cook cooks cooked cooked cooking'),carry:veW('carry carries carried carried carrying'),
 dance:veW('dance dances danced danced dancing'),open:veW('open opens opened opened opening')
};
const VE_VERBS=Object.keys(VE_V);
const veIrr=v=>{const f=VE_V[v];return !/ed(\/|$)/.test(f[2])||!/ed(\/|$)/.test(f[3])};
const veAlt=f=>f.split('/');
/* Respuestas válidas de un verbo, un tiempo y una persona (p: 0 I · 1 you · 2 she · 3 we · 4 they) */
function veAnswers(v,k,p){
  const [b,s3,pa,pp,ing]=VE_V[v],sg=p===2,i=p===0;
  const pre=(aux,f)=>veAlt(f).map(x=>aux+x);
  switch(k){
   case 'pres':return [sg?s3:b];
   case 'cont':return pre(i?'am ':sg?'is ':'are ',ing);
   case 'past':return veAlt(pa);
   case 'pcont':return pre(i||sg?'was ':'were ',ing);
   case 'pperf':return pre(sg?'has ':'have ',pp);
   case 'plup':return pre('had ',pp);
   case 'pperfc':return pre(sg?'has been ':'have been ',ing);
   case 'cond3':return pre('would have ',pp);
   case 'modp':return pre('should have ',pp);
  }
  return null;
}
function veItem(id){
  const m=/^ve\.([a-z]+)\.([a-z0-9]+)\.([0-4])$/.exec(id);if(!m)return null;
  const [,v,k,ps]=m,tn=VE_TENSES.find(x=>x.k===k);if(!tn||!VE_V[v])return null;
  const p=+ps;
  return {id,lv:tn.lv,sk:'gram',t:'gap',gen:true,irr:veIrr(v),q:VE_P[p]+' ___ ('+v+' · '+tn.n+')',a:veAnswers(v,k,p)};
}
/* Lista de ids posibles entre dos niveles (incluidos) */
function veIds(maxLv,minLv){
  const out=[];
  VE_TENSES.forEach(tn=>{if(tn.lv>maxLv||tn.lv<(minLv||0))return;VE_VERBS.forEach(v=>{for(let p=0;p<5;p++)out.push('ve.'+v+'.'+tn.k+'.'+p)})});
  return out;
}
