/** Catalogo original das oito classes de REINOS DAS CINZAS.
 * Dados de proposta v0.1: o jogo principal ainda utiliza o Cavaleiro legado.
 */
import {tierForLevel, LEVEL_CAP} from './class-balance.js';

export const FACTIONS = Object.freeze([
  {id:'legiao',name:'Legião das Brasas',home:'Valdoria',
    lore:'Guardiões, caçadores e mestres de ofício que reconstruíram as cidades após a Queda Cinzenta.'},
  {id:'conclave',name:'Conclave do Véu',home:'Santuário de Noxara',
    lore:'Eruditos e viajantes das ruínas que estudam a energia esquecida entre a luz e as cinzas.'}
]);
const register=(id,name,faction,role,weapon,attrs,hp,mp,atk,def,lore,group,economy,skills)=>Object.freeze({
  id,name,faction,role,weapon,attributes:Object.freeze(attrs),
  base:Object.freeze({hp,mp,attack:atk,defense:def}),lore,group,economy,
  skills:Object.freeze(skills.map((name,i)=>Object.freeze({
    id:id+'-t'+(i+1),name,tier:i+1,unlockLevel:[1,20,40,60,80][i]
  })))
});
export const CLASSES = Object.freeze([
  register('sentinela','Sentinela de Ferro','legiao','Tanque','Espada e escudo',
    {str:15,agi:9,int:7,vit:17,spr:12},240,80,18,30,
    'Escudos juramentados que defendem os portões de Valdoria.',
    'Controla a ameaça de chefes e protege aliados.','Valoriza escudos com bloqueio e armaduras resistentes.',
    ['Guarda da Brasa','Chamado do Bastião','Impacto do Escudo','Muralha Viva','Juramento das Cinzas']),
  register('colosso','Colosso da Forja','legiao','Dano corpo a corpo','Machado pesado',
    {str:19,agi:9,int:6,vit:16,spr:10},215,70,26,21,
    'Veteranos que lutam com aço escuro de antigas forjas.',
    'Aplica dano em área e reduz a defesa dos chefes.','Busca armas pesadas e consome mais reparos.',
    ['Corte de Escória','Giro da Forja','Ferro Rasgado','Ira da Fundição','Terremoto de Brasa']),
  register('vigia','Vigia das Fronteiras','legiao','Dano à distância','Arco',
    {str:10,agi:20,int:7,vit:11,spr:12},165,105,23,13,
    'Exploradores que protegem os caminhos e caravanas além da muralha.',
    'Dano constante em chefes, marcação e armadilhas.','Arcos de crítico e precisão são prioridade.',
    ['Tiro Marcado','Armadilha de Espinhos','Rajada Longa','Visão Predadora','Flecha da Aurora']),
  register('artifice','Artífice Rúnico','legiao','Controle de área','Besta rúnica',
    {str:10,agi:13,int:18,vit:9,spr:10},180,140,17,15,
    'Inventores de dispositivos alimentados pelas brasas das ruínas.',
    'Armadilhas, redução de resistência e controle de grupos.','Consome componentes artesanais, runas e sucata.',
    ['Estilhaço Rúnico','Mina Ardente','Campo Magnético','Quebra-Selo','Torre de Brasa']),
  register('arcanista','Arcanista do Eclipse','conclave','Mago de área','Cajado',
    {str:7,agi:9,int:21,vit:8,spr:15},140,210,24,9,
    'Estudiosos que convertem cinzas luminosas em tempestades arcanas.',
    'Dano em área intenso, mas exige proteção e recursos.','Alta procura de cajados e poções de mana.',
    ['Brasa Violeta','Anel Crepuscular','Chuva de Cinzas','Foco do Eclipse','Sol Negro']),
  register('devota','Devota da Aurora','conclave','Curandeira','Cetro',
    {str:8,agi:8,int:16,vit:10,spr:18},170,190,14,13,
    'Guardas dos antigos faróis que restauram a vida em meio à escuridão.',
    'Cura, remove efeitos e mantém grupos vivos.','Economiza poções e usa equipamento de regeneração.',
    ['Luz Restauradora','Selo da Vida','Purificar','Aurora Partilhada','Pacto do Renascer']),
  register('tecelao','Tecelão do Véu','conclave','Suporte e controle','Orbe',
    {str:8,agi:11,int:16,vit:10,spr:15},165,195,16,12,
    'Oráculos que ouvem ecos presos entre as cinzas de reinos perdidos.',
    'Amplifica dano aliado e enfraquece monstros.','Procura orbes e itens de espírito/cooldown.',
    ['Fio da Entropia','Eco de Vínculo','Prisão do Véu','Fraqueza da Alma','Sinfonia dos Ecos']),
  register('espectro','Lâmina Espectral','conclave','Assassino','Adagas',
    {str:12,agi:21,int:8,vit:9,spr:10},165,110,28,11,
    'Batedores que usam poeira e sombra para atacar alvos prioritários.',
    'Explosão de dano contra alvos únicos e mobilidade.','Busca adagas raras e equipamentos de crítico.',
    ['Lâmina de Sombra','Passo Fantasma','Ferida Profunda','Véu Silencioso','Julgamento da Noite'])
]);

export const CLASS_BY_ID=Object.freeze(Object.fromEntries(CLASSES.map(cls=>[cls.id,cls])));
export function getClass(id){return CLASS_BY_ID[id]||null;}
export function classSkillsAtLevel(classId,level){
  const cls=getClass(classId);
  if(!cls||!Number.isInteger(level)||level<1||level>LEVEL_CAP) throw new RangeError('Classe ou nível inválido');
  return cls.skills.filter(s=>s.tier<=tierForLevel(level));
}
