# Altur Challenge - Call Analysis Application
## Prerequisites

- Python 3.9.6 or higher
- Node.js 16+ and npm
- Git for cloning repository

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

## Key Assumptions

**Speaker Configuration:**
- Designed primarily for 2-speaker conversations (the most common call scenario)
- UI and visualization optimized for this use case with distinct color coding (blue/purple)
- Graceful fallback handling for additional speakers (gray color scheme)

**Call Data:**
- Assumed audio files would be in MP3 or WAV format
- No strict limits on call duration, though longer calls increase API processing time
- Generic tag system designed to work across various call types

## Architectural & Design Decisions

**Stack Choices:**
1. **ElevenLabs for Transcription**
   - Selected for API ease of use and straightforward integration & clear documentation
   - Really good speaker diarization quality out of the box
   
2. **Next.js for Frontend**
   - Chose based on familiarity with the framework and ecosystem
   - Modern React patterns with App Router for better developer experience
   - TypeScript integration for type safety across the application

3. **Flask for Backend**
   - Lightweight Python framework perfect for API endpoints
   - Quick to set up and deploy
   - Easy integration with Python-based AI libraries (OpenAI, ElevenLabs)

4. **Unified Insights Column Design for Each Call**
   - Combined All AI-generated insights into a single JSON column instead of separate database fields
   - The `insights` column contains: summary, satisfaction_score, sentiment, tags, caller_intent, key_points, and recommended_action
   - **Benefits**: Simplifies database schema, makes insights easily extensible and modifiable
   - AI analysis logic centralized in `agent.py` - easy to add/modify insights that are generated
   - Used JSON type column
   - **Trade-off**: Requires client-side filtering instead of database-level queries

**Insight Selection Strategy:**

The specific insights extracted (satisfaction score, caller intent, recommended actions, etc.) were chosen based on:
- Real-world call analysis needs from previous project and conversations with stakeholders
- Focused on **actionable information**, users can quickly understand what happened without reading full transcripts
- Alignment with the challenge requirements

**Why I chose these Insights:**
- **Caller Intent**: Instantly know why someone called
- **Recommended Actions**: Get immediate next steps without manual analysis 
- **Satisfaction Score**: Quick metric for call quality
- **Tags**: Enable filtering and categorization across many calls (challenge req)
- **Sentiment**: Understand emotional tone of the conversation (to be improved)

## What Would Be Improved With More Time
**Priority 1: Optimize Analysis Processing Time**
- Currently the `/upload` endpoint blocks while transcribing and analyzing
- **Improvement**: Implement background job processing 
- Multi-step process: immediate upload confirmation → background processing → real-time status updates
- Users wouldn't have to wait on the upload screen

**Priority 2: Automatic Speaker Identification**
- Currently displays generic "Speaker 0" and "Speaker 1" labels after diarization
- **Improvement**: Use AI to automatically identify which speaker is which (customer vs. agent/support)
- Analyze conversation patterns, language, and context to determine roles
- Display meaningful labels like "Customer" and "Agent" instead of numbered speakers

**Priority 3: Production Readiness**
- More robust error handling with detailed error messages
- Retry logic for API failures (OpenAI, ElevenLabs)
- **File size limiting**: Enforce max file size (configured in `config.py` but not currently implemented) to prevent API abuse and control costs
- Rate limiting

**Additional Feature Ideas**
- Batch upload support for multiple files
- Export functionality (PDF reports, CSV data export)
- Analytics dashboard with aggregate statistics
- Search functionality across transcriptions
- User authentication and team collaboration features

