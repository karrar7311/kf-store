# K&F — premium fashion storefront

Next.js 14 · TypeScript · Tailwind · Three.js / React Three Fiber · GSAP + Lenis · Framer Motion · Zustand

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

Routes: `/` home · `/shop` · `/product/[slug]` · `/checkout` · `/about` · `/lookbook` · `/admin` · `/api/products`

Discount codes: `KF10` (10%), `FORM2027` (15%).

## Architecture
- `lib/products.ts` seed catalog · `lib/store.ts` cart / wishlist / UI (persisted) · `lib/repository.ts` data-access contracts
  (swap the in-memory repo for Supabase / Postgres / Firebase; add `/api/checkout` for Stripe).
- `components/Shot.tsx` procedural editorial "photography" placeholders (replace with real images via next/image).
- `components/three/*` procedural 3D garments (6 materials), hero, runway, product viewer. Loaded lazily, client-only.
- Admin (`/admin`) is a front-end demo with local state; wire it to the repository + auth before launch.

Live: https://karrar7311.github.io/kf-store/
