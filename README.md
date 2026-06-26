# Castles of Burgundy Scorer

A static React/Vite score calculator for the board game
[The Castles of Burgundy](https://en.wikipedia.org/wiki/The_Castles_of_Burgundy).

Live: https://toddcooke.github.io/castles-of-burgundy-scorer/

## Develop

```bash
npm install
npm run dev        # local dev server
npm test           # run unit tests (vitest)
npm run build      # production build into dist/
```

## Deploy

Pushing to `main` triggers the
[Pages workflow](.github/workflows/pages.yaml), which builds `dist/` and
deploys it to GitHub Pages.
