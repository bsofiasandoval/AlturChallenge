from flask import Flask, request, jsonify
from flask_cors import CORS
from config import (
    ALLOWED_EXTENSIONS,
)

from utils import(
    allowed_files,
    transcribe_elevenlabs,
    create_call_record,
    generate_insights,
    update_call_insights,
    get_audio_duration,
    get_call_by_id
)

app = Flask(__name__)
CORS(app)

@app.route('/call/<call_id>', methods="GET")
def get_call(call_id):
    """
    Get a specific call by ID
    """
    try:
        call_data = get_call_by_id

        if not call_data:
            return jsonify({'error': 'Call not found'}), 404
        
        return jsonify({
            'success': True,
            'call_id': call_data['id'],
            'filename': call_data['filename'],
            'duration_seconds': call_data['duration'],
            'transcription': call_data['transcription'],
            'insights': call_data['insights']
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch call','details': str(e)}), 500

@app.route('/upload', methods="POST")
def upload():
    """
    Multistep endpoind that when a file is uploaded:
    1. Transcribes audio with Elevenlabs
    2. Creates call record in DB (Returns UUID)
    3. Generate AI insights and update call record
    """

    # File Validation
    if 'file' not in request.files:
        return jsonify({'error':'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error':'No file selected'}), 400
    
    if not allowed_files(file.filename):
        return jsonify({'error':f'Invalid file type. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'}), 400

    try:
        # Transcribe audio file
        file_bytes = file.read()
        transcription_text = transcribe_elevenlabs(
            file_bytes= file_bytes,
        )
        # Create call record in DB
        duration_seconds = get_audio_duration(file_bytes, file.filename)
        call_id = create_call_record(
            filename= file.filename,
            duration_seconds= duration_seconds,
            transcription_text =transcription_text
        )
        # Generate AI Insights and update record
        try: 
            insights = generate_insights(transcription_text)
            update_call_insights(call_id,insights)
        except Exception as ai_error:
            print(f"AI insight generation failed: {ai_error}")
            insights = None
        
        return jsonify({
            'success': True,
            'call_id': call_id,
            'filename': file.filename,
            'duration_seconds': duration_seconds,
            'transcription': transcription_text,
            'insights': insights
        }), 200
    except Exception as e:
        print(f"ERROR during upload: {str(e)}")
        return jsonify({'error': 'Internal server error','details': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
