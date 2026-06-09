# Frontend - HumanWrite Pro

React + TypeScript + Vite frontend application for the HumanWrite Pro text humanization tool.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Starts Vite development server at `http://localhost:5173`

### Build

```bash
npm run build
```

Creates optimized production build in `dist/` directory

### Preview

```bash
npm run preview
```

Preview production build locally

### Lint

```bash
npm run lint
```

Check code for issues using ESLint

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── TextInputArea.tsx      # Text input with word count
│   ├── OutputSection.tsx      # Output display with export
│   ├── ControlPanel.tsx       # Settings and humanize button
│   ├── Header.tsx             # App header with theme toggle
│   └── Disclaimer.tsx         # Legal disclaimer
├── hooks/                # Custom React hooks
│   └── useDarkMode.ts        # Dark mode management
├── pages/                # Page components
├── utils/                # Utility functions
├── styles/               # Style files
├── App.tsx               # Main App component
├── App.css               # App styles
├── main.tsx              # Entry point
└── index.css             # Global styles
```

## 🎨 Components

### TextInputArea
- Large textarea for AI-generated text input
- Real-time word counter
- Character limit indicator (50,000 max)
- Glassmorphic design

### OutputSection
- Displays humanized text output
- Copy button with feedback
- Download as .txt
- Download as .docx
- Loading animation

### ControlPanel
- Mode selector (4 modes)
- Tone slider (Formal ↔ Casual)
- Complexity slider
- Feature toggles (Vocabulary, Highlights)
- Humanize button with loading state

### Header
- App branding
- Dark/Light mode toggle
- Sticky positioning

### Disclaimer
- Legal disclaimer about AI detection bypass
- Always visible

## 🌓 Dark Mode

The application uses the `useDarkMode` hook to manage theme state:
- Persists user preference to localStorage
- Respects system preferences on first visit
- Smooth transitions between themes
- Glassmorphic effects in both modes

## 🔌 API Integration

The frontend communicates with the backend via Axios:

**Endpoint**: `POST /api/humanize`

```typescript
const response = await axios.post('/api/humanize', {
  text: string,
  mode: 'standard' | 'advanced' | 'academic' | 'creative',
  tone: number (0-1),
  complexity: number (0-1),
  vocabulary: boolean,
  highlights: boolean,
})
```

## 🎨 Styling

- **Tailwind CSS**: Utility-first CSS framework
- **CDN**: Loaded from Tailwind CDN
- **Custom CSS**: Global styles in `index.css`
- **Glassmorphism**: Backdrop blur effects
- **Responsive**: Mobile-first design approach

### Key CSS Classes

- `.glass`: Light glassmorphic backgrounds
- `.glass-dark`: Dark glassmorphic backgrounds
- `.transition-dark`: Smooth theme transitions
- `.animate-fade-in`: Fade-in animation

## ⚙️ Configuration

### Vite Config
```typescript
// vite.config.ts
server.proxy['/api'] → http://localhost:5000/api
```

This proxies API calls to the backend during development.

## 📦 Dependencies

- **react**: ^18.2.0 - UI library
- **react-dom**: ^18.2.0 - React DOM rendering
- **axios**: ^1.6.0 - HTTP client

## 🛠️ Dev Dependencies

- **@vitejs/plugin-react**: ^4.2.1
- **@types/react**: ^18.2.43
- **@types/react-dom**: ^18.2.17
- **typescript**: ^5.2.2
- **vite**: ^5.0.8

## 📱 Responsive Design

- **Mobile**: Single column layout, touch-optimized
- **Tablet**: 1-2 column layout
- **Desktop**: 3-column grid with sticky sidebar

Breakpoints:
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

## 🔒 Environment Variables

No frontend environment variables required by default.

## 🐛 Debugging

### Component Debugging
React DevTools browser extension recommended:
- Chrome: React Developer Tools
- Firefox: React Developer Tools

### Network Debugging
Check browser Network tab:
- API requests to `/api/humanize`
- Response times and payloads
- Error responses

### Theme Debugging
Check localStorage:
```javascript
localStorage.getItem('theme') // Returns 'dark' or 'light'
```

## 📊 Performance

- **Vite**: Sub-second HMR (Hot Module Replacement)
- **Code Splitting**: Automatic chunk splitting on build
- **Tree Shaking**: Unused code elimination
- **Lazy Loading**: Route-based code splitting

## 🚀 Production Build

```bash
npm run build
```

Output: `dist/` directory

Deploy to:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting

## 🔗 Links

- [Vite Docs](https://vitejs.dev)
- [React Docs](https://react.dev)
- [Tailwind Docs](https://tailwindcss.com)
- [TypeScript Docs](https://www.typescriptlang.org)

## 🎓 Learning Notes

### useState Hook
Used for managing component state:
```typescript
const [inputText, setInputText] = useState('')
```

### useEffect Hook
Would be used for side effects (not currently used in main App)

### Custom Hooks
`useDarkMode`: Encapsulates dark mode logic

## 📝 Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for React + TS
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Comments**: JSDoc for functions, inline for complex logic

---

**Frontend for HumanWrite Pro - Transform AI text into natural, human-like writing**
