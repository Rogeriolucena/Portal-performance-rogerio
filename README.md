# Sheipados — v31 estável

Base: v25.

Correções:
- Remove da aba Mais a dependência de `examResultsHTML`, que gerava erro.
- Mantém a aba Mais funcional com perfis, exames recomendados e backup.
- Mantém renderização protegida para evitar tela branca.

Incluído:
- Bioimpedância por PDF na aba Evolução.
- Medição quinzenal após o calendário de progresso.
- Gráficos de evolução:
  - peso;
  - gordura corporal;
  - massa muscular;
  - massa magra.

Não incluído:
- OCR/imagem. Será tratado em versão separada depois que esta versão estiver validada.


## v32 — OCR de bioimpedância

Base: v31 estável.

Alterações:
- Medição quinzenal agora aceita PDF ou imagem/foto.
- PDF segue usando PDF.js.
- Imagem/foto usa OCR via Tesseract.js.
- Resultados importados por imagem também alimentam os gráficos da aba Evolução.

Cuidados:
- Foto precisa estar nítida, sem corte e com boa iluminação.
- OCR depende de internet para carregar a biblioteca externa.


## v33 — Upload separado PDF e foto

Ajuste:
- A medição quinzenal agora mostra dois campos separados:
  - PDF da bioimpedância;
  - Foto ou imagem da bioimpedância.
- Incluído botão específico para “Ler PDF”.
- Incluído botão específico para “Ler foto/imagem”.
- Isso evita o comportamento do iPhone/Chrome que escondia a opção de imagem quando tudo ficava no mesmo campo.


## v34 — Botões explícitos de foto/imagem/PDF

Ajuste:
- Substituído o campo visível “Escolher arquivo” por três botões:
  - Tirar foto;
  - Escolher imagem;
  - Selecionar PDF.
- Os inputs reais ficam ocultos e são acionados pelos botões.
- Isso tenta contornar o comportamento do iPhone/Chrome que escondia a opção de foto.


## v35 — Treino com alternativas e vídeos curados

Alterações:
- Cada exercício do treino agora possui opções alternativas selecionáveis.
- A seleção fica no próprio card do exercício, como foi feito na Dieta.
- A prescrição do exercício ficou mais clara:
  - séries;
  - repetições;
  - esforço;
  - reps em reserva;
  - orientação de carga;
  - descanso;
  - tempo de execução;
  - dica técnica.
- Os vídeos deixam de apontar para pesquisa no YouTube.
- Foram inseridos links diretos para vídeos específicos de execução, escolhidos por padrão de movimento.


## v36 — Detalhes retráteis no treino

Alterações:
- Os cards de exercício agora mostram apenas:
  - checkbox;
  - nome;
  - resumo rápido;
  - seletor de alternativa.
- As informações detalhadas ficaram dentro de “Ver detalhes, carga e vídeo”.
- O usuário pode expandir/contrair cada exercício individualmente.


## v37 — Correção de vídeos ausentes

Correções:
- Preenchidos os vídeos ausentes nas opções de exercícios.
- Removidos links antigos de pesquisa do YouTube dos dados de treino.
- Todos os exercícios/opções agora possuem um link direto de vídeo.
- Movimentos acessórios compartilham vídeo-base equivalente quando a execução é muito próxima.

Ajustes aplicados:
- Opções sem vídeo antes da correção: 141
- Campos de vídeo/link atualizados: 186


## v38 — Check-in concluído para treino e dieta

Alterações:
- Ao salvar o treino, a aba Treino passa a mostrar “Treino concluído hoje”.
- As opções do treino somem para o dia atual.
- No dia seguinte, o app mostra o treino do novo dia automaticamente.
- Ao salvar a dieta, a aba Dieta passa a mostrar “Dieta concluída hoje”.
- As opções da dieta somem para o dia atual.
- O calendário da aba Evolução passa a registrar treino/dieta concluídos com base no check-in salvo.
- Incluído botão “Editar check-in de hoje” em Treino e Dieta.


## v39 — Horário do check-in

Alterações:
- O treino agora registra horário do check-in (`checkInTime`) e data/hora ISO (`checkInAt`).
- A dieta também registra horário do check-in.
- O card de concluído mostra “Registrado às HH:MM”.
- Histórico da aba Evolução mostra o horário de treino/dieta quando disponível.
- Botão “Salvar treino” alterado para “Registrar treino”.
- Botão “Salvar dieta” alterado para “Registrar dieta”.
