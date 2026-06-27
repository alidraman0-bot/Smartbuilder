"""
Defensive JSON Parser — self-healing JSON parsing for AI-generated outputs.

Strips markdown tags, handles common formatting mistakes, and falls back gracefully.
"""

import json
import re
import logging
from typing import Any, Dict

logger = logging.getLogger(__name__)


def repair_truncated_json(json_str: str) -> str:
    """
    Attempts to repair a truncated JSON string by closing unclosed quotes,
    brackets, and braces, and handling trailing colons/commas.
    """
    json_str = json_str.strip()
    if not json_str:
        return "{}"

    in_string = False
    escape = False
    stack = []
    clean_chars = []
    
    i = 0
    while i < len(json_str):
        char = json_str[i]
        
        if in_string:
            if escape:
                escape = False
            elif char == '\\':
                escape = True
            elif char == '"':
                in_string = False
        else:
            if char == '"':
                in_string = True
            elif char in ('{', '['):
                stack.append(char)
            elif char in ('}', ']'):
                if stack:
                    top = stack[-1]
                    if (char == '}' and top == '{') or (char == ']' and top == '['):
                        stack.pop()
        
        clean_chars.append(char)
        i += 1

    repaired = "".join(clean_chars)
    
    if in_string:
        repaired += '"'
        
    repaired = repaired.rstrip()
    if repaired.endswith(':'):
        repaired += 'null'
    elif repaired.endswith(','):
        repaired = repaired[:-1].rstrip()
        
    # Close unclosed structures
    while stack:
        top = stack.pop()
        if top == '{':
            repaired += '}'
        elif top == '[':
            repaired += ']'
            
    return repaired


def safe_json_parse(text: Any, default_fallback: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Strips markdown formatting, extracts JSON substrings, cleans trailing commas,
    repairs truncated segments, and parses AI response text defensively.
    """
    if default_fallback is None:
        default_fallback = {"error": "invalid_json"}

    if not isinstance(text, str):
        try:
            # Already a dict/list/object
            return dict(text) if text else default_fallback
        except Exception:
            return default_fallback

    # 1. Strip whitespace
    cleaned = text.strip()

    # 2. Strip markdown wrapper blocks like ```json ... ``` or ``` ... ```
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
        cleaned = cleaned.strip()

    # 3. If still empty, return fallback
    if not cleaned:
        return default_fallback

    # 4. Attempt direct parsing
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # 5. Extract first { and last } if AI output has conversational prefix/suffix
    try:
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            candidate = match.group(0)
            
            # Clean trailing commas inside lists/objects that break standard JSON parsers
            candidate = re.sub(r",\s*(\]|})", r"\1", candidate)
            
            try:
                return json.loads(candidate)
            except json.JSONDecodeError:
                cleaned = candidate
    except Exception as e:
        logger.debug(f"JSON regex cleaning failed: {e}")

    # 6. Attempt self-healing repair of truncated JSON (e.g. if max_tokens cut off)
    try:
        repaired = repair_truncated_json(cleaned)
        return json.loads(repaired)
    except json.JSONDecodeError:
        pass

    # 7. Final attempt on raw cleaned string after cleaning trailing commas
    try:
        cleaned_commas = re.sub(r",\s*(\]|})", r"\1", cleaned)
        return json.loads(cleaned_commas)
    except json.JSONDecodeError as err:
        logger.error(f"safe_json_parse completely failed. Raw snippet: {text[:200]}... Error: {err}")
        return {
            "error": "invalid_json",
            "raw": text[:500]
        }
