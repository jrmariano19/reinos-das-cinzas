# REINOS DAS CINZAS — Sistema de Classes, integração experimental

## Status — v0.2 (branch dev/priston-inspired-systems)
O laboratório em `preview/classes.html` apresenta oito classes originais em duas facções, com 40 habilidades planejadas distribuídas pelos Tiers 1–5 (níveis 1, 20, 40, 60 e 80).

### O que já funciona de fato na Preview do jogo
1. A tela do laboratório abre o jogo com `?chooseClass=ID`, **sem aplicar a escolha**.
2. O jogo mostra modal de confirmação; cancelar não muda o save.
3. Após confirmação, salva `player.classId` na chave `reinos-das-cinzas-save-v1` existente, sem trocar chave nem versão do formato.
4. A base da classe ajusta HP, MP, ataque e defesa **preservando bônus de missões e equipamentos**; preserva nível, XP, ouro e inventário.
5. Level-up passa a usar a progressão da classe a partir desse momento (equações determinísticas cumulativas).
6. Tecla `[1]` usa uma habilidade Tier 1 **real** e exclusiva; inclui custo de mana, cooldown, efeitos e dano/mitigação/cura.
7. O nome da classe aparece na barra de status e em Progressão.
8. Personagens sem classe escolhida continuam usando golpes e progressão legados.

### Habilidades Tier 1 implementadas
| Classe | Efeito funcional |
|---|---|
| Sentinela de Ferro | Guarda defensiva temporária por 5s |
| Colosso da Forja | Golpe corpo a corpo em até 3 monstros próximos |
| Vigia das Fronteiras | Disparo contra um alvo a até 5 tiles |
| Artífice Rúnico | Dano em área contra até 4 monstros a 3 tiles |
| Arcanista do Eclipse | Explosão contra até 5 monstros próximos ao alvo |
| Devota da Aurora | Cura própria com base no HP máximo |
| Tecelão do Véu | Ataque mágico a um alvo |
| Lâmina Espectral | Golpe corpo a corpo com chance de crítico |

## Valores de equilíbrio e progressão
Catálogo em `src/class-catalog.js`; adaptação segura em `src/class-progression.js`. **Números provisórios**, sujeitos a teste de DPS, tempo para matar e eficácia em grupo.

Para nível L, a migração calcula a diferença entre a nova classe e as estatísticas legadas:

`status_novo = status_salvo + (base_classe-base_legada) + (crescimento_classe-crescimento_legado)*(L-1)`

Isso conserva o ganho extra do jogador anterior (como bônus de missões). Frações são arredondadas nas fronteiras de nível. HP/MP correntes mantêm a porcentagem aproximada durante a escolha. Validação para nível entre 1 e 120.

Tiers superiores já têm desbloqueios visuais, mas **ainda não são ações de combate jogáveis**.

## Limitações conhecidas / próximos marcos
- **O sistema online/multiplayer não existe ainda**: o save é local no navegador. Deploys Vercel Preview podem utilizar endereços de origem diferentes; o progresso local não transita automaticamente entre eles.
- Troca de classe não é permitida no mesmo personagem. Futuro criador de personagens + múltiplos slots deve substituir esta regra provisória.
- Teclas 2–4 continuam com habilidades legadas do cavaleiro; substituir gradualmente por Tiers 2–4/5 e impor pré-requisitos de nível.
- O XP legado usa curva multiplicativa; `src/class-balance.js` define uma curva proposta **ainda não ativada**. Não declarar que a curva planejada está em produção.
- Não foi testada a interação completa dentro de um browser automatizado. Testes atuais cobrem sintaxe, consistência, progressão e isolamento do save.
- Personagem, cidade 3D e classes ainda não estão unidos em um MMORPG 3D completo.
- Balancear DPS/AoE e sobrevivência por classe com grupos de 1–6.
- Acrescentar seleção de novos personagens sem mexer nos saves existentes.

## Como validar
1. Na Preview, abrir `/preview/classes.html`, escolher uma classe e clicar **Entrar no jogo com esta classe**.
2. Conferir o modal. Cancelar primeiro; conferir que o herói continua sem classe.
3. Confirmar a classe; conferir o título, HP/MP/ATQ/DEF e o nome da tecla 1.
4. Sair da zona segura e testar a habilidade contra monstros, observando MP e cooldown.
5. Recarregar **o mesmo endereço de Preview** e confirmar que a classe e as missões persistem.
6. Testar personagem legado antes de escolher classe e confirmar que nada foi apagado.
