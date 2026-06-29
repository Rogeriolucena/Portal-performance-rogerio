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
