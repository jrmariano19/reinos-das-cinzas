# REINOS DAS CINZAS — Equipamentos, Aging e Mixing (protótipo v0.1)

**Origem da direção:** análise do GDD Mestre v1.1.0, seção "Economia, Equipamentos e Progressão".
Este documento **adapta** as propostas; as fórmulas e porcentagens abaixo são **novas propostas do nosso projeto**, não valores extraídos do GDD.

## Entregue na branch experimental
- Catálogo original de espadas, machados, arcos, bestas, cajados, cetros, orbes, adagas, escudos, couraças e mantos.
- Itens procedurais do tipo `equipment` com ID único, raridade (comum/raro/épico), requisitos de nível, especialização por classe, peso, ataque, defesa, absorção e bloqueio.
- Mochila equipa arma e proteção por clique; itens equipados voltam para a mochila quando substituídos ou guardados na Forja Rúnica.
- No primeiro carregamento após a escolha de classe, cada save recebe **um único equipamento inicial** daquela classe, identificado pela flag `starterEquipmentGranted`. Salvos com classe escolhida antes deste módulo também recebem um equipamento uma vez.
- Monstros podem deixar Núcleos de Brasa (18% dos abates comuns; chefes sempre deixam 2) e equipamentos aleatórios (12% dos abates comuns; 76% nos chefes), recolhidos pelo loot do corpo. Chance de equipamento épico dentro desse drop: 4%; raro: 15%; comum: 81%.
- Armas e proteções afetam ataque e defesa; absorção limita redução adicional a 35%; escudos podem fornecer chance de bloquear parte do dano, limitada a 35%.
- A antiga Espada Solar e seu aprimoramento legado permanecem para salvar progresso, mas **não recebem novos upgrades depois da escolha de classe**. A Forja Rúnica é o caminho para novos equipamentos.
- Dados permanecem sob `reinos-das-cinzas-save-v1`; **não existe servidor autoritativo ou comércio entre jogadores nesta fase**.

## Fórmulas provisórias

### Atributos e especialização
Escala de item por faixa de nível: `S=1+0,23×floor((nível-1)/10)`.

Qualidade sorteada: `Q∈[0,90;1,10)`.

Multiplicador de raridade: comum 1,0 / raro 1,15 / épico 1,35.

Para atributos-base acima de zero:
`atributo = arredondar(base × S × Q × raridade)`.

Para itens equipados:
`atributo_efetivo = arredondar(atributo × (1+0,055×aging) × spec) + bônus_do_mixing`, em que `spec=1,08` somente quando a especialização coincide com a classe do personagem.

O dano principal legado ainda usa seus próprios status e `weaponTier`; por compatibilidade os novos atributos são bônus adicionais. A unificação de todas as fontes de atributos é um marco futuro.

### Aging (+1 a +20)
Custo em ouro por tentativa: `arredondar(100×(aging_atual+1)^1,45)`.

| Aging atual | Sucesso | Perde 1 nível | Destruição | Falha sem perda |
|---|---:|---:|---:|---:|
| +0 a +3 | 95% | 0% | 0% | 5% |
| +4 a +9 | 78% | 15% | 0% | 7% |
| +10 | 58% | 22% | 6% | 14% |
| +11 a +19 | sucesso reduz 3,5 p.p. por nível, mínimo 24% | 22% | destruição sobe 2,4 p.p. por nível, máximo 28% | restante |

**A tentativa de +10 para +11 é a primeira com risco de quebra.** Toda tentativa cobra ouro antes do sorteio. A destruição retira o equipamento do slot; nunca cria item de reposição.

### Mixing
- **Selo da Brasa**: arma, +4 ataque; consome 2 Núcleos de Brasa e 200 ouro.
- **Selo do Bastião**: proteção, +3 defesa e +1 absorção; mesmo custo.
- Apenas um selo por equipamento; as receitas não podem ser reaplicadas.

## Economia e meta de grupo
- Ouro é retirado da circulação por Aging e Mixing. Itens podem desaparecer no Aging alto, sustentando demanda por novos drops.
- Armas com Spec de classe e raridade alta estimulam a especialização de equipamentos para tanques, DPS e curandeiros.
- Materiais têm finalidade real, mas **não há leilão nem mercado multiplayer implementados**.
- Chance de drop, taxas e custos exigem simulações de horas de grind, comparação de classes e testes de sensação de progressão.

## Cuidados e pendências
1. Manter todas as alterações apenas em `dev/priston-inspired-systems`, sem tocar na `main`.
2. Confirmar manualmente coleta, equipar, guardar, Aging e Mixing no mesmo endereço de Preview Vercel.
3. Validar com **contas e servidor autoritativo** antes de habilitar comércio ou economia persistente: save local pode ser modificado pelo jogador.
4. Ainda não há bonificação de velocidade de ataque, durabilidade, redução de atributos requeridos nem múltiplos slots de equipamento; são etapas seguintes.
5. Ainda não existe migração avançada entre a espada antiga e as novas armas; manter bônus legados pode inflar poder em saves avançados, exigindo rebalanceamento antes do lançamento.
6. A Forja Rúnica exige proximidade de Doran na cidade, próxima de (30,8). A tentativa de Aging apresenta custo e risco para confirmação.
