# Backend - HumanWrite Pro

Node.js + Express + TypeScript backend API for the HumanWrite Pro text humanization tool.

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

Starts the server at `http://localhost:5000`

### Build

```bash
npm run build
```

Compiles TypeScript to JavaScript in `dist/` directory

### Production

```bash
npm run build
npm start
```

Runs compiled JavaScript from `dist/`

## 📁 Project Structure

```
src/
├── services/             # Business logic
│   ├── humanizationService.ts    # Core humanization engine
│   └── serviceFactory.ts         # Service initialization
├── controllers/          # Request handlers
│   └── humanizeController.ts     # Humanize endpoint logic
├── routes/               # API routes
│   └── humanize.ts             # Humanize route definitions
├── middleware/           # Express middleware
│   └── errorHandler.ts         # Global error handling
└── server.ts            # Express app setup & startup
```

## 🔧 API Endpoints

### POST `/api/humanize`
Main humanization endpoint.

**Request Body:**
```json
{
  "text": "Your AI-generated text here",
  "mode": "standard|advanced|academic|creative",
  "tone": 0.5,
  "complexity": 0.5,
  "vocabulary": false,
  "highlights": false
}
```

**Parameters:**
- `text` (string, required): Text to humanize (max 50,000 characters)
- `mode` (string): Rewriting mode (default: 'standard')
- `tone` (number 0-1): 0 = formal, 1 = casual (default: 0.5)
- `complexity` (number 0-1): Sentence complexity level (default: 0.5)
- `vocabulary` (boolean): Enable vocabulary enhancement (default: false)
- `highlights` (boolean): Return improvement highlights (default: false)

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
  "highlights": [
    {
      "index": 0,
      "original": "demonstrate",
      "improved": "show",
      "type": "word"
    }
  ]
}
```

**Error Responses:**
```json
// Invalid input
{
  "error": "Invalid input",
  "message": "Text is required and must be a string"
}

// Empty text
{
  "error": "Empty text",
  "message": "Please provide some text to humanize"
}

// Text too long
{
  "error": "Text too long",
  "message": "Maximum 50,000 characters allowed"
}

// Server error
{
  "error": "Processing failed",
  "message": "An error occurred while processing your text"
}
```

### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "HumanWrite Pro API is running",
  "timestamp": "2026-04-11T12:34:56.789Z"
}
```

## 🎯 Humanization Modes

### Standard Mode
```
1. Remove repetitive phrases
2. Add sentence variety
3. Adjust tone
```

### Advanced Mode
```
1. Remove repetition
2. Add sentence variety
3. Improve flow
4. Add human touches
5. Adjust tone
6. Adjust complexity
```

### Academic Mode
```
1. Remove repetition
2. Add sentence variety
3. Academic vocabulary and phrasing
4. Maintain formal tone
```

### Creative Mode
```
1. Remove repetition
2. Add sentence variety
3. Add creative elements
4. Maintain casual/engaging tone
```

## 🔄 Humanization Service

The `HumanizationService` class contains the core algorithms:

### Main Methods

#### `humanize(text, mode, tone, complexity, vocabulary)`
Orchestrates all transformations based on selected mode.

#### Private transformation methods:
- `removeRepetition()`: Eliminates repeated phrases and words
- `addSentenceVariety()`: Varies sentence structures and starters
- `improveFlow()`: Adds transition words and coherence
- `addHumanTouches()`: Replaces robotic phrases
- `adjustTone()`: Formal to casual adjustments
- `adjustComplexity()`: Simplify or complexify sentences
- `makeAcademic()`: Academic vocabulary and phrasing
- `addCreativeElements()`: Engaging language
- `enhanceVocabulary()`: Replace words with sophisticated alternatives
- `simplifyText()`: Simplify complex words
- `complexifyText()`: Use more sophisticated vocabulary

## 📦 Dependencies

- **express**: ^4.18.2 - Web framework
- **cors**: ^2.8.5 - CORS support
- **dotenv**: ^16.3.1 - Environment variables
- **axios**: ^1.6.0 - HTTP client (for future integrations)

## 🛠️ Dev Dependencies

- **@types/express**: ^4.17.20
- **@types/node**: ^20.8.0
- **@types/cors**: ^2.8.15
- **typescript**: ^5.2.2
- **ts-node**: ^10.9.1

## ⚙️ Configuration

### Environment Variables (.env)
```
PORT=5000
NODE_ENV=development
```

### Server Configuration
```typescript
// middleware/cors
Enable cross-origin requests from frontend

// express.json
Limit: 10MB

// express.urlencoded
Limit: 10MB
```

## 🔐 Request Validation

- Text length: max 50,000 characters
- Text presence: required and non-empty
- Mode: validated against allowed modes
- Tone/Complexity: normalized to 0-1 range

## 🚀 Performance

- **Lightweight**: Minimal dependencies
- **Fast Processing**: Regex-based transformations
- **Memory Efficient**: String processing optimized
- **Stateless**: No database dependencies

## 📊 Logging

Console logs include:
- Request timestamps and methods
- API endpoint paths
- Server startup information
- Error details

## 🐛 Error Handling

- Global error handler middleware
- Input validation before processing
- Graceful error responses
- Stack trace logging

## 🔗 Integration

### Frontend Integration
The frontend connects via Axios:
```typescript
const response = await axios.post('/api/humanize', {
  text: inputText,
  mode,
  tone,
  complexity,
  vocabulary,
  highlights,
})
```

### CORS Configuration
Allows requests from:
- `http://localhost:5173` (frontend dev)
- Production frontend domain (configure as needed)

## 📈 Scalability

Future improvements for scale:
- Database for text history
- Caching layer (Redis)
- Rate limiting
- API key authentication
- NLP library integration (spaCy, NLTK)
- Microservices architecture

## 🔬 Testing

To test the API:

### Using cURL
```bash
curl -X POST http://localhost:5000/api/humanize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "The data shows that this is important.",
    "mode": "standard",
    "tone": 0.5,
    "complexity": 0.5,
    "vocabulary": false
  }'
```

### Using Postman
1. Create new POST request
2. URL: `http://localhost:5000/api/humanize`
3. Body (JSON): See cURL example
4. Send

### Using Code
```typescript
const response = await fetch('http://localhost:5000/api/humanize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Your text here',
    mode: 'standard',
    tone: 0.5,
    complexity: 0.5
  })
})
const data = await response.json()
console.log(data)
```

## 🔗 Links

- [Express Docs](https://expressjs.com)
- [Node.js Docs](https://nodejs.org/docs)
- [TypeScript Docs](https://www.typescriptlang.org)
- [Axios Docs](https://axios-http.com)

## 📝 Code Style

- **TypeScript**: Strict mode enabled
- **Naming**: camelCase for functions/variables
- **Comments**: JSDoc for public methods
- **Error Handling**: Try-catch with proper responses

## 🚀 Deployment

### Railway
```bash
npm run build
npm start
```

### Heroku
```bash
git push heroku main
```

### Docker
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY src ./src
RUN npm run build
CMD ["npm", "start"]
```

### Environment Setup
Set `NODE_ENV=production` on deployment

---

**Backend API for HumanWrite Pro - Transform AI text into natural, human-like writing**
