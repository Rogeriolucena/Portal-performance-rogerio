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
