# Smartbuilder 🚀
The world's first AI co-founder

Smartbuilder is an autonomous startup generation platform that uses FSM-driven orchestration and multi-provider AI to generate, build, and deploy MVPs.

## 🌟 Key Features
- **Autonomous Orchestration**: Deterministic Finite State Machine (FSM) for reliable startup building.
- **Multi-Provider AI**: Supports OpenAI (GPT-4o), Anthropic (Claude 3.5), and Google (Gemini 1.5).
- **Comprehensive Intelligence Layers**: Market research, business planning, and PRD generation.
- **Code Generation & Execution**: Integrated with E2B and TestSprite for verified output.
- **Premium UX**: Modern, reactive dashboard with real-time feedback.

## 🛠 Tech Stack
- **Backend**: FastAPI (Python), Supabase
- **Frontend**: Next.js 16 (App Router), TailwindCSS, Framer Motion
- **AI Clients**: OpenAI, Anthropic, Google GenAI
- **Infrastructure**: Docker, E2B, Base44

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 20+
- Docker (optional, for deployment)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/smartbuilder.git
   cd smartbuilder
   ```

2. **Set up environment variables**:
   ```bash
   cp env.template .env
   # Edit .env with your API keys
   ```

3. **Backend Setup**:
   ```bash
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

4. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🐳 Docker Deployment

To run the entire stack using Docker:

```bash
docker-compose up --build
```

The application will be available at `http://localhost:8000` (API) and your frontend setup.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
