# Portal Performance — Rogério Lucena

MVP PWA do plano **80 kg seco**.

## O que tem nesta versão

- Dashboard mobile-first
- Calendário de treino 12 semanas
- Registro de treino com carga, reps, RPE e observações
- Registro de peso, cintura, braço, coxa, sono, apetite e digestão
- Checklist de dieta
- Registro de suplementos
- Registro de medicamentos apenas para adesão/tolerância
- Exames sugeridos
- Backup JSON
- Exportação CSV
- Funcionamento offline após primeira abertura quando hospedado em HTTPS

## Como testar no computador

Abra `index.html` no navegador.

## Como usar no iPhone corretamente

Para funcionar como app instalado, hospede em HTTPS.

Opções simples:
- GitHub Pages
- Vercel
- Netlify
- Cloudflare Pages

Depois:
1. Abra o link no Safari.
2. Toque em compartilhar.
3. Escolha "Adicionar à Tela de Início".

## Importante

Os dados ficam salvos no navegador/dispositivo pelo `localStorage`.
Faça backup JSON periodicamente.
