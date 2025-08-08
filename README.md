# 🍳 Master Gourmet

**AI-Powered Recipe Management App**

Master Gourmet is a modern web application that revolutionizes recipe management by using artificial intelligence to automatically extract recipes from cooking videos. Upload your own videos or import Instagram Reels to get AI-generated recipes with ingredients, instructions, and cooking details.

## ✨ Features

### 🎥 **Video Recipe Extraction**
- Upload cooking videos directly to the app
- AI analyzes video frames to identify ingredients and techniques
- Automatic audio transcription for complete recipe instructions
- Smart combination of visual and audio analysis for accuracy

### 📱 **Instagram Integration**
- Import recipes from Instagram Reels
- Step-by-step guide for downloading Instagram videos
- Seamless integration with popular video downloaders

### 🤖 **AI-Powered Analysis**
- **GPT-4o Vision**: Advanced image analysis for ingredient recognition
- **Whisper API**: Professional audio transcription in Portuguese
- **Smart Enhancement**: Combines visual and audio data for complete recipes
- Automatic extraction of cooking time, servings, and difficulty level

### 📚 **Recipe Management**
- Personal recipe collection with database storage
- Edit and customize AI-generated recipes
- Favorite recipes for quick access
- Advanced search functionality
- Recipe statistics and analytics

### 📱 **Mobile-First Design**
- Responsive design optimized for mobile devices
- Native app-like experience with bottom navigation
- Touch-friendly interface with intuitive gestures
- Custom gourmet-themed color palette

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for responsive styling
- **Shadcn/ui** component library
- **TanStack Query** for server state management
- **Wouter** for lightweight routing

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Drizzle ORM** for database operations
- **Multer** for file upload handling
- **FFmpeg** for video processing

### Database & Storage
- **PostgreSQL** with Neon serverless driver
- **File system** storage for videos and thumbnails
- **Session management** with connect-pg-simple

### AI & External APIs
- **OpenAI GPT-4o** for recipe analysis
- **OpenAI Whisper** for audio transcription
- **yt-dlp** for video downloading

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (or Neon account)
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/Master_Gourmet.git
cd Master_Gourmet
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/master_gourmet

# Optional: Session Secret
SESSION_SECRET=your_session_secret_here
```

4. **Set up the database**
```bash
npm run db:push
```

5. **Start the development server**
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## 🔧 Configuration

### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add it to your `.env` file as `OPENAI_API_KEY`

### Database Setup Options

#### Option 1: Neon (Recommended)
1. Sign up at [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string to your `.env` file

#### Option 2: Local PostgreSQL
1. Install PostgreSQL locally
2. Create a database named `master_gourmet`
3. Update the `DATABASE_URL` in `.env`

#### Option 3: Supabase
1. Create a project at [Supabase](https://supabase.com)
2. Get the database URL from Settings > Database
3. Add to your `.env` file

## 📖 How to Use

### 1. **Upload a Video Recipe**
- Click the "+" button on the home screen
- Select "Upload Video"
- Choose a cooking video from your device
- Add optional title and description
- Let AI analyze and extract the recipe

### 2. **Import from Instagram**
- Copy the Instagram Reel URL
- Click "+" and select "From Instagram"
- Paste the URL or follow the manual download guide
- AI will process the video and create the recipe

### 3. **Manage Your Recipes**
- Browse your recipe collection on the home page
- Search recipes by name or ingredients
- Edit AI-generated recipes to your preference
- Mark favorites for quick access
- Share recipes with friends

## 🎯 AI Features Explained

### Visual Analysis
The AI examines video frames to identify:
- Visible ingredients and their quantities
- Cooking techniques and equipment
- Preparation steps and timing
- Visual cues for doneness

### Audio Transcription
Whisper API processes audio to capture:
- Spoken ingredient lists
- Detailed cooking instructions
- Tips and variations
- Timing and temperature guidance

### Smart Enhancement
The system combines both analyses to:
- Create comprehensive ingredient lists
- Generate step-by-step instructions
- Estimate cooking times and servings
- Determine difficulty levels

## 📁 Project Structure

```
master-gourmet/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Backend Express application
│   ├── services/           # Business logic services
│   ├── routes.ts           # API route definitions
│   └── storage.ts          # Database operations
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema and types
└── uploads/                # Uploaded video files
```

## 🔒 Security & Privacy

- API keys are stored as environment variables
- User data is stored securely in PostgreSQL
- File uploads are validated and sanitized
- No sensitive data is logged or exposed

## 🚀 Deployment

### Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push

### Deploy to Railway
1. Connect repository to Railway
2. Configure environment variables
3. Deploy with automatic HTTPS

## 📊 Performance

- **Fast Loading**: Optimized with Vite and code splitting
- **Efficient Queries**: Smart caching with TanStack Query
- **Image Optimization**: Automatic thumbnail generation
- **Mobile Optimized**: Touch-friendly interface

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT-4o and Whisper APIs
- **Shadcn/ui** for beautiful UI components
- **Radix UI** for accessible primitives
- **Tailwind CSS** for utility-first styling

