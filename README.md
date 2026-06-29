# Sheipados — v14

Estratégia desta versão:
- Volta para a arquitetura da v7, que foi a última base com clique funcionando.
- Não altera a navegação, o render principal nem o comportamento do rodapé.
- Adiciona somente o calendário de progresso dentro da aba Evolução.
- Mantém ícone com padding interno para não cortar.

Diagnóstico:
- O problema de clique não veio do calendário em si.
- Ele apareceu porque as versões após a implementação do calendário também mudaram a arquitetura de renderização/navegação.
- A v14 isola a funcionalidade do calendário sem mexer na navegação da v7.

Critérios do calendário:
- Halter: todos os exercícios do treino daquele dia marcados.
- Comida: todas as refeições daquele dia marcadas.
- Dois ícones: treino + dieta completos no mesmo dia.

Teste:
- Atualize tudo no GitHub.
- Abra com:
  https://rogeriolucena.github.io/Portal-performance-rogerio/?v=14


## v15 — Dieta agrupada

Alterações:
- A aba Dieta agora agrupa refeição, água e suplementos/rotina associada no mesmo card.
- Removidos os blocos separados de Água, Rotina/Suplementos e Alternativas.
- A seleção da opção realmente consumida fica no próprio card da refeição.
- O ícone de comida no calendário de progresso agora considera todos os flags da dieta:
  - refeições;
  - água;
  - suplementos/rotina prescrita.


## v16 — Refeição dinâmica

Alterações:
- Ao alterar a opção realizada, o texto principal do card muda junto.
- O texto deixa de ficar preso em “Base”.
- No pós-treino/café, removido o flag “Whey + creatina”.
- Mantido apenas “Creatina diária”.
- Whey passa a ser entendido como parte da opção escolhida ou como complemento de proteína, não como obrigação extra quando a refeição escolhida for ovos/pão/fruta.


## v17 — Correção do campo de data

Correção visual:
- Campo de data não deve mais deslocar para fora da caixa no iPhone/Chrome.
- Adicionado `min-width:0` nos filhos do grid.
- Forçado `input[type=date]` a respeitar largura máxima de 100%.
- Ajustado grid de formulários no mobile para `minmax(0, 1fr)`.


## v18 — Correção dos cards de semanas

Correção visual:
- Os cards das semanas no Calendário de Treinos agora têm largura fixa maior.
- Textos longos foram abreviados:
  - Intensificação → Intens.
  - Consolidação → Consol.
- O texto não deve mais sair da caixa nas semanas finais.


## v19 — Layout e exames PDF

Alterações:
- Removido “80 kg seco” do cabeçalho.
- Cards das semanas no Calendário agora mostram só S1, S2, S3... sem texto de fase dentro do chip.
- Campo de data da medição quinzenal passa a ser texto para evitar estouro visual nativo do iPhone/Chrome.
- Aba Mais:
  - removido bloco Rotina;
  - incluída área para inserir PDFs de exames;
  - o app tenta ler o PDF via PDF.js e extrair exames comuns automaticamente;
  - resultados ficam salvos localmente no aparelho.


## v20 — Correção dos chips do calendário

Correção:
- Clicar nos chips S1, S2, S3... não leva mais automaticamente para a aba Treino.
- Os chips agora usam `setCalendarWeek()`, atualizando apenas a semana do calendário e mantendo a aba Calendário aberta.
- A função geral `save()` também foi ajustada para preservar a aba atualmente aberta quando renderizar o app.


## v21 — Correção do scroll dos chips de semana

Correção:
- Ao clicar em S8, S9, S10, S11 ou S12, a faixa de chips não volta mais para S1.
- O chip selecionado é centralizado automaticamente após a troca de semana.
- A posição vertical da aba Calendário é preservada ao trocar a semana.


## v22 — Blocos de treino

Alterações:
- Incorpora a correção da v21: chips do calendário mantêm a semana selecionada visível.
- Treinos agora variam por bloco de 4 semanas:
  - Semanas 1–4: Bloco A — base técnica e hipertrofia.
  - Semanas 5–8: Bloco B — variação de estímulo, ângulos, pegadas e máquinas.
  - Semanas 9–12: Bloco C — intensificação, acabamento e consolidação.
- A divisão semanal foi mantida:
  - Segunda: Peito + tríceps
  - Terça: Costas + bíceps
  - Quarta: Quadríceps
  - Quinta: Ombros + abdômen
  - Sexta: Posterior + glúteos + braços
  - Sábado/Domingo: cardio ou funcional
- O app mostra o bloco atual no Treino e no Calendário.


## v23 — Correção definitiva do scroll dos chips

Correção:
- Substituído `scrollIntoView()` por cálculo manual de `scrollLeft`.
- O ajuste é repetido em múltiplos tempos após o redesenho, porque o Chrome/iPhone recalcula o layout depois do primeiro frame.
- O chip selecionado deve permanecer visível/centralizado mesmo ao selecionar S10, S11 ou S12.


## v24 — Semana automática e calendário apenas consulta

Alterações:
- Ciclo de treino iniciado em 29/06/2026.
- Aba Treino usa semana automática:
  - 5 check-ins válidos de segunda a sexta avançam 1 semana;
  - sábado/domingo é bônus opcional e não avança semana.
- Mantida a opção “Mudar treino só hoje”:
  - semana só hoje;
  - dia só hoje;
  - botão para limpar troca de hoje.
- Aba Calendário virou apenas consulta:
  - selecionar S1...S12 não altera a aba Treino.
- Correção definitiva do problema de scroll:
  - os chips agora ficam em grade fixa;
  - não há mais carrossel horizontal para voltar ao início.


## v25 — Dieta, evolução e remoção de lembretes

Alterações:
- Todas as opções de refeições agora têm quantidades.
- Medição quinzenal saiu da aba Dieta e foi para a aba Evolução.
- Peso removido da aba Treino.
- Checklist da dieta agora tem botão “Marcar/Desmarcar tudo”.
- Botões/cards de lembretes removidos do app.
- Salvamento da dieta agora registra apenas o checklist e a nota do dia.


## v26 — Bioimpedância por PDF

Alterações:
- Medição quinzenal agora fica depois do calendário na aba Evolução.
- Medição quinzenal não é mais manual.
- O app lê PDF de bioimpedância e tenta extrair automaticamente:
  - peso;
  - percentual de gordura;
  - massa gorda;
  - massa magra;
  - massa muscular;
  - água corporal;
  - IMC;
  - gordura visceral;
  - metabolismo basal.
- Removidos sono, apetite, digestão e notas dessa medição.
- Histórico passa a listar também bioimpedâncias importadas.
