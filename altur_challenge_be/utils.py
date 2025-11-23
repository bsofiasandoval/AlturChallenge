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

def transcribe_elevenlabs(file_bytes,model_id='scribe_v1'):
    try:
        audio_file = io.BytesIO(file_bytes)
        transcription_result = elevenlabs_client.speech_to_text.convert(
            file=audio_file,
            model_id=model_id,
            diarize=True, # Enables speaker recognition
        )

        print("Raw ElevenLabs Response:", transcription_result) # Remove Later

        parsed_result = {
            'text': transcription_result.text if hasattr(transcription_result, 'text') else '',
            'formatted_transcript': [],
            'speakers': []
        }

        # Group words by speaker turns using ElevenLabs' speaker_id
        if hasattr(transcription_result, 'words') and transcription_result.words:
            current_speaker = None
            current_text = []
            current_start = None

            for word_obj in transcription_result.words:
                speaker_id = word_obj.speaker_id if hasattr(word_obj, 'speaker_id') else 'unknown'
                word_text = word_obj.text if hasattr(word_obj, 'text') else ''
                word_start = word_obj.start if hasattr(word_obj, 'start') else 0

                # Track unique speakers (only for actual words, not spacing)
                if word_obj.type == 'word' and speaker_id not in parsed_result['speakers']:
                    parsed_result['speakers'].append(speaker_id)

                # Detect speaker change (only on actual words, not spacing)
                if word_obj.type == 'word' and current_speaker != speaker_id:
                    # Save previous speaker's turn
                    if current_speaker is not None and current_text:
                        parsed_result['formatted_transcript'].append({
                            'speaker': current_speaker,
                            'text': ''.join(current_text).strip(),
                            'start_time': current_start
                        })

                    # Start new speaker turn
                    current_speaker = speaker_id
                    current_text = [word_text]
                    current_start = word_start
                else:
                    # Continue current speaker's turn - include both words and spacing
                    current_text.append(word_text)

            # Don't forget the last speaker turn
            if current_speaker is not None and current_text:
                parsed_result['formatted_transcript'].append({
                    'speaker': current_speaker,
                    'text': ''.join(current_text).strip(),
                    'start_time': current_start
                })

        return parsed_result

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

# Db / supabase methods
def create_call_record(filename, duration_seconds, transcription_text, formatted_transcript=None, speakers=None):
    """
    Insert initial call record into Supabase calls table.
    Returns the created call record (including id and created_at)
    """
    data = {
        'filename': filename,
        'duration': duration_seconds,
        'transcription': transcription_text,
        'insights': None # will be updated later
    }

    if formatted_transcript:
        data['formatted_transcript'] = formatted_transcript

    if speakers:
        data['speakers'] = speakers

    result = supabase.table('calls').insert(data).execute()

    if result.data:
        return result.data[0]
    else:
        raise Exception("Failed to create call record in Supabase")

def update_call_insights(call_id, insights):
    """
    Update insights column for a call record
    """
    result = supabase.table('calls').update({
        'insights':insights
    }).eq('id',call_id).execute()

    if not result.data:
        raise Exception(f"Failed to update insights field for call {call_id}")
    return result.data[0]

def get_call_by_id(call_id):
    result = supabase.table('calls').select('*').eq('id',call_id).execute()
    if result.data and len(result.data) > 0:
        return result.data[0]
    return None

def get_all_calls():
    """
    Get all calls from the database, ordered by uploaded_at descending (newest first)
    """
    result = supabase.table('calls').select('*').order('uploaded_at', desc=True).execute()
    return result.data if result.data else []