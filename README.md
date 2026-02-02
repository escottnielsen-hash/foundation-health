# Foundation Health Website

Professional healthcare website built with Next.js 15, React 19, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19
- **Styling**: Tailwind CSS 3.4
- **Language**: TypeScript 5.7
- **Deployment**: Vercel

## Features

- Responsive mobile-first design
- Modern healthcare-focused UI
- Service showcase sections
- Patient statistics display
- Contact & appointment CTAs
- Fully accessible navigation
- Production-ready SEO metadata

## Getting Started

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Production Deployment

```bash
vercel deploy --prod
```

## Project Structure

```
foundation-health/
├── app/
│   ├── layout.tsx    # Root layout with metadata
│   ├── page.tsx      # Homepage
│   └── globals.css   # Global styles + Tailwind
├── components/       # Reusable components
├── public/           # Static assets
└── [config files]    # Next.js, TypeScript, Tailwind configs
```

## ID Convention

All elements follow the pattern: `{page}-{component}-{element}`

Examples:
- `hero-title`
- `services-grid`
- `cta-primary-button`

---

**Built for Foundation Health**
Ready for immediate deployment to production.
