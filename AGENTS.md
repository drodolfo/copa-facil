# AGENTS.md - Development Guidelines for Copa Fácil

This file contains guidelines and commands for AI agents working on the Copa Fácil football tournament management system.

## Project Overview

**Type**: React 19 + TypeScript web application with Supabase backend
**Purpose**: Football tournament management system with user authentication and admin functionality
**Language**: Spanish UI with English codebase

## Available Commands

### Development
```bash
npm run dev          # Start development server (Vite)
npm run build        # Build for production (TypeScript compile + Vite build)
npm run preview      # Preview production build locally
```

### Code Quality
```bash
npm run lint         # Run ESLint on all TypeScript/React files
```

### Testing
⚠️ **No testing framework currently configured** - Consider adding Vitest or Jest before implementing tests

## Code Style Guidelines

### TypeScript Configuration
- **Strict mode enabled** with comprehensive linting rules
- **ES2022 target** with modern module resolution
- **React JSX** configured for automatic runtime
- **No unused locals/parameters** allowed

### Import Conventions
```typescript
// External libraries first
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// Internal imports (relative paths)
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import type { User } from '../types'
```

### Component Patterns
- **Functional components only** (no class components)
- **Props interface** for complex component props
- **React hooks** for state and side effects
- **Destructured props** with TypeScript types

```typescript
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  )
}
```

### Service Layer Patterns
- **Async functions** returning promises
- **Supabase client** for database operations
- **Error handling** with thrown errors
- **Type-safe responses** with proper null handling

```typescript
export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}
```

### Styling Conventions
- **Tailwind CSS classes** for all styling
- **Responsive design** with mobile-first approach
- **Consistent color scheme**: Green theme (green-600, green-800)
- **Component composition** over CSS inheritance

### Naming Conventions
- **Components**: PascalCase (Layout, Navbar, Footer)
- **Functions/Variables**: camelCase (getUserById, updateUser)
- **Files**: PascalCase for components, camelCase for services
- **Constants**: UPPER_SNAKE_CASE (if needed)

### Type Definitions
- **Interface over type** for object shapes
- **Union types** for status fields
- **Optional fields** with `?` modifier
- **Null returns** for "not found" cases

```typescript
export interface User {
  id: string
  email: string
  full_name: string
  role: 'user' | 'admin'
  created_at: string
}

export interface Match {
  id: string
  home_score: number | null
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
}
```

### Error Handling
- **Throw errors** from service functions
- **Try-catch blocks** in components for user feedback
- **Null checks** for optional data
- **Loading states** for async operations

### React Hooks Best Practices
- **Avoid setState in useEffect** - Use callback functions or separate effects
- **Effect dependencies** - Include all dependencies or use useCallback/useMemo
- **Fast refresh compatibility** - Export only components from component files
- **Custom hooks** - Extract complex logic into reusable hooks

```typescript
// ❌ Avoid this
useEffect(() => {
  setState(data) // Direct setState in effect
}, [data])

// ✅ Prefer this
useEffect(() => {
  const fetchData = async () => {
    const result = await apiCall(data)
    setState(result)
  }
  fetchData()
}, [data])
```

### File Structure
```
src/
├── components/      # Reusable UI components
├── context/         # React contexts (AuthContext)
├── lib/            # Utilities (Supabase client)
├── pages/          # Page components (routes)
├── services/       # Data layer (API calls)
└── types/          # TypeScript type definitions
```

### Linting Rules
- **ESLint with TypeScript**, React Hooks, and React Refresh plugins
- **No unused variables** allowed
- **Proper React hooks** usage enforced
- **Import organization** follows established patterns

## Development Workflow

1. **Start development server**: `npm run dev`
2. **Run linting**: `npm run lint` (fix any errors before commits)
3. **Build test**: `npm run build` (ensure production build works)
4. **Type checking**: Handled automatically during build process

## Key Dependencies

- **@supabase/supabase-js**: Database and authentication
- **react-router-dom**: Client-side routing
- **tailwindcss**: Utility-first CSS framework
- **vite**: Build tool and dev server

## Important Notes

- **Spanish language UI** - All user-facing text should be in Spanish
- **Supabase integration** - All data operations go through Supabase client
- **No testing framework** - Add Vitest/Jest before implementing tests
- **TypeScript strict mode** - All code must pass strict type checking
- **Modern React patterns** - Use hooks, functional components, and latest React features

## Common Patterns

### Authentication Check
```typescript
const { user } = useAuth()
if (!user) {
  // Handle unauthenticated state
}
```

### Supabase Query Pattern
```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('field', value)

if (error) throw error
return data || []
```

### Responsive Layout
```typescript
<div className="grid md:grid-cols-3 gap-8">
  {/* Content */}
</div>
```

### React Refresh Compatibility
- **Component files should only export components** - Move utilities/constants to separate files
- **Avoid non-component exports** from component files to maintain fast refresh
- **Use separate files** for shared functions, constants, or utilities