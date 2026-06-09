# HumanWrite Pro - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Get the Code Ready
```bash
# Navigate to the AI Humanizer directory
cd "AI Humanizer"
```

### Step 2: Install Dependencies (Frontend)
```bash
cd frontend
npm install
```

### Step 3: Install Dependencies (Backend)
```bash
# In a new terminal or after frontend install finishes
cd backend
npm install
```

### Step 4: Start the Backend
```bash
# From the backend directory
npm run dev
```

**Expected Output:**
```
╔═══════════════════════════════════════════════════════╗
║     🚀 HumanWrite Pro Backend Server Started        ║
║     Server running on http://localhost:5000          ║
║     API endpoint: http://localhost:5000/api          ║
╚═══════════════════════════════════════════════════════╝
```

### Step 5: Start the Frontend (New Terminal)
```bash
# From the frontend directory
npm run dev
```

**Expected Output:**
```
  VITE v5.0.8  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Step 6: Open Your Browser
Navigate to: **http://localhost:5173**

🎉 **You're all set!**

---

## 🎯 How to Use HumanWrite Pro

### Basic Workflow
1. **Paste AI Text** → Enter your robotic/AI-generated text in the large textarea
2. **Choose Mode** → Select from 4 modes:
   - ✍️ **Standard Mode**: Basic improvements
   - 🚀 **Advanced**: Deep transformation
   - 📚 **Academic**: Formal scholarly style
   - 🎨 **Creative**: Engaging narrative
3. **Adjust Settings** → Fine-tune:
   - 🎙️ Tone (Formal ↔ Casual)
   - 📊 Complexity (Simple ↔ Complex)
   - 📖 Vocabulary (Toggle enhancement)
   - ✨ Highlights (View improvements)
4. **Humanize** → Click "✨ Humanize Text" button
5. **Export** → Copy, download .txt, or .docx

### Example

**Input (AI text):**
```
The system demonstrates the implementation of algorithms for data processing. The algorithms show increased efficiency levels. 
```

**Output (Standard Mode):**
```
The system demonstrates the implementation of algorithms for data processing. These algorithms show notably increased efficiency levels.
```

---

## 🛠️ Development Commands

### Frontend
```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Check for lint errors
```

### Backend
```bash
npm run dev      # Start dev server (http://localhost:5000)
npm run build    # Compile TypeScript
npm start        # Run compiled JavaScript
```

---

## 📁 File Organization

```
frontend/
├── src/
│   ├── components/    # UI Components
│   ├── hooks/         # React Hooks
│   ├── App.tsx        # Main App
│   └── main.tsx       # Entry point
├── index.html
└── vite.config.ts

backend/
├── src/
│   ├── services/      # Business Logic
│   ├── controllers/   # API Handlers
│   ├── routes/        # Endpoints
│   └── server.ts      # Express App
└── package.json
```

---

## 🌓 Dark/Light Mode

Click the **☀️/🌙** button in the header to toggle themes.

The preference is saved automatically.

---

## 💾 Export Options

### Copy Text
Click **"Copy Text"** button to copy to clipboard

### Download .txt
Click **"Download .txt"** for plain text file

### Download .docx
Click **"Download .docx"** for Word document

---

## ⚙️ Configuration

### Backend Port
Edit `backend/.env`:
```
PORT=5000
```

### Frontend API Base
The frontend automatically proxies to `http://localhost:5000`

To change: Edit `frontend/vite.config.ts`

---

## 🐛 Troubleshooting

### "Cannot find module" Error
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use
```bash
# Find process using port 5000 (Windows)
netstat -ano | findstr :5000

# Find process using port 5173
netstat -ano | findstr :5173

# Kill process (Windows - replace PID)
taskkill /PID <PID> /F
```

### CORS Errors
Ensure backend is running on localhost:5000
Check the proxy setting in `frontend/vite.config.ts`

### No Text Output
1. Check browser console for errors (F12)
2. Check backend console output
3. Verify API is responding: `http://localhost:5000/api/health`

---

## 📊 API Testing

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Test Humanization
```bash
curl -X POST http://localhost:5000/api/humanize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "The algorithm demonstrates the implementation process efficiently.",
    "mode": "standard",
    "tone": 0.5,
    "complexity": 0.5,
    "vocabulary": false
  }'
```

---

## 🚀 Next Steps

### Customize Humanization
Edit `backend/src/services/humanizationService.ts` to:
- Add new replacement patterns
- Modify transformation logic
- Create custom modes

### Enhance UI
Edit components in `frontend/src/components/` to:
- Add new features
- Customize styling
- Improve layout

### Deploy
See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- Vercel deployment
- Heroku deployment
- Docker containerization
- AWS deployment

---

## 📚 Documentation

- [Main README](./README.md) - Full project details
- [Frontend README](./frontend/README.md) - React/Vite details
- [Backend README](./backend/README.md) - Express/API details
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment

---

## 💡 Tips & Tricks

1. **Bulk Processing**: Paste and humanize multiple texts sequentially
2. **Mode Comparison**: Try different modes to see which works best
3. **Tone Tuning**: Experiment with tone slider for specific results
4. **Vocabulary Boost**: Enable vocabulary enhancer for more sophisticated options
5. **Dark Mode**: Use dark mode for extended coding sessions

---

## 🆘 Getting Help

**Issues?** Check:
1. Browser console (F12 → Console tab)
2. Terminal output where backend is running
3. Network tab (F12 → Network tab) to see API requests
4. .gitignore is correctly set up

---

## 📞 Support

Create an issue on GitHub with:
- Steps to reproduce
- Expected vs actual behavior
- Error messages/screenshots
- Environment (OS, Node version)

---

**Happy humanizing! ✨**
