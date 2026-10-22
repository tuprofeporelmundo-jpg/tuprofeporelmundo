/* Conjugación generada · Tu profe por el mundo
   Ejercicios de huecos que no se agotan: un verbo, una persona y un tiempo, del nivel que toca.
   Los regulares se conjugan por reglas; los irregulares llevan sus formas escritas a mano.
   Cada ejercicio tiene un id estable (cj.verbo.tiempo.persona) para que el repaso espaciado lo recuerde. */

const CJ_P=['yo','tú','él / ella','nosotros','vosotros','ellos / ellas'];
/* lv = nivel del MCER en el que se trabaja el tiempo (0 = A1 … 5 = C2) */
const CJ_TENSES=[
 {k:'pres',lv:0,n:'presente'},
 {k:'indef',lv:1,n:'pretérito indefinido'},
 {k:'imperf',lv:1,n:'pretérito imperfecto'},
 {k:'perf',lv:1,n:'pretérito perfecto'},
 {k:'fut',lv:2,n:'futuro'},
 {k:'cond',lv:2,n:'condicional'},
 {k:'subj',lv:2,n:'presente de subjuntivo'},
 {k:'impsubj',lv:3,n:'pretérito imperfecto de subjuntivo'},
 {k:'plusc',lv:3,n:'pretérito pluscuamperfecto'},
 {k:'futperf',lv:4,n:'futuro perfecto'},
 {k:'condperf',lv:4,n:'condicional compuesto'},
 {k:'pluscsubj',lv:5,n:'pretérito pluscuamperfecto de subjuntivo'}
];
const CJ_REG=['hablar','trabajar','estudiar','comprar','cocinar','escuchar','comer','beber','aprender','vender','vivir','recibir','decidir','abrir','escribir'];
const cjW=s=>s.split(' ');
/* indefS = raíz del indefinido fuerte (tuv-e, tuv-iste…); fut = raíz del futuro y del condicional */
const CJ_IRR={
 ser:{pres:cjW('soy eres es somos sois son'),indef:cjW('fui fuiste fue fuimos fuisteis fueron'),imperf:cjW('era eras era éramos erais eran'),subj:cjW('sea seas sea seamos seáis sean')},
 estar:{pres:cjW('estoy estás está estamos estáis están'),indefS:'estuv',subj:cjW('esté estés esté estemos estéis estén')},
 tener:{pres:cjW('tengo tienes tiene tenemos tenéis tienen'),indefS:'tuv',fut:'tendr',subj:cjW('tenga tengas tenga tengamos tengáis tengan')},
 ir:{pres:cjW('voy vas va vamos vais van'),indef:cjW('fui fuiste fue fuimos fuisteis fueron'),imperf:cjW('iba ibas iba íbamos ibais iban'),subj:cjW('vaya vayas vaya vayamos vayáis vayan')},
 hacer:{pres:cjW('hago haces hace hacemos hacéis hacen'),indef:cjW('hice hiciste hizo hicimos hicisteis hicieron'),fut:'har',subj:cjW('haga hagas haga hagamos hagáis hagan'),pp:'hecho'},
 poder:{pres:cjW('puedo puedes puede podemos podéis pueden'),indefS:'pud',fut:'podr',subj:cjW('pueda puedas pueda podamos podáis puedan')},
 querer:{pres:cjW('quiero quieres quiere queremos queréis quieren'),indefS:'quis',fut:'querr',subj:cjW('quiera quieras quiera queramos queráis quieran')},
 decir:{pres:cjW('digo dices dice decimos decís dicen'),indef:cjW('dije dijiste dijo dijimos dijisteis dijeron'),fut:'dir',subj:cjW('diga digas diga digamos digáis digan'),pp:'dicho'},
 venir:{pres:cjW('vengo vienes viene venimos venís vienen'),indefS:'vin',fut:'vendr',subj:cjW('venga vengas venga vengamos vengáis vengan')},
 poner:{pres:cjW('pongo pones pone ponemos ponéis ponen'),indefS:'pus',fut:'pondr',subj:cjW('ponga pongas ponga pongamos pongáis pongan'),pp:'puesto'},
 saber:{pres:cjW('sé sabes sabe sabemos sabéis saben'),indefS:'sup',fut:'sabr',subj:cjW('sepa sepas sepa sepamos sepáis sepan')},
 salir:{pres:cjW('salgo sales sale salimos salís salen'),fut:'saldr',subj:cjW('salga salgas salga salgamos salgáis salgan')}
};
const CJ_PP={abrir:'abierto',escribir:'escrito'};
const CJ_VERBS=CJ_REG.concat(Object.keys(CJ_IRR));
const CJ_HABER={perf:cjW('he has ha hemos habéis han'),plusc:cjW('había habías había habíamos habíais habían'),futperf:cjW('habré habrás habrá habremos habréis habrán'),condperf:cjW('habría habrías habría habríamos habríais habrían'),pluscsubj:cjW('hubiera hubieras hubiera hubiéramos hubierais hubieran'),pluscsubjB:cjW('hubiese hubieses hubiese hubiésemos hubieseis hubiesen')};

function cjForms(v,k){
  const x=CJ_IRR[v]||{},stem=v.slice(0,-2),e=v.slice(-2);
  const pp=x.pp||CJ_PP[v]||stem+(e==='ar'?'ado':'ido');
  if(Array.isArray(x[k]))return x[k];
  if(CJ_HABER[k])return CJ_HABER[k].map(h=>h+' '+pp);
  switch(k){
   case 'pres':return (e==='ar'?cjW('o as a amos áis an'):e==='er'?cjW('o es e emos éis en'):cjW('o es e imos ís en')).map(t=>stem+t);
   case 'indef':
    if(x.indefS)return cjW('e iste o imos isteis ieron').map(t=>x.indefS+t);
    return (e==='ar'?cjW('é aste ó amos asteis aron'):cjW('í iste ió imos isteis ieron')).map(t=>stem+t);
   case 'imperf':return (e==='ar'?cjW('aba abas aba ábamos abais aban'):cjW('ía ías ía íamos íais ían')).map(t=>stem+t);
   case 'fut':return cjW('é ás á emos éis án').map(t=>(x.fut||v)+t);
   case 'cond':return cjW('ía ías ía íamos íais ían').map(t=>(x.fut||v)+t);
   case 'subj':return (e==='ar'?cjW('e es e emos éis en'):cjW('a as a amos áis an')).map(t=>stem+t);
   case 'impsubj':case 'impsubjB':{
    const b=cjForms(v,'indef')[5].slice(0,-3),acc=b.slice(0,-1)+({a:'á',e:'é'})[b.slice(-1)];
    return k==='impsubj'?[b+'ra',b+'ras',b+'ra',acc+'ramos',b+'rais',b+'ran']:[b+'se',b+'ses',b+'se',acc+'semos',b+'seis',b+'sen'];
   }
  }
  return null;
}
/* Respuestas válidas: la forma principal y, en el imperfecto de subjuntivo, también la forma en -se */
function cjAnswers(v,k,p){
  const a=[cjForms(v,k)[p]];
  if(k==='impsubj')a.push(cjForms(v,'impsubjB')[p]);
  if(k==='pluscsubj')a.push(CJ_HABER.pluscsubjB[p]+' '+cjForms(v,'perf')[0].split(' ')[1]);
  return a;
}
function cjItem(id){
  const m=/^cj\.([a-z]+)\.([a-z]+)\.([0-5])$/.exec(id);if(!m)return null;
  const [,v,k,ps]=m,tn=CJ_TENSES.find(x=>x.k===k);if(!tn||!CJ_VERBS.includes(v))return null;
  const p=+ps;
  return {id,lv:tn.lv,sk:'gram',t:'gap',gen:true,irr:!!CJ_IRR[v],q:CJ_P[p]+' ___ ('+v+' · '+tn.n+')',a:cjAnswers(v,k,p)};
}
/* Lista de ids posibles hasta un nivel (incluido) */
function cjIds(maxLv,minLv){
  const out=[];
  CJ_TENSES.forEach(tn=>{if(tn.lv>maxLv||tn.lv<(minLv||0))return;CJ_VERBS.forEach(v=>{for(let p=0;p<6;p++)out.push('cj.'+v+'.'+tn.k+'.'+p)})});
  return out;
}
