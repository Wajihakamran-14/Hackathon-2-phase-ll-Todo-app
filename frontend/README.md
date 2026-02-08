# Todo App Frontend

A modern, responsive todo application frontend built with Next.js 16+ and App Router.

## Features

- User authentication with Better Auth
- Task management (Create, Read, Update, Delete)
- Responsive design for desktop and mobile
- Modern UI with smooth animations
- Clean, elegant color palette
- JWT-based authentication flow

## Tech Stack

- Next.js 16+ with App Router
- React 19
- TypeScript
- Tailwind CSS
- Better Auth for authentication
- Lucide React for icons
- Framer Motion for animations

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

- `NEXT_PUBLIC_API_URL`: The URL of your backend API (default: http://localhost:8000)

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── (protected)/       # Protected routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   ├── ui/                # Base components
│   ├── auth/              # Authentication components
│   ├── tasks/             # Task management components
│   └── navigation/        # Navigation components
├── lib/                   # Utilities and helpers
├── styles/                # Custom styles and animations
├── types/                 # TypeScript type definitions
├── hooks/                 # Custom React hooks
└── config/                # Configuration files
```

## Development

- Use the `src/` alias for imports: `import { Button } from '@/components/ui/Button'`
- Follow the component structure in the `components/` directory
- Add new pages in the `app/` directory following Next.js App Router conventions
- Add new types to the `types/` directory