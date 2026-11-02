# REINOS DAS CINZAS — evolução isométrica

## Objetivo
Migrar gradualmente a apresentação do jogo para uma visão isométrica inspirada no ritmo e na legibilidade dos MMORPGs clássicos, sem reutilizar mapas, personagens, interface ou artes de Priston Tale.

## Estado inicial
O jogo atual concentra renderização, movimento, combate, inventário e salvamento em `index.html`. A migração deve preservar os saves existentes (`reinos-das-cinzas-save-v1`), coordenadas, missões, monstros e NPCs.

## Marco 1 — base de projeção (iniciado)
- `src/isometric.js`: conversão entre coordenadas de mundo e tela, seleção de tiles, ordenação de profundidade e desenho de losangos.
- Ainda **não integrado** ao loop de renderização; a interface publicada continua 2D.

## Marco 2 — renderer selecionável
- Separar cálculo de câmera e desenho do mapa.
- Criar alternância 2D/isométrico na branch de desenvolvimento.
- Reutilizar colisão e caminho existentes em coordenadas de mundo.
- Ordenar entidades e objetos por profundidade e adaptar clique/toque.
- Validar interiores, andares subterrâneos, iluminação e minimapa.

## Marco 3 — cidades e inventário
- Centros urbanos com NPCs de loja, ferreiro, armazém e missões.
- Mochila em grade, slots de equipamento, pilhas e requisitos de atributos.
- Preservar itens já salvos e adicionar migrações versionadas.

## Marco 4 — progressão
- Classes originais, atributos, XP, níveis, habilidades e especializações.
- Tabelas de progressão balanceadas e testes de save/load.

## Critérios de aceite antes de publicar
1. Movimentação e clique correspondem ao tile visível.
2. Jogador, monstros e edifícios obedecem à ordem de profundidade.
3. Nenhuma regressão no combate, NPCs, baús e transições de andar.
4. Save antigo carrega sem perda de progresso.
5. Funciona em desktop e dispositivos móveis.
6. Revisão em preview antes de qualquer merge na `main`.
