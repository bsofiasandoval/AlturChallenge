export interface Sentiment {
  positive: number;
  negative: number;
  neutral: number;
}

export interface Insights {
  summary: string;
  tags: string[];
  sentiment: Sentiment;
  satisfaction_score: number;
  key_points: string[];
  caller_intent: string;
  recommended_action: string;
}

export interface Speaker {
  speaker_id: string;
  name?: string;
}

export interface FormattedTranscriptSegment {
  speaker: string;
  text: string;
  start_time?: number;
}

export interface CallRecord {
  call_id: string;
  filename: string;
  duration_seconds: number;
  transcription: string;
  formatted_transcript?: FormattedTranscriptSegment[];
  speakers?: Speaker[];
  insights: Insights | null;
  uploaded_at?: string;
}

export interface CallsListProps {
  calls: CallRecord[];
}

export interface UploadResponse {
  success: boolean;
  call_id: string;
  filename: string;
  duration_seconds: number;
  transcription: string;
  formatted_transcript?: FormattedTranscriptSegment[];
  speakers?: Speaker[];
  insights: Insights | null;
}

export interface FileUploadProps {
  onUploadSuccess: (data: UploadResponse) => void;
}

export interface CallDetailsProps {
  call: CallRecord;
}
