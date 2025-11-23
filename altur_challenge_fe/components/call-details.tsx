"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CallDetailsProps, Sentiment, FormattedTranscriptSegment } from "@/types";
import {
  formatDurationLong,
  formatTag,
  getTagColorDetailed,
  getSatisfactionColorDetailed,
} from "@/types/utils";

const getSpeakerColor = (speakerId: string) => {
  // Typically 2 speakers: speaker_0 and speaker_1, with gray fallback for any additional
  if (speakerId.includes('0')) {
    return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' };
  } else if (speakerId.includes('1')) {
    return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' };
  } else {
    return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' };
  }
};

const getSpeakerDisplayNumber = (speakerId: string): string => {
  // Extract number from speaker ID, fallback to full ID if no number found
  const match = speakerId.match(/\d+/);
  return match ? match[0] : speakerId;
};

const formatTranscriptionWithAvatars = (
  formattedTranscript?: FormattedTranscriptSegment[],
  fallbackText?: string
) => {
  // If we have formatted transcript data, use it
  if (formattedTranscript && formattedTranscript.length > 0) {
    return formattedTranscript.map((segment, index) => {
      const speakerId = segment.speaker;
      const displayNumber = getSpeakerDisplayNumber(speakerId);
      const colors = getSpeakerColor(speakerId);

      return (
        <div key={index} className="flex gap-3 mb-4">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full ${colors.bg} ${colors.text} border-2 ${colors.border} flex items-center justify-center font-bold text-sm`}>
            S{displayNumber}
          </div>
          <div className="flex-1 pt-1">
            <div className="text-xs font-semibold text-muted-foreground mb-1">
              Speaker {displayNumber}
            </div>
            <p className="text-sm leading-relaxed">
              {segment.text}
            </p>
          </div>
        </div>
      );
    });
  }

  // Fallback: parse text with "Speaker N:" format
  if (fallbackText) {
    const lines = fallbackText.split('\n\n');

    return lines.map((line, index) => {
      const speakerMatch = line.match(/^Speaker (\d+):\s*([\s\S]*)$/);

      if (speakerMatch) {
        const speakerId = speakerMatch[1];
        const speakerText = speakerMatch[2];
        const colors = getSpeakerColor(speakerId);

        return (
          <div key={index} className="flex gap-3 mb-4">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${colors.bg} ${colors.text} border-2 ${colors.border} flex items-center justify-center font-bold text-sm`}>
              S{speakerId}
            </div>
            <div className="flex-1 pt-1">
              <div className="text-xs font-semibold text-muted-foreground mb-1">
                Speaker {speakerId}
              </div>
              <p className="text-sm leading-relaxed">
                {speakerText}
              </p>
            </div>
          </div>
        );
      }

      return (
        <p key={index} className="text-sm leading-relaxed mb-4">
          {line}
        </p>
      );
    });
  }

  return null;
};

const normalizeSentiment = (sentiment: Sentiment) => {
  const total = sentiment.positive + sentiment.negative + sentiment.neutral;

  if (total > 10) {
    return {
      positive: sentiment.positive / 100,
      negative: sentiment.negative / 100,
      neutral: sentiment.neutral / 100
    };
  }
  return sentiment;
};

const getSentimentIcon = (sentiment: Sentiment) => {
  const normalized = normalizeSentiment(sentiment);

  if (normalized.positive >= 0.5) {
    return { icon: "😃", label: "Positive", color: "text-green-600" };
  } else if (normalized.negative >= 0.3) {
    return { icon: "😞", label: "Negative", color: "text-red-600" };
  } else {
    return { icon: "🙂", label: "Neutral", color: "text-gray-600" };
  }
};

export function CallDetails({ call }: CallDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">{call.filename}</h2>
          <p className="text-sm text-muted-foreground">
            Duration: {formatDurationLong(call.duration_seconds)}
          </p>
        </div>
        {call.insights && (
          <div className={`flex items-center justify-center w-20 h-20 rounded-full border-4 ${getSatisfactionColorDetailed(call.insights.satisfaction_score)} flex-shrink-0`}>
            <span className="text-2xl font-bold">
              {call.insights.satisfaction_score}/5
            </span>
          </div>
        )}
      </div>

      {call.insights ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column - Compact Cards */}
            <div className="space-y-4">
              {/* Tags Card */}
              <Card className="gap-2">
                <CardHeader className="pb-0 gap-0">
                  <CardTitle className="text-base">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {call.insights.tags.map((tag, index) => (
                      <span
                        key={index}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getTagColorDetailed(
                          tag
                        )}`}
                      >
                        {formatTag(tag)}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Caller Intent Card */}
              <Card className="gap-2">
                <CardHeader className="pb-0 gap-0">
                  <CardTitle className="text-base">Caller Intent</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{call.insights.caller_intent}</p>
                </CardContent>
              </Card>

              {/* Recommended Action Card */}
              <Card className="gap-2">
                <CardHeader className="pb-0 gap-0">
                  <CardTitle className="text-base">Recommended Action</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">
                    {call.insights.recommended_action}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Sentiment Card (Compact) */}
              <Card className="gap-2">
                <CardHeader className="pb-0 gap-0">
                  <CardTitle className="text-base">Call Sentiment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{getSentimentIcon(call.insights.sentiment).icon}</span>
                    <div className="flex-1">
                      <p className={`text-xl font-bold mb-2 ${getSentimentIcon(call.insights.sentiment).color}`}>
                        {getSentimentIcon(call.insights.sentiment).label}
                      </p>
                      {(() => {
                        const normalized = normalizeSentiment(call.insights.sentiment);
                        const positive = Math.round(normalized.positive * 100);
                        const neutral = Math.round(normalized.neutral * 100);
                        const negative = Math.round(normalized.negative * 100);

                        return (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-sm bg-green-500"></div>
                                <span className="text-muted-foreground">Positive</span>
                              </div>
                              <span className="font-bold text-green-600">{positive}%</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-sm bg-gray-400"></div>
                                <span className="text-muted-foreground">Neutral</span>
                              </div>
                              <span className="font-bold text-gray-600">{neutral}%</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-sm bg-red-500"></div>
                                <span className="text-muted-foreground">Negative</span>
                              </div>
                              <span className="font-bold text-red-600">{negative}%</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Points Card */}
              <Card className="gap-2">
                <CardHeader className="pb-0 gap-0">
                  <CardTitle className="text-base">Key Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1.5">
                    {call.insights.key_points.map((point, index) => (
                      <li key={index} className="text-sm leading-snug">
                        {point}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="gap-2">
            <CardHeader className="pb-0 gap-0">
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{call.insights.summary}</p>
            </CardContent>
          </Card>

          <Card className="gap-2">
            <CardHeader className="pb-0 gap-0">
              <CardTitle className="text-lg">Transcription</CardTitle>
            </CardHeader>
            <CardContent>
              {formatTranscriptionWithAvatars(call.formatted_transcript, call.transcription)}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">
                Processing insights... This may take a moment.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
