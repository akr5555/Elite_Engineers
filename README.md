# Elite Engineer Discovery Platform 🚀

> **AI-Powered Engineer Discovery Based on Proof-of-Work, Not Resumes**

A full-stack platform that helps you discover and evaluate top software engineers using real GitHub data, AI-powered compatibility scoring, and trust metrics.

## ✨ Features

### 🎯 Core Capabilities
- **GitHub Integration**: Automatically fetch and analyze real GitHub profiles
- **AI Scoring**: Intelligent compatibility and trust score calculations
- **Real-Time Data**: Live integration between frontend and backend (no dummy data)
- **Advanced Search**: Filter engineers by skills, experience, and compatibility
- **Side-by-Side Comparison**: Compare up to 3 engineers with visual analytics
- **Explainable AI**: Understand why each engineer is recommended

### 🛠️ Technical Stack

**Frontend:**
- React 18 with TypeScript
- TanStack Query (React Query) for data fetching
- shadcn/ui component library
- Tailwind CSS for styling
- Recharts for data visualization
- React Router for navigation

**Backend:**
- FastAPI (Python) for REST API
- SQLAlchemy ORM with SQLite
- Pydantic for data validation
- GitHub API integration
- AI-powered scoring algorithms

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd Elite
```

2. **Backend Setup**
```bash
cd ai-engine
pip install -r requirements.txt
```

3. **Frontend Setup**
```bash
cd frontend
npm install
```

### Running the Application

1. **Start Backend** (Terminal 1)
```bash
cd ai-engine
python -m uvicorn app.main:app --reload
```
Backend runs on: http://localhost:8000

2. **Seed Database** (Terminal 2 - First Time Only)
```bash
cd ai-engine
python seed_data.py
```

3. **Start Frontend** (Terminal 3)
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:5173

4. **Open in Browser**
```
http://localhost:5173
```

## 📚 Documentation

- **[Quick Start Guide](QUICK_START.md)** - Get up and running in 2 minutes
- **[Setup Guide](SETUP_GUIDE.md)** - Detailed installation and configuration
- **[Integration Guide](INTEGRATION_GUIDE.md)** - How frontend and backend work together
- **[API Documentation](http://localhost:8000/docs)** - Interactive API docs (when backend is running)

## 🏗️ Project Structure

```
Elite/
├── ai-engine/                  # Backend (FastAPI)
│   ├── app/
│   │   ├── main.py            # FastAPI entry point
│   │   ├── config.py          # Configuration
│   │   ├── database.py        # Database connection
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── api/routes/        # API endpoints
│   │   ├── services/          # Business logic
│   │   │   ├── github_service.py    # GitHub API integration
│   │   │   └── scoring_service.py   # AI scoring algorithms
│   │   └── utils/             # Helper functions
│   ├── elite.db               # SQLite database
│   ├── seed_data.py           # Database seeding script
│   ├── requirements.txt       # Python dependencies
│   └── README.md
│
├── frontend/                   # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── App.tsx            # Main app component
│   │   ├── pages/             # Page components
│   │   │   ├── Dashboard.tsx         # Engineer listing
│   │   │   ├── EngineerProfile.tsx   # Profile details
│   │   │   ├── AddEngineer.tsx       # Add new engineer
│   │   │   └── Compare.tsx           # Compare engineers
│   │   ├── components/        # Reusable UI components
│   │   ├── services/
│   │   │   └── api.ts         # Backend API client
│   │   └── data/
│   │       └── engineers.ts   # Type definitions & transformers
│   ├── package.json
│   └── README.md
│
├── QUICK_START.md             # Quick start guide
├── SETUP_GUIDE.md             # Detailed setup instructions
├── INTEGRATION_GUIDE.md       # Frontend-backend integration docs
└── README.md                  # This file
```

## 🎯 Key Features in Detail

### 1. Engineer Dashboard
- View all engineers with compatibility scores
- Search by name, role, or skills
- Filter by specific technical skills
- Real-time data from backend API
- Responsive grid layout

### 2. Engineer Profile
- Detailed GitHub statistics
- Compatibility score breakdown
- Trust meter with evidence
- AI-generated highlights
- Recent activity visualization
- Language distribution charts

### 3. Add Engineer
- Simple form interface
- Automatic GitHub data fetching
- AI score calculation
- Real-time validation
- Success feedback

### 4. Compare Engineers
- Select up to 3 engineers
- Radar chart for compatibility metrics
- Bar chart for GitHub stats
- Skill matrix comparison
- Side-by-side profile viewing

## 🔌 API Endpoints

### Engineers
```
GET    /api/engineers          # List all engineers
POST   /api/engineers          # Create new engineer
GET    /api/engineers/{id}     # Get engineer by ID
PUT    /api/engineers/{id}     # Update engineer
DELETE /api/engineers/{id}     # Delete engineer
POST   /api/engineers/{id}/sync # Sync GitHub data
```

### Health
```
GET    /api/health             # API health check
```

Full API documentation available at http://localhost:8000/docs when backend is running.

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd ai-engine
pytest
```

### Integration Testing
See [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) for detailed test scenarios.

## 🔐 Environment Variables

### Backend (.env in ai-engine/)
```env
DATABASE_URL=sqlite:///./elite.db
GITHUB_TOKEN=your_github_personal_access_token
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=["http://localhost:5173"]
```

### Frontend (.env in frontend/)
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## 🚀 Deployment

### Backend Deployment
1. Use PostgreSQL instead of SQLite for production
2. Set environment variables
3. Deploy to platforms like:
   - Heroku
   - AWS (EC2, ECS, Lambda)
   - Google Cloud Run
   - DigitalOcean App Platform

### Frontend Deployment
```bash
cd frontend
npm run build
```
Deploy the `dist/` folder to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [React](https://react.dev/) - UI library
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [TanStack Query](https://tanstack.com/query) - Data fetching
- [GitHub API](https://docs.github.com/en/rest) - Developer data source

## 📞 Support

For issues, questions, or contributions:
- Check the [Documentation](SETUP_GUIDE.md)
- Review [Integration Guide](INTEGRATION_GUIDE.md)
- Visit API docs: http://localhost:8000/docs

## ⭐ Features Roadmap

- [ ] User authentication and authorization
- [ ] Advanced filtering and sorting
- [ ] Export to PDF/CSV
- [ ] Email notifications
- [ ] Team collaboration features
- [ ] Custom scoring algorithm configuration
- [ ] GitLab integration
- [ ] Machine learning model improvements
- [ ] Real-time collaboration
- [ ] Mobile app

---

**Built with ❤️ using FastAPI and React**
