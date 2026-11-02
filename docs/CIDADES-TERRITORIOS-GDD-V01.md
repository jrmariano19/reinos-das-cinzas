# REINOS DAS CINZAS — Urbanismo e Territórios v0.1

**Base recebida:** `GDD - Módulo de Cidades, Territórios e Urbanismo (Padrão Clássico)`.

**Status:** proposta arquitetural + pequena regra jogável. Não confundir os planos do Atlas com mapas implementados. Nenhuma arte, mapa ou personagem de terceiros é reutilizado.

## Direção adaptada (GDD → identidade própria)

| Referência no GDD | Adaptação REINOS DAS CINZAS | Estado |
|---|---|---|
| Kor-Vahan, capital militar e industrial dos Varkhan | **Valdoria, Fortaleza das Cinzas**, capital da Legião das Brasas, com Praça da Coroa de Brasa, Rua dos Ofícios, Pátio dos Juramentos e Portão das Cinzas | Cidade existente (gráficos provisórios) |
| Lumina, capital astral dos Aethelgard | **Noxara, Santuário do Véu**, capital do Conclave, com Pináculo do Véu, Jardins das Nascentes e Santuário da Vigília | Planejada |
| Navisko, entreposto de nível 20–40 | **Navira, Posto dos Penhascos**, apoio às rotas de caça e reparos básicos | Planejada |
| Atlantis, posto de nível 40–70 em pântanos | **Marisma, Vila das Marés Ocultas**, ponto de encontro de grupos | Planejada |
| Cidadela Neutra/Bless Castle | **Cidadela do Eclipse**, comércio neutro e futuro cerco de clãs | Planejada |
| Vilarejo de transição | **Vila das Lanternas**, já conectada ao Bastião pelo portal do mundo | Vila existente |

Cidades novas não substituem Valdoria nem renomeiam NPCs já existentes. O ferreiro que opera a forja legada é **Doran**; o Kaelen existente é um oráculo e mantém suas funções. A ligação entre cidades novas é apenas conceitual.

## Arquitetura e zoneamento

### Valdoria — capital existente, prioridade visual
- Centro econômico e social na praça e distrito dos ofícios; ampliar peso visual da forja, lojas e estalagens.
- Área militar com quartel, contratos e futuras provas de promoção nos níveis 20/40/60/80.
- Armazém com baú individual, ampliável para armazenamento de conta somente após existir autenticação e persistência no servidor.
- Portão Sul e acessos à zona de grind já existem como navegação no mapa real; preservar as transições atuais.
- No 3D: basalto, ferro, vidro âmbar, cobre e chamas; nenhum telhado repetido genérico.

### Noxara — expansão planejada
- Pináculo do Véu: alquimia, infusões e ensino de habilidades.
- Jardins das Nascentes: praça social elevada com fontes e regeneração ampliada de mana.
- Santuário da Vigília: mestres das classes do Conclave.
- Arco da Aurora: saída planejada para zonas boreais.
- Preferir geometrias originais, pedra clara e estruturas cristalinas. Não reproduzir o layout exato de uma cidade de outros jogos.

### Navira e Marisma — hubs de progressão
- Navira nível 20–40: estalagem, salvamento de retorno, poções e reparos *básicos*, sem Aging alto.
- Marisma nível 40–70: plataformas sobre canais, loja de suprimentos, ferreiro avançado e agrupamento de equipes.
- Não implementar serviços de leilão real antes de existir servidor confiável de transações.

### Cidadela do Eclipse — end-game planejado
- Zona neutra em dias comuns, com futuro comércio de guildas.
- Cerco periódico em janela agendada, regras autoritativas no servidor.
- Não ativar PvP por simples data do computador do jogador: o servidor precisa determinar horário, fase e vencedores.

## Zonas seguras — parte implementada no jogo experimental

Em `src/territories.js` estão preservadas as coordenadas da lógica anterior:

| Andar | Faixa segura | Localidade |
|---|---|---|
| 0 | x=3..53, y=3..39 | Valdoria |
| 1 | x=10..34, y=6..17 | Vila das Lanternas |
| -1, -2 | nenhuma | Catacumbas / Cripta |

A verificação de bloqueio de combate e a regra de renascimento legadas permanecem inalteradas.

**Recuperação:** depois de 1,5 s sem movimento, caminho pendente ou alvo selecionado, HP e MP recuperam com atualização a cada 1 s. Valores provisórios:
- Parado fora de zona segura: **1 HP/s e 0,5 MP/s**.
- Parado em zona segura: **2 HP/s e 1 MP/s** (dobro).
- Andando ou perseguindo alvo: sem regeneração.
- Nunca excede vida/mana máximas; não penaliza XP.
- Stamina/RES: **não existe como recurso funcional** no jogo atual; aguardará novo sistema.

Essas taxas de recuperação são propostas nossas. O GDD estipula o multiplicador urbano de 2x, mas não números absolutos.

## Arquitetura do módulo
- `src/territories.js`: catálogo puro das localidades, metadados de status, serviços, faixas e função de regeneração.
- `preview/territories.html`: Atlas ilustrativo interativo, com destinos selecionáveis e status **jogável/planejado**.
- `tests/territories.test.mjs`: coordenadas, facções, serviços, taxa dupla e limites.
- `index.html`: regra de descanso e acesso ao Atlas conceitual a partir do Mapa-Múndi.

## Próximas entregas, por prioridade
1. **Teste manual** do descanso no navegador, sem perda de HP/MP, ouro, classe, itens ou missões.
2. **Projeto visual 3D de Valdoria** com praça, edificações distintas, mercado e forja usando materiais/silhuetas originais.
3. **Prototipar Noxara em cenário separado**, não transportar o personagem antes de haver mapas e migração de saves.
4. **Criar armazenamento e bancos** depois de identidade/autenticação online.
5. Conectar hubs de grind e áreas de nível 20–40/40–70 com colisões, limites e spawns reais.
6. Somente com servidores confiáveis: leilões, PvP de guildas, guerras por território e economia global.

**Implantação:** branch `dev/priston-inspired-systems`, sem merge na `main`.
