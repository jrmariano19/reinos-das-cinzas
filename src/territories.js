/**
 * REINOS DAS CINZAS — territórios e zonas seguras v0.1.
 * Adaptação autoral do GDD "Módulo de Cidades, Territórios e Urbanismo".
 * Estados "planned" NÃO significam mapas jogáveis: apenas a Valdoria atual
 * e a Vila das Lanternas existem no mundo real (index.html).
 * Módulo puro, sem DOM/servidor/localStorage.
 */
export const TERRITORY_SYSTEM_VERSION='0.1.0';

export const SETTLEMENTS=Object.freeze([
  {
    id:'valdoria',name:'Valdoria, Fortaleza das Cinzas',type:'capital',faction:'legiao',
    status:'playable',levelRange:[1,20],
    region:'Bastião e Ermos Cinzentos',
    visual:'Basalto escuro, cobre envelhecido, muralhas e fornalhas sob luz âmbar.',
    theme:'Coração da Legião das Brasas. Comércio, defesa das muralhas e profissão de ferreiro.',
    services:['forge','market','quest','guild'],
    districts:[
      {id:'praca',name:'Praça da Coroa de Brasa',purpose:'Encontro social, fonte e informações'},
      {id:'oficios',name:'Rua dos Ofícios',purpose:'Forja, Aging, Mixing e mercado'},
      {id:'juramentos',name:'Pátio dos Juramentos',purpose:'Quartel, guildas e promoções de classe'},
      {id:'portao',name:'Portão das Cinzas',purpose:'Saída para os Ermos Cinzentos'}
    ],
    links:[{to:'lanternas',kind:'existing'},{to:'navira',kind:'planned'}]
  },
  {
    id:'noxara',name:'Noxara, Santuário do Véu',type:'capital',faction:'conclave',
    status:'planned',levelRange:[1,20],
    region:'Altiplanos Astrais',
    visual:'Pedra clara, prismas translúcidos, água luminosa e passarelas entre jardins elevados.',
    theme:'Capital do Conclave do Véu, erguida para estudar e conter a energia das cinzas astrais.',
    services:['rune-mastery','market','quest','guild','meditation'],
    districts:[
      {id:'pinaculo',name:'Pináculo do Véu',purpose:'Alquimia, runas e infusões mágicas'},
      {id:'jardins',name:'Jardins das Nascentes',purpose:'Meditação e recuperação de mana'},
      {id:'santuario',name:'Santuário da Vigília',purpose:'Promoções e mestres de classe'},
      {id:'portao-norte',name:'Arco da Aurora',purpose:'Saída para as fronteiras boreais'}
    ],
    links:[{to:'navira',kind:'planned'},{to:'cidadela-neutra',kind:'planned'}]
  },
  {
    id:'lanternas',name:'Vila das Lanternas',type:'village',faction:'neutral',
    status:'playable',levelRange:[1,20],
    region:'Vale das Lanternas',
    visual:'Casas de madeira, lanternas aquecidas, trilhas ribeirinhas e jardins.',
    theme:'Primeiro refúgio do aventureiro ao sair do Bastião.',
    services:['market','quest'],
    districts:[{id:'vila',name:'Núcleo da Vila',purpose:'Mercado e contratos de caça'}],
    links:[{to:'valdoria',kind:'existing'}]
  },
  {
    id:'navira',name:'Navira, Posto dos Penhascos',type:'outpost',faction:'neutral',
    status:'planned',levelRange:[20,40],
    region:'Passagens das Dunas de Cinza',
    visual:'Paliçadas, pedra vermelha e tendas sobre rotas de caravanas.',
    theme:'Entreposto de suprimentos de grupos que avançam para as áreas de nível intermediário.',
    services:['repair-basic','potions','inn','respawn'],
    districts:[{id:'posto',name:'Posto das Caravanas',purpose:'Reparo de nível baixo e ponto de retorno'}],
    links:[{to:'valdoria',kind:'planned'},{to:'noxara',kind:'planned'},{to:'marisma',kind:'planned'}]
  },
  {
    id:'marisma',name:'Marisma, Vila das Marés Ocultas',type:'outpost',faction:'neutral',
    status:'planned',levelRange:[40,70],
    region:'Pântanos da Névoa Velha',
    visual:'Palafitas, passarelas de madeira, musgo bioluminescente e canais encharcados.',
    theme:'Ponto de reunião para grupos antes das ruínas submersas.',
    services:['repair-specialist','potions','party-hub','market'],
    districts:[{id:'estacas',name:'Mercado das Estacas',purpose:'Encontros de grupo e comércio avançado'}],
    links:[{to:'navira',kind:'planned'},{to:'cidadela-neutra',kind:'planned'}]
  },
  {
    id:'cidadela-neutra',name:'Cidadela do Eclipse',type:'neutral-citadel',faction:'neutral',
    status:'planned',levelRange:[70,120],
    region:'Coração das Cinzas',
    visual:'Fortaleza monumental entre fossos de magma, torres e um grande salão de guildas.',
    theme:'Centro comercial neutro fora de eventos e palco de cercos competitivos no end-game.',
    services:['guild','auction','siege'],
    districts:[{id:'coroa',name:'Pátio da Coroa',purpose:'Comércio neutro e disputa de clãs'}],
    links:[{to:'noxara',kind:'planned'},{to:'marisma',kind:'planned'}]
  }
]);

export const SETTLEMENT_BY_ID=Object.freeze(Object.fromEntries(
  SETTLEMENTS.map(settlement=>[settlement.id,settlement])
));

/** Zonas seguras que EXISTEM no jogo atual; mantém suas coordenadas antigas. */
export function liveSafeSettlement(floor,x,y){
 if(!Number.isInteger(floor)||!Number.isInteger(x)||!Number.isInteger(y))return null;
 if(floor===0 && x>=3 && x<=53 && y>=3 && y<=39)return 'valdoria';
 if(floor===1 && x>=10 && x<=34 && y>=6 && y<=17)return 'lanternas';
 return null;
}

export function getSettlement(id){return SETTLEMENT_BY_ID[id]??null;}
export function visibleSettlements(includePlanned=false){
 return SETTLEMENTS.filter(x=>includePlanned || x.status==='playable');
}

export function locationServices(id){
 const settlement=getSettlement(id);
 if(!settlement)throw new RangeError('Localidade desconhecida');
 return [...settlement.services];
}

/**
 * Simula recuperação em unidades por segundo, sem arredondamento prematuro.
 * Regras de projeto: parado em território seguro = 2x taxa base.
 * A stamina RES ainda não é implementada no RPG legado.
 */
export function regenerationRates({safe=false,idle=false}={}){
 const multiplier=safe && idle?2:1;
 return Object.freeze({hp:multiplier*1,mp:multiplier*.5});
}

/**
 * Avança HP e MP em uma janela curta, mantendo precisão fracionária.
 * Não faz IO, não altera o objeto de entrada e nunca ultrapassa os máximos.
 * Se estiver andando, não regenera (regra de repouso).
 */
export function regenerateVitals(vitals,{seconds,idle,safe}){
 if(!vitals || !['hp','maxHp','mp','maxMp'].every(k=>
  Number.isFinite(vitals[k]) && vitals[k]>=0) ||
  vitals.maxHp<=0 || vitals.maxMp<=0 ||
  vitals.hp>vitals.maxHp || vitals.mp>vitals.maxMp){
   throw new TypeError('Atributos de regeneração inválidos');
 }
 if(!Number.isFinite(seconds) || seconds<0 || seconds>1){
   throw new RangeError('Janela de simulação inválida');
 }
 if(!idle || seconds===0)return {...vitals};
 const rates=regenerationRates({safe,idle});
 return {...vitals,
  hp:Math.min(vitals.maxHp,vitals.hp+seconds*rates.hp),
  mp:Math.min(vitals.maxMp,vitals.mp+seconds*rates.mp)};
}
