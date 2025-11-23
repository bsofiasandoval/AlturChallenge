# Altur Challenge - Call Analysis Application
## Prerequisites

- Python 3.9.6 or higher
- Node.js 16+ and npm
- Git

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AlturChallenge
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd altur_challenge_be
```

#### Create Virtual Environment

```bash
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

#### Install Dependencies

```bash
pip install -r requirements.txt
```

#### Environment Variables

You will receive a file named `environment_be.txt` via email. This file contains the required API keys and credentials.

**Setup steps:**
1. Place `environment_be.txt` in the `altur_challenge_be` directory
2. Rename it to `.env` manually

**Required environment variables** (included in the provided file):
- `ELEVENLABS_API_KEY` - For speech-to-text transcription
- `OPENAI_API_KEY` - For GPT-4 call analysis
- `SUPABASE_URL` - Database connection URL
- `SUPABASE_KEY` - Database access key

#### Run the Backend

```bash
python main.py
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd altur_challenge_fe
```

#### Install Dependencies

```bash
npm install
```

#### Environment Variables

You will receive a file named `environment_fe.txt` via email.

**Setup steps:**
1. Place `environment_fe.txt` in the `altur_challenge_fe` directory
2. Rename it to `.env.local` manually.


**Required environment variables** (included in the provided file):
- `NEXT_PUBLIC_API_URL` - Backend API endpoint (typically `http://localhost:5000`) 

#### Run the Frontend

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## Running Tests

### Backend Unit Tests

The backend includes unit tests for file upload validation.

#### Run Tests Locally

From the `altur_challenge_be` directory with your virtual environment activated:

```bash
# Run all tests
python -m pytest test_main.py -v
```

## Tech Stacks
**Backend:**
- Flask 3.1.2
- OpenAI API (GPT-4)
- ElevenLabs API (Speech-to-Text with speaker diarization)
- Supabase (PostgreSQL)
- pytest (Testing)

**Frontend:**
- Next.js 14+
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Lucide React icons

## Project Structure

```
AlturChallenge/
├── altur_challenge_be/          # Backend Flask application
│   ├── main.py                  # API endpoints
│   ├── agent.py                 # AI analysis logic
│   ├── utils.py                 # Database and helper functions
│   ├── test_main.py             # Unit tests
│   ├── requirements.txt         # Python dependencies
│   └── .env                     # Environment variables (Sent by email)
├── altur_challenge_fe/          # Frontend Next.js application
│   ├── app/                     # Next.js app directory
│   ├── components/              # React components
│   ├── types/                   # TypeScript type definitions
│   ├── lib/                     # Utility functions
│   └── .env.                    # Environment variables (Sent by email)
└── .github/
    └── workflows/
        └── test.yml             # CI/CD automated tests
```

## Future Improvements

Given more development time I would've liked to implement the following:

1. **Batch Upload:** Support multiple file uploads simultaneously
2. **Export Functionality:** Download call reports as PDF, CSV or JSON
3. **User Authentication:** Add user accounts and role-based access 
4. **Analytics Dashboard:** Aggregate statistics and trends across calls
5. **Error Handling:** More detailed error messages and handling logic

