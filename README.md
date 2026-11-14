# Litpax Technology — Website (React + Vite + GSAP)

## Run on your computer
```bash
npm install
npm run dev
```
Open http://localhost:5173

## Make the live version (for hosting)
```bash
npm run build
```
Upload everything inside the `dist/` folder to your hosting (Hostinger `public_html`, Netlify, Vercel, GitHub Pages…).

## Where to change things
| What | File |
|---|---|
| Products, specs, phone numbers, reviews, photos | `src/data.js` |
| Colours & design | `src/styles/global.css` |
| Photo-related styles | `src/styles/photos.css` |
| Scroll animations | `src/App.jsx` |
| Each section | `src/components/*.jsx` |

## Photos
Photos are free Unsplash images (allowed for commercial use). To use your own,
put them in `public/images/` and change the URL in `src/data.js`, e.g.
`hero: '/images/factory.jpg'`.
