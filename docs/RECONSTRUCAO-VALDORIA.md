# REINOS DAS CINZAS — Reconstrução de Valdoria

## Direção aprovada (02/11/2026)
Valdoria será refeita para transmitir a sensação de uma capital de MMORPG clássico de fantasia, tomando **Priston Tale como referência de experiência**, sem reutilização ou reprodução de mapas, sprites, texturas, marcas, nomes, personagens ou interface proprietários.

A captura da cidade atual mostra um mundo top-down de edifícios e piso quadriculado; a prévia isométrica existente usa marcadores e volumes provisórios. Nenhum desses resultados atende à meta visual definitiva.

## Conceito próprio: Valdoria, Fortaleza das Cinzas
- **Praça da Coroa de Brasa:** espaço social central com fonte monumental, piso de pedra trabalhada, escadarias, bandeiras e árvores.
- **Rua dos Ofícios:** forja de dois pavimentos, armaria e oficina; chaminés, alpendres e metais brilhando.
- **Bairro dos Mercadores:** armazéns, estalagem, bancas, placas e tecidos suspensos.
- **Pátio dos Juramentos:** guilda, quadro de contratos, templo e guardas.
- **Portão das Cinzas:** muralhas, torres e estrada rumo ao mundo aberto.

### Padrão visual
1. Projeção isométrica com telhados de 2 águas, fachadas com profundidade, oclusão e sombras no solo.
2. Silhuetas distintas por edifício; o jogador identifica ferreiro, estalagem e guilda antes de ler o nome.
3. Materiais originais: pedra vulcânica azul-acinzentada, madeira escura, cobre envelhecido, telhas ferrugem, vidro âmbar, brasões de brasa.
4. Praça acolhedora com iluminação quente, ruas legíveis e escala humana; nada de copiar a disposição exata de cidades de outros jogos.
5. HUD, progressão, inventário, quests e NPCs preservados até teste de migração.

## Entregas verificáveis
- [x] Motor de projeção, câmera e hit-test em módulos desacoplados.
- [x] Visão experimental opt-in do mapa real; cliques passam pelo A* e interações existentes.
- [x] Primeira ordenação de profundidade e cenário volumétrico provisório.
- [x] **Protótipo visual 3D de referência** em `preview/valdoria-3d.html`: praça, fachadas, lojas, árvores, barracas, torreões e iluminação diurna/noturna; não modifica o mapa jogável.
- [x] **Moradores 3D experimentais**: guardas, ferreiro, mercadora, escriba e mensageiro com rotas em `src/valdoria-citylife.js`, animações de membros, placas de nomes e interação por clique.
- [x] **Efeitos experimentais**: fumaça e brasas na forja; controles para mostrar/ocultar moradores.
- [ ] Substituir modelos geométricos provisórios por arquitetura original detalhada e arte de personagem mais elaborada; validar visualmente e em dispositivos móveis.
- [ ] Extrair catálogo de objetos e texturas originais para módulos reutilizáveis.
- [ ] Implantar sprites animados originais e unificar terreno + cenário + atores na mesma ordenação de profundidade.
- [ ] Reconstruir mapa real gradualmente, manter colisões, portas, quests e transições; validar rotas.
- [ ] Aperfeiçoar HUD/inventário/equipamento e depois classes e progressão.
- [ ] Teste automatizado, inspeção visual em desktop/mobile, aprovação de usuário, só então merge para main.

## Regras de segurança da migração
- Não alterar a chave localStorage `reinos-das-cinzas-save-v1` nem invalidar saves atuais.
- Toda alteração gráfica entra na branch `dev/priston-inspired-systems`; Preview Vercel antes da produção.
- Não vender os desenhos provisórios como arte final. Performance em 56×56, click-targets e movimentação devem ser conferidos.
- Se a geometria da nova cidade exigir mover paredes/portas, introduzir migração de posição para saves antes da publicação.

## Estado da iteração 3D v0.3
A cena é um laboratório independente. **Não há navegação jogável do herói em 3D, lojas reais ou NPCs conectados às quests** nesta etapa. Os moradores demonstram rotas e detalhes; sua funcionalidade real será integrada em uma etapa posterior. A versão oficial na branch `main` não deve ser substituída antes dessa integração e dos testes.
