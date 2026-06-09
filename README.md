# HumanWrite Pro - Premium AI Text Humanizer

Transform robotic or AI-generated text into natural, human-like writing with improved clarity, tone, and flow.

![HumanWrite Pro](https://img.shields.io/badge/HumanWrite-Pro-blue)
![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 Features

### Core Capabilities
- ✨ **Smart Rewriting Modes**: Standard, Advanced, Academic, and Creative modes
- 🎨 **Tone Control**: Adjust from formal to casual (0-100% scale)
- 📚 **Vocabulary Enhancement**: Replace common words with sophisticated alternatives
- 🔄 **Sentence Complexity Control**: Simplify or complexify sentence structures
- 🎯 **Improvement Highlighting**: Optional toggle to see what was changed
- ⚡ **Lightning-Fast Processing**: Instant humanization with smooth animations

### UI/UX Features
- 🌓 **Dark/Light Mode**: Premium glassmorphic design in both themes
- 📱 **Fully Responsive**: Optimized for mobile, tablet, and desktop
- 💾 **Multiple Export Formats**: Download as .txt or .docx
- 📊 **Real-time Stats**: Word count and character tracking
- 🚀 **Smooth Animations**: Professional micro-interactions throughout

### Premium Design
- Glass morphism effects with blur
- Soft shadows and gradients
- Smooth transitions and animations
- Modern SaaS-like aesthetic
- Accessibility-first approach

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool (lightning fast)
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **CORS** - Cross-origin support
- **Modular Architecture** - Service-based design

## 📁 Project Structure

```
AI Humanizer/
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── TextInputArea.tsx
│   │   │   ├── OutputSection.tsx
│   │   │   ├── ControlPanel.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Disclaimer.tsx
│   │   ├── hooks/              # Custom React hooks
│   │   │   └── useDarkMode.ts
│   │   ├── pages/              # Page components
│   │   ├── utils/              # Utility functions
│   │   ├── styles/             # Global styles
│   │   ├── App.tsx             # Main App component
│   │   ├── main.tsx            # Entry point
│   │   └── index.css           # Global CSS
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── index.html
│
├── backend/                     # Node.js/Express backend
│   ├── src/
│   │   ├── services/           # Business logic
│   │   │   ├── humanizationService.ts
│   │   │   └── serviceFactory.ts
│   │   ├── controllers/        # Request handlers
│   │   │   └── humanizeController.ts
│   │   ├── routes/             # API routes
│   │   │   └── humanize.ts
│   │   ├── middleware/         # Express middleware
│   │   │   └── errorHandler.ts
│   │   └── server.ts           # Express app setup
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                    # Environment variables
│   └── .gitignore
│
├── README.md                   # This file
└── .gitignore
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

#### 1. Clone the repository
```bash
git clone <repository-url>
cd "AI Humanizer"
```

#### 2. Setup Backend
```bash
cd backend
npm install
```

#### 3. Setup Frontend
```bash
cd ../frontend
npm install
```

## 🏃 Running the Application

### Terminal 1 - Start Backend Server
```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

### Terminal 2 - Start Frontend Development Server
```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

Open your browser and navigate to `http://localhost:5173`

## 📖 Usage

1. **Paste Text**: Enter AI-generated or robotic text in the input area
2. **Select Mode**: Choose your preferred rewriting mode:
   - **Standard Mode**: Basic humanization
   - **Advanced Humanizer**: Deep multi-layer transformation
   - **Academic Rewrite**: Formal scholarly tone
   - **Creative Rewrite**: Engaging narrative style
3. **Adjust Settings**:
   - **Tone**: Formal ←→ Casual
   - **Complexity**: Simple ←→ Complex
   - **Vocabulary**: Enable enhanced vocabulary
   - **Highlights**: Toggle improvement highlighting
4. **Humanize**: Click the "✨ Humanize Text" button
5. **Export**: Copy, download as .txt, or download as .docx

## 🔧 API Endpoints

### POST `/api/humanize`
Humanize text with specified parameters.

**Request Body:**
```json
{
  "text": "Your text here",
  "mode": "standard|advanced|academic|creative",
  "tone": 0-1,
  "complexity": 0-1,
  "vocabulary": true|false,
  "highlights": true|false
}
```

**Response:**
```json
{
  "humanizedText": "...",
  "originalText": "...",
  "mode": "standard",
  "parameters": {
    "tone": 0.5,
    "complexity": 0.5,
    "vocabulary": false
  },
  "stats": {
    "originalLength": 150,
    "humanizedLength": 165,
    "originalWords": 25,
    "humanizedWords": 28
  },
  "highlights": []
}
```

### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "HumanWrite Pro API is running",
  "timestamp": "2026-04-11T..."
}
```

## 🎨 Humanization Modes

### Standard Mode
- Removes repetitive phrases
- Adds sentence variety
- Adjusts tone
- Best for: General text improvements

### Advanced Mode
- All Standard features plus:
- Text flow improvement
- Human touch additions
- Complexity control
- Best for: Comprehensive humanization

### Academic Mode
- Formal tone enforcement
- Academic vocabulary
- Scholarly phrasing
- Best for: Essays, papers, research

### Creative Mode
- Engaging language
- Narrative elements
- Expressive phrasing
- Best for: Stories, content, blogs

## 📊 Text Statistics

The application tracks:
- Character count (with limit indicator)
- Word count (real-time)
- Original vs. humanized length comparison
- Processing time

## ⚖️ Disclaimer

**Important**: This tool improves writing quality, clarity, and tone to create more natural-sounding text. However, it does **NOT guarantee AI detection bypass**. The tool focuses on genuine writing enhancement rather than circumventing detection systems.

Always ensure your use complies with:
- Platform policies
- Academic integrity standards
- Content guidelines

## 🔐 Privacy & Data

- All processing is performed server-side
- Text is not stored permanently
- No tracking or analytics
- No third-party integrations by default

## 🚧 Future Enhancements

- [ ] Real-time preview as user types
- [ ] Side-by-side comparison view
- [ ] Custom tone profiles
- [ ] Support for multiple languages
- [ ] Batch processing
- [ ] API rate limiting & authentication
- [ ] Advanced NLP-based humanization
- [ ] DOCX format with styling
- [ ] Grammar and spell-check integration
- [ ] User accounts and history

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💬 Support

For issues, questions, or suggestions:
1. Check existing issues
2. Create a new issue with detailed description
3. Include steps to reproduce for bugs

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## 📝 Changelog

### Version 1.0.0 (Initial Release)
- ✨ Core humanization engine
- 🎨 Premium UI with dark/light mode
- 📱 Fully responsive design
- 🔄 Multiple rewriting modes
- 💾 Export functionality
- 🎯 Real-time controls

---

**Made with ❤️ to help you write better, more natural text**
