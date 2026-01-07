# Frontend Documentation

## React + Material UI Application

### Overview
GetLos_T frontend is a React 18 application with TypeScript and Material UI that provides user interface for lottery number generation and analysis.

### Architecture

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   │   ├── Layout.tsx
│   │   └── NumbersBall.tsx
│   ├── pages/          # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Generate.tsx
│   │   ├── History.tsx
│   │   └── Stats.tsx
│   ├── services/       # API client
│   │   └── api.ts
│   ├── types/         # TypeScript types
│   │   └── index.ts
│   ├── App.tsx        # Main app component
│   ├── main.tsx       # Entry point
│   └── theme.ts       # Material UI theme
├── package.json
├── tsconfig.json
├── vite.config.js
└── Dockerfile
```

### Technology Stack

- **React**: 18.2
- **TypeScript**: 5.3
- **Material UI**: 5.15
- **React Router**: 6.21
- **React Query**: 5.17
- **Axios**: 1.6
- **Zustand**: 4.5
- **Vite**: 5.0

### Components

#### Layout
Main layout component with navigation.

**Location**: `src/components/Layout.tsx`

Features:
- Material UI AppBar with gradient
- Tabs navigation
- Responsive container
- Footer

```tsx
<Layout>
  {children}
</Layout>
```

#### NumbersBall
Reusable component for displaying lottery numbers.

**Location**: `src/components/NumbersBall.tsx`

Props:
```tsx
interface NumbersBallProps {
  numbers: number[]
  size?: 'small' | 'medium' | 'large'
  gradient?: 'default' | 'hot' | 'cold' | 'gold'
}
```

Sizes:
- small: 40px
- medium: 50px (default)
- large: 60px

Gradients:
- default: Purple (#667eea → #764ba2)
- hot: Red gradient
- cold: Blue gradient
- gold: Gold gradient

### Pages

#### Dashboard
Main dashboard with statistics and CSV upload.

**Route**: `/`

Features:
- Stats cards (Grid layout)
- CSV file upload
- Recent picks display
- Quick action buttons

Components used:
- Card, CardContent
- Grid, Box
- Button, Typography
- NumbersBall

#### Generate
Generate new lottery picks with different strategies.

**Route**: `/generate`

Features:
- Strategy selection (5 options)
- Count input (1-10)
- Results display
- Copy to clipboard
- Clear results
- Strategy descriptions

Strategies:
1. Random - Completely random
2. Hot - Frequent numbers
3. Cold - Rare numbers
4. Balanced - Mix of hot/cold
5. Combo Based - Based on pairs/triples

Components used:
- Select, MenuItem
- TextField
- Button
- Alert
- Chip
- NumbersBall

#### History
View and manage generated picks and historical draws.

**Route**: `/history`

Features:
- Tabs (Picks / Draws)
- List view with cards
- Delete individual items
- Clear all functionality
- Copy numbers
- Confirmation dialogs

Components used:
- Tabs, Tab
- IconButton
- Dialog
- Alert
- NumbersBall

#### Stats
Comprehensive statistics and visualizations.

**Route**: `/stats`

Features:
- Overview stats cards
- Frequency grid (49 numbers)
- Hot numbers top 10
- Cold numbers top 10
- Most common pairs (top 5)
- Most common triples (top 5)

Components used:
- Grid, Card
- Paper
- LinearProgress
- NumbersBall

### Services

#### API Client
Axios-based API client with TypeScript.

**Location**: `src/services/api.ts`

Methods:
```tsx
api.uploadCSV(file: File): Promise<Draw[]>
api.getStats(): Promise<Stats>
api.generatePicks(request: GenerateRequest): Promise<Pick[]>
api.getPicks(): Promise<Pick[]>
api.getDraws(): Promise<Draw[]>
api.getPick(id: number): Promise<Pick>
api.getDraw(id: number): Promise<Draw>
api.deletePick(id: number): Promise<void>
api.deleteDraw(id: number): Promise<void>
api.clearPicks(): Promise<void>
api.clearDraws(): Promise<void>
```

Configuration:
```tsx
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000'
timeout: 10000
```

### Types

#### Core Types
**Location**: `src/types/index.ts`

```tsx
interface Stats {
  total_draws: number
  total_picks: number
  unique_combinations: number
  number_frequency: Record<number, number>
  most_common_number: number
  least_common_number: number
  hot_numbers: number[]
  cold_numbers: number[]
  most_common_pairs: Pair[]
  most_common_triples: Triple[]
}

interface Pick {
  id: number
  numbers: number[]
  strategy: Strategy
  created_at: string
}

interface Draw {
  id: number
  numbers: number[]
  draw_date: string
  created_at: string
}

type Strategy = 'random' | 'hot' | 'cold' | 'balanced' | 'combo_based'
```

### Theme

Custom Material UI theme with purple gradient.

**Location**: `src/theme.ts`

Colors:
- Primary: Purple gradient (#667eea → #764ba2)
- Secondary: Gold (#f093fb → #f5576c)
- Background: Light gray (#f5f5f5)

Typography:
- Font family: 'Roboto', sans-serif
- Font weights: 300, 400, 500, 700

Custom components:
- Button with hover animations
- Card with shadow effects
- AppBar with gradient

### State Management

#### React Query
Used for server state management.

Features:
- Automatic caching
- Background refetching
- Optimistic updates
- Error handling

Example:
```tsx
const { data: stats } = useQuery({
  queryKey: ['stats'],
  queryFn: api.getStats,
})
```

#### Zustand (Optional)
Can be used for client state if needed.

### Routing

React Router 6 with nested routes.

**Location**: `src/App.tsx`

Routes:
```tsx
<Routes>
  <Route path="/" element={<Layout><Dashboard /></Layout>} />
  <Route path="/generate" element={<Layout><Generate /></Layout>} />
  <Route path="/history" element={<Layout><History /></Layout>} />
  <Route path="/stats" element={<Layout><Stats /></Layout>} />
</Routes>
```

### Running

#### Development
```bash
cd frontend
npm install
npm run dev
```

Access: http://localhost:5173

#### Production Build
```bash
npm run build
npm run preview
```

#### Docker
```bash
# Development
docker-compose -f docker-compose.dev.yml up frontend

# Production
docker-compose up frontend
```

### Environment Variables

Create `.env` file:
```bash
VITE_API_URL=http://localhost:8000
```

### Scripts

```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "lint": "eslint . --ext ts,tsx"
}
```

### Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "@mui/material": "^5.15.0",
  "@mui/icons-material": "^5.15.0",
  "@emotion/react": "^11.11.0",
  "@emotion/styled": "^11.11.0",
  "react-router-dom": "^6.21.0",
  "@tanstack/react-query": "^5.17.0",
  "axios": "^1.6.0",
  "zustand": "^4.5.0"
}
```

### Build Configuration

#### Vite
**Location**: `vite.config.js`

```js
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173
  }
})
```

#### TypeScript
**Location**: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true
  }
}
```

### Styling

Material UI components with custom theme.

Example:
```tsx
<Button
  variant="contained"
  sx={{
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    '&:hover': {
      transform: 'scale(1.05)',
    }
  }}
>
  Click me
</Button>
```

### Best Practices

1. **Type Safety**: Use TypeScript for all components
2. **Component Composition**: Break down complex components
3. **React Query**: Use for all API calls
4. **Material UI**: Use sx prop for styling
5. **Error Handling**: Show user-friendly error messages
6. **Loading States**: Show spinners/skeletons

### Testing

```bash
# Run tests (if available)
npm test

# Coverage
npm run test:coverage
```

### Performance

- Code splitting with React.lazy
- Memoization with React.memo
- React Query caching
- Vite fast HMR

### Troubleshooting

**Port already in use**
```bash
# Kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**Module not found**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors**
```bash
# Clear cache
rm -rf node_modules/.vite
npm run dev
```

**Build fails**
```bash
# Check TypeScript
npx tsc --noEmit

# Clean build
rm -rf dist
npm run build
```

### Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support

### Future Improvements

- [ ] Add unit tests (Vitest)
- [ ] Add E2E tests (Playwright)
- [ ] Add PWA support
- [ ] Add dark mode
- [ ] Add internationalization (i18n)
- [ ] Add mobile responsive design improvements
- [ ] Add animations with Framer Motion
- [ ] Add charts with Recharts
- [ ] Add error boundary
- [ ] Add lazy loading

### Support

For issues, check:
1. Browser console for errors
2. Network tab for API calls
3. React DevTools
4. Material UI documentation: https://mui.com

### Resources

- [React Documentation](https://react.dev)
- [Material UI](https://mui.com)
- [React Query](https://tanstack.com/query)
- [Vite](https://vitejs.dev)
- [TypeScript](https://www.typescriptlang.org)
