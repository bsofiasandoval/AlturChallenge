import os
from dotenv import load_dotenv

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

ALLOWED_EXTENSIONS = {".mp3", ".wav"}
MAX_CONTENT_LENGTH = 5 * 1024 * 1024 # Implement in future (audio file size limiting)
