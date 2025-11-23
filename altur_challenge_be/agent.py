import os
from dotenv import load_dotenv
from typing import List
from pydantic import BaseModel, Field
from agno.agent import Agent
from agno.models.openai import OpenAIChat

load_dotenv()

# Structured data output helper classes
class Sentiment(BaseModel):
    positive: int = Field(..., title="Positive sentiment percentage (0-100)")
    negative: int = Field(..., title="Negative sentiment percentage (0-100)")
    neutral: int = Field(..., title="Neutral sentiment percentage (0-100)")

# Insights response schema
class Insights(BaseModel):
    summary: str = Field(..., title="A brief summary of the call content, max 300 characters")
    tags: List[str] = Field(..., title="One or more tags classifying the call intent. Use ONLY these tags: needs_follow_up, wrong_number, not_interested, requesting_info, complaint, support_issue, scheduling, pricing_inquiry, ready_to_purchase, callback_requested, decision_maker_absent, positive_feedback, escalation_needed, voicemail", max_length=3)
    sentiment: Sentiment = Field(..., title="Overall sentiment of the call out of 100 considering all 3 possible sentiments positive, neutral and negative.")
    satisfaction_score: int = Field(..., title="Customer satisfaction score from 1-5")
    key_points: List[str] = Field(..., title="Key points or action items from the call")
    caller_intent: str = Field(..., title="Primary intent of the caller")
    recommended_action: str = Field(..., title="Recommended next action for this call")
    confidence: float = Field(..., title="Confidence score 0.0-1.0 for this analysis")

# Analysis agent setup
call_analysis_agent = Agent(
    model=OpenAIChat(id="gpt-4o"),
    description="You are an AI call analyst that analyzes phone call transcriptions.",
    instructions=[
        "IMPORTANT: Use ONLY these exact tags: needs_follow_up, wrong_number, not_interested, requesting_info, complaint, support_issue, scheduling, pricing_inquiry, ready_to_purchase, callback_requested, decision_maker_absent, positive_feedback, escalation_needed, voicemail",
        "Sentiment percentages MUST sum to 100",
        "Satisfaction score MUST be between 1-5 (integer only)",
        "If you can't confidently determine a field, set confidence below 0.7",
        "If the transcription is unclear or incomplete, return confidence below 0.5"
    ],
    output_schema=Insights,
    use_json_mode=True
)

# Agent caller method given a transcription
def analyze_call(transcription: str) -> dict:
    response = call_analysis_agent.run(transcription)
    if isinstance(response.content, str):
        raise Exception(f"Failed to parse response: {response.content[:200]}")
    return response.content.model_dump()
