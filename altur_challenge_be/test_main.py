"""
Tests file upload validation logic
"""

import unittest
import os
import sys

# Mock environment variables before importing utils
os.environ['SUPABASE_URL'] = 'https://test.supabase.co'
os.environ['SUPABASE_KEY'] = 'test-key'
os.environ['ELEVENLABS_API_KEY'] = 'test-key'
os.environ['OPENAI_API_KEY'] = 'test-key'

from utils import allowed_files

class TestFileValidation(unittest.TestCase):
    """Test file validation utilities"""

    def test_allowed_files_valid_mp3(self):
        """Test that MP3 files are accepted"""
        self.assertTrue(allowed_files('test.mp3'))
        self.assertTrue(allowed_files('audio_file.mp3'))

    def test_allowed_files_valid_wav(self):
        """Test that WAV files are accepted"""
        self.assertTrue(allowed_files('test.wav'))
        self.assertTrue(allowed_files('recording.wav'))

    def test_allowed_files_case_insensitive(self):
        """Test that file extension validation is case insensitive"""
        self.assertTrue(allowed_files('TEST.MP3'))
        self.assertTrue(allowed_files('TEST.WAV'))
        self.assertTrue(allowed_files('Test.Mp3'))
        self.assertTrue(allowed_files('Test.Wav'))

    def test_allowed_files_invalid_text(self):
        """Test that text files are rejected"""
        self.assertFalse(allowed_files('test.txt'))
        self.assertFalse(allowed_files('document.doc'))

    def test_allowed_files_invalid_other_formats(self):
        """Test that other common file formats are rejected"""
        self.assertFalse(allowed_files('test.pdf'))
        self.assertFalse(allowed_files('test.zip'))
        self.assertFalse(allowed_files('test.exe'))

    def test_allowed_files_no_extension(self):
        """Test that files without extension are rejected"""
        self.assertFalse(allowed_files('test'))
        self.assertFalse(allowed_files('audiofile'))

    def test_allowed_files_empty_filename(self):
        """Test that empty filenames are rejected"""
        self.assertFalse(allowed_files(''))
        self.assertFalse(allowed_files('.mp3'))
        self.assertFalse(allowed_files('.wav'))

if __name__ == '__main__':
    unittest.main()
