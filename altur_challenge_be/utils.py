import os
import io
from mutagen.mp3 import MP3
from mutagen.wave import WAVE
from supabase import create_client
from elevenlabs.client import ElevenLabs
from config import (
    ELEVENLABS_API_KEY,
    SUPABASE_URL,
    SUPABASE_KEY,
    ALLOWED_EXTENSIONS,
)
from agent import (
    analyze_call,
)

# Client Initialization
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
elevenlabs_client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

def allowed_files(filename):
    """Check if file extension is allowed"""
    ext = os.path.splitext(filename)[1].lower()
    return ext in ALLOWED_EXTENSIONS

def transcribe_elevenlabs(file_bytes, model_id='scribe_v1'):
    try:
        audio_file = io.BytesIO(file_bytes)
        transcription_result = elevenlabs_client.speech_to_text.convert(
            file=audio_file,
            model_id=model_id,
            diarize=True, # Enables speaker recognition
        )
        return transcription_result

    except Exception as e:
        print(f"ElevenLabs transcription error: {str(e)}")
        raise Exception(f"ElevenLabs API error: {str(e)}")
    
def get_audio_duration(file_bytes, filename):
    """
    Extract duration in seconds from audio file
    Support in .wav and .mp3 format
    """
    ext = os.path.splitext(filename)[1].lower()
    audio_file = io.BytesIO(file_bytes)

    try:
        if ext == '.mp3':
            audio = MP3(audio_file)
            duration_seconds = audio.info.length
        elif ext == '.wav':
            audio = WAVE(audio_file)
            duration_seconds = audio.info.length
        else:
            return 0
        return int(duration_seconds)  # Return total seconds
    except Exception as e:
        print(f"Error extracting audio duration: {e}")
        return 0

def generate_ai_insights(transcription_text):
    return analyze_call(transcription_text)

# db / supabase methods
def create_call_record(filename, duration_seconds, transcription_text, language_code='eng', translated_transcription=None):
    """
    Insert initial call record into Supabase calls table.
    Returns UUID of the call record created
    """
    data = {
        'filename': filename,
        'duration': duration_seconds, 
        'transcription': transcription_text, 
        'insights': None # will be updated later
    }

    result = supabase.table('calls').insert(data).execute()

    if result.data:
        return result.data[0]['id']
    else:
        raise Exception("Failed to create call record in Supabase")

def update_call_insights(call_id, insights):
    """
    Update insights column for a call record
    """
    result = supabase.table('calls').update({
        'insights':insights
    }).eq('id',call_id).exectute()

    if not result.data:
        raise Exception(f"Failed to update insights field for call {call_id}")
    return result.data[0]

def get_call_by_id(call_id):
    result = supabase.table('calls').select(1).eq('id',call_id).execute()
    if result.data and len(result.data) > 0:
        return result.data[0]
    return None