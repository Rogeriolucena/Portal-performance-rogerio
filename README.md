# Sheipados — v12 Floating Chrome Fix

O que mudou:
- Volta do menu flutuante inferior.
- No Chrome/iPhone, o menu fica mais alto para não brigar com a barra inferior do navegador.
- Em modo app instalado/standalone, o menu volta para baixo.
- Ícone com padding interno para não cortar.
- Cabeçalho usa o PNG do ícone; se falhar, cai para halter desenhado em CSS.
- Mantém calendário de progresso na aba Evolução.

Por que a v7 funcionava e as posteriores quebraram:
- A partir das correções de rolagem, o app passou a travar o body e usar uma área interna de scroll.
- Isso resolveu o espaço infinito, mas no Chrome/iPhone o menu fixo ficou numa zona ruim perto da barra inferior do navegador.
- A v12 mantém a correção de scroll e desloca o menu flutuante para uma área clicável no Chrome.

Atualização:
- Substitua todos os arquivos.
- Abra com ?v=12 para furar cache:
  https://rogeriolucena.github.io/Portal-performance-rogerio/?v=12
