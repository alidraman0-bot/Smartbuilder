from fastapi import APIRouter
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from app.core.ai_client import get_ai_client

router = APIRouter()

class ChatCompletionRequest(BaseModel):
    model: Optional[str] = None
    models: Optional[List[str]] = None
    messages: List[Dict[str, Any]]
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    response_format: Optional[Dict[str, Any]] = None

@router.post("/chat/completions")
async def chat_completions(payload: ChatCompletionRequest):
    # Resolve the model to use
    selected_model = payload.model
    if not selected_model and payload.models:
        selected_model = payload.models[0]
        
    ai_client = get_ai_client()
    
    # We extract system prompt from messages if it exists
    system_prompt = None
    user_messages = []
    for msg in payload.messages:
        if msg.get("role") == "system":
            system_prompt = msg.get("content")
        else:
            user_messages.append({"role": msg.get("role"), "content": msg.get("content")})
            
    # Call unified chat_completion
    res = await ai_client.chat_completion(
        messages=user_messages,
        system_prompt=system_prompt,
        model=selected_model,
        temperature=payload.temperature,
        max_tokens=payload.max_tokens,
        response_format=payload.response_format
    )
    
    content = res.get("content", "")
    model_used = res.get("model_used", selected_model or "unknown")
    provider = res.get("provider", "unknown")
    
    # Return standard OpenAI response shape
    return {
        "choices": [
            {
                "message": {
                    "role": "assistant",
                    "content": content
                },
                "finish_reason": "stop",
                "index": 0
            }
        ],
        "model": model_used,
        "provider": provider,
        "usage": res.get("usage", {})
    }
