# AI Resource Hub

Independent AI model comparison — pricing, benchmarks, and value rankings for LLMs, image, video, and audio models.

## Tech Stack

- **Framework:** Astro 5 (static generation + React islands)
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript
- **Data:** CSV source compiled to JSON at build time

## Getting Started

```bash
npm install
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```

## Project Structure

```
src/
├── components/    # Astro + React components
├── data/          # Data loading utilities
├── layouts/       # Page layouts
├── pages/         # Astro pages (file-based routing)
├── styles/        # Global CSS and theme
└── types/         # TypeScript type definitions
data/
└── llm-models.csv # Source data for LLM comparison
```

## Data

Model data is stored in CSV format in the `data/` directory and parsed at build time. Prices are per 1M tokens in USD, sourced from official API documentation.
