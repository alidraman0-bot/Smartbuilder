"""
AI Model Registry — Single source of truth for model selection and fallback chains.

Institutional-Grade Model Routing:
  - Idea Discovery:         anthropic/claude-sonnet-4-20250514
  - Market Research:        openai/gpt-4.1 + anthropic/claude-sonnet-4-20250514
  - Business Plan:          openai/gpt-4.1
  - PRD Builder:            anthropic/claude-sonnet-4-20250514
  - MVP Builder:            deepseek/deepseek-chat + anthropic/claude-sonnet-4-20250514
  - Launch Platform:        google/gemini-2.5-pro + openai/gpt-4.1-mini
  - Monitoring:             openai/gpt-4.1-mini
"""

MODEL_REGISTRY = {
    # ── Idea Discovery (Claude) ──────────────────────────────
    "idea_generation":      "anthropic/claude-sonnet-4-20250514",
    "explore_signals":      "anthropic/claude-sonnet-4-20250514",
    "signal_to_ideas":      "anthropic/claude-sonnet-4-20250514",
    "drive_deep":           "anthropic/claude-sonnet-4-20250514",
    "live_signals":         "anthropic/claude-sonnet-4-20250514",
    
    # ── Market Research (OpenAI + Claude) ────────────────────
    "market_analysis":      "openai/gpt-4.1",
    "competitive_analysis": "openai/gpt-4.1",
    "trend_analysis":       "anthropic/claude-sonnet-4-20250514",
    "funding_analysis":     "openai/gpt-4.1",
    "financial_forecast":   "openai/gpt-4.1",
    
    # ── Business Plan (OpenAI) ──────────────────────────────
    "business_plan":        "openai/gpt-4.1",
    "investment_brief":     "openai/gpt-4.1",
    "executive_summary":    "openai/gpt-4.1",
    "pricing_strategy":     "openai/gpt-4.1",
    "gtm_strategy":         "openai/gpt-4.1",
    "risk_analysis":        "openai/gpt-4.1",
    
    # ── PRD Builder (Claude) ────────────────────────────────
    "prd_generation":       "anthropic/claude-sonnet-4-20250514",
    "technical_spec":       "anthropic/claude-sonnet-4-20250514",
    "strategy":             "anthropic/claude-sonnet-4-20250514",
    
    # ── MVP Builder (DeepSeek + Claude) ─────────────────────
    "architecture_design":  "deepseek/deepseek-chat",
    "code_optimization":    "deepseek/deepseek-chat",
    "database_design":      "deepseek/deepseek-chat",
    "api_design":           "deepseek/deepseek-chat",
    "security_design":      "deepseek/deepseek-chat",
    
    # ── Launch Platform (Gemini + OpenAI) ───────────────────
    "deployment":           "google/gemini-2.5-pro",
    "validation_scoring":   "google/gemini-2.5-pro",
    
    # ── Monitoring (OpenAI) ─────────────────────────────────
    "summaries":            "openai/gpt-4.1-mini",
    "keyword_extraction":   "openai/gpt-4.1-mini",
    "router":               "openai/gpt-4.1-mini",
    "competitor_analysis":  "openai/gpt-4.1-mini",
    
    # ── Default ─────────────────────────────────────────────
    "default":              "openai/gpt-4.1-mini",
}

# ── Fallback chains — ordered lists of models to try when primary fails ──
FALLBACK_MODELS = {
    # Claude-focused tasks fallback: Claude -> OpenAI -> Gemini -> DeepSeek
    "idea_generation": [
        "anthropic/claude-sonnet-4-20250514",
        "openai/gpt-4.1",
        "google/gemini-2.5-pro",
        "deepseek/deepseek-chat"
    ],
    "explore_signals": [
        "anthropic/claude-sonnet-4-20250514",
        "openai/gpt-4.1",
        "google/gemini-2.5-pro",
        "deepseek/deepseek-chat"
    ],
    "signal_to_ideas": [
        "anthropic/claude-sonnet-4-20250514",
        "openai/gpt-4.1",
        "google/gemini-2.5-pro",
        "deepseek/deepseek-chat"
    ],
    "drive_deep": [
        "anthropic/claude-sonnet-4-20250514",
        "openai/gpt-4.1",
        "google/gemini-2.5-pro",
        "deepseek/deepseek-chat"
    ],
    "live_signals": [
        "anthropic/claude-sonnet-4-20250514",
        "openai/gpt-4.1",
        "google/gemini-2.5-pro",
        "deepseek/deepseek-chat"
    ],
    "prd_generation": [
        "anthropic/claude-sonnet-4-20250514",
        "openai/gpt-4.1",
        "google/gemini-2.5-pro",
        "deepseek/deepseek-chat"
    ],
    "technical_spec": [
        "anthropic/claude-sonnet-4-20250514",
        "openai/gpt-4.1",
        "google/gemini-2.5-pro",
        "deepseek/deepseek-chat"
    ],
    "strategy": [
        "anthropic/claude-sonnet-4-20250514",
        "openai/gpt-4.1",
        "google/gemini-2.5-pro",
        "deepseek/deepseek-chat"
    ],
    "trend_analysis": [
        "anthropic/claude-sonnet-4-20250514",
        "openai/gpt-4.1",
        "google/gemini-2.5-pro",
        "deepseek/deepseek-chat"
    ],

    # OpenAI premium-focused tasks fallback: OpenAI -> Claude -> Gemini -> DeepSeek
    "market_analysis": [
        "openai/gpt-4.1",
        "anthropic/claude-sonnet-4-20250514",
        "google/gemini-2.5-pro",
        "deepseek/deepseek-chat"
    ],
    "competitive_analysis": [
        "openai/gpt-4.1",
        "anthropic/claude-sonnet-4-20250514",
        "google/gemini-2.5-pro",
        "deepseek/deepseek-chat"
    ],
    "funding_analysis": [
        "openai/gpt-4.1",
        "anthropic/claude-sonnet-4-20250514",
        "google/gemini-2.5-pro",
        "deepseek/deepseek-chat"
    ],
    "financial_forecast": [
        "openai/gpt-4.1",
        "anthropic/claude-sonnet-4-20250514",
        "google/gemini-2.5-pro",
        "deepseek/deepseek-chat"
    ],
    "business_plan": [
        "openai/gpt-4.1",
        "anthropic/claude-sonnet-4-20250514",
        "google/gemini-2.5-pro",
        "deepseek/deepseek-chat"
    ],
    "investment_brief": [
        "openai/gpt-4.1",
        "anthropic/claude-sonnet-4-20250514",
        "google/gemini-2.5-pro",
        "deepseek/deepseek-chat"
    ],
    "executive_summary": [
        "openai/gpt-4.1",
        "anthropic/claude-sonnet-4-20250514",
        "google/gemini-2.5-pro",
        "deepseek/deepseek-chat"
    ],
    "pricing_strategy": [
        "openai/gpt-4.1",
        "anthropic/claude-sonnet-4-20250514",
        "google/gemini-2.5-pro",
        "deepseek/deepseek-chat"
    ],
    "gtm_strategy": [
        "openai/gpt-4.1",
        "anthropic/claude-sonnet-4-20250514",
        "google/gemini-2.5-pro",
        "deepseek/deepseek-chat"
    ],
    "risk_analysis": [
        "openai/gpt-4.1",
        "anthropic/claude-sonnet-4-20250514",
        "google/gemini-2.5-pro",
        "deepseek/deepseek-chat"
    ],

    # DeepSeek code-focused tasks fallback: DeepSeek -> Claude -> OpenAI -> Gemini
    "architecture_design": [
        "deepseek/deepseek-chat",
        "anthropic/claude-sonnet-4-20250514",
        "openai/gpt-4.1",
        "google/gemini-2.5-pro"
    ],
    "code_optimization": [
        "deepseek/deepseek-chat",
        "anthropic/claude-sonnet-4-20250514",
        "openai/gpt-4.1",
        "google/gemini-2.5-pro"
    ],
    "database_design": [
        "deepseek/deepseek-chat",
        "anthropic/claude-sonnet-4-20250514",
        "openai/gpt-4.1",
        "google/gemini-2.5-pro"
    ],
    "api_design": [
        "deepseek/deepseek-chat",
        "anthropic/claude-sonnet-4-20250514",
        "openai/gpt-4.1",
        "google/gemini-2.5-pro"
    ],
    "security_design": [
        "deepseek/deepseek-chat",
        "anthropic/claude-sonnet-4-20250514",
        "openai/gpt-4.1",
        "google/gemini-2.5-pro"
    ],

    # Gemini deployment-focused tasks fallback: Gemini -> OpenAI -> Claude -> DeepSeek
    "deployment": [
        "google/gemini-2.5-pro",
        "openai/gpt-4.1",
        "anthropic/claude-sonnet-4-20250514",
        "deepseek/deepseek-chat"
    ],
    "validation_scoring": [
        "google/gemini-2.5-pro",
        "openai/gpt-4.1",
        "anthropic/claude-sonnet-4-20250514",
        "deepseek/deepseek-chat"
    ],

    # Monitoring/Lightweight tasks fallback: OpenAI-mini -> Gemini-flash -> DeepSeek -> Claude
    "summaries": [
        "openai/gpt-4.1-mini",
        "google/gemini-2.5-flash",
        "deepseek/deepseek-chat"
    ],
    "keyword_extraction": [
        "openai/gpt-4.1-mini",
        "google/gemini-2.5-flash",
        "deepseek/deepseek-chat"
    ],
    "router": [
        "openai/gpt-4.1-mini",
        "google/gemini-2.5-flash",
        "deepseek/deepseek-chat"
    ],
    "competitor_analysis": [
        "openai/gpt-4.1-mini",
        "google/gemini-2.5-flash",
        "deepseek/deepseek-chat"
    ],

    # Default fallback
    "default": [
        "openai/gpt-4.1-mini",
        "google/gemini-2.5-flash",
        "anthropic/claude-sonnet-4-20250514",
        "deepseek/deepseek-chat"
    ],
}


def get_model_chain(task: str) -> list[str]:
    """
    Returns the ordered list of models to try for a given task.
    Primary model first, then fallbacks. Deduplicates while preserving order.
    """
    primary = MODEL_REGISTRY.get(task, MODEL_REGISTRY["default"])
    fallbacks = FALLBACK_MODELS.get(task, FALLBACK_MODELS["default"])

    # Build ordered, deduplicated chain
    chain = [primary]
    for model in fallbacks:
        if model not in chain:
            chain.append(model)

    return chain
