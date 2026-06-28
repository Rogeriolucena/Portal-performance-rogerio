# Sheipados — v9 estável

Correções:
- Refeito a partir de uma base limpa.
- Ícone do halter aplicado no cabeçalho, manifest, apple-touch-icon e raiz do projeto.
- Navegação refeita para não abrir tela vazia.
- Cada aba renderiza isoladamente para um erro não quebrar o app inteiro.
- Calendário de progresso na aba Evolução:
  - halter = treino completo;
  - comida = dieta completa;
  - os dois ícones = treino + dieta no mesmo dia.
- Mantida rolagem interna para evitar espaço infinito no fim no iPhone.

Critérios:
- Treino completo: todos os exercícios do dia marcados.
- Dieta completa: todas as refeições marcadas.

Atualização:
Substitua todos os arquivos no GitHub.
Depois, no iPhone, remova o atalho antigo e adicione de novo à Tela de Início.


## v10 — correção de clique no rodapé e ícone quebrado

Correções:
- Menu inferior agora fica no fluxo do layout, não mais como camada fixa sobre o conteúdo.
- Isso corrige o problema de clique no rodapé em Safari/iPhone.
- Cabeçalho não depende mais de carregar imagem externa para mostrar o ícone: usa um halter em CSS.
- Ícones PNG continuam no projeto para instalação na Tela de Início.
- `apple-touch-icon.png` mantido na raiz e dentro da pasta `/icons`.
- `favicon.ico` adicionado.
