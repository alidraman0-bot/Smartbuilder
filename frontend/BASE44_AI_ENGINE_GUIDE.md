# BASE44 AI Engine - Python Integration Guide

Complete guide for integrating the multi-LLM Python AI engine into your bytecode editor.

---

## Installation

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

Or install individually:

```bash
# OpenAI
pip install openai>=1.3.0

# Anthropic Claude
pip install anthropic>=0.7.0

# Google Gemini
pip install google-generativeai>=0.3.0

# Utilities
pip install python-dotenv pydantic aiohttp
```

### 2. Set Up Environment Variables

Create a `.env` file in your project root:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-...

# Anthropic Claude Configuration
ANTHROPIC_API_KEY=sk-ant-...

# Google Gemini Configuration
GOOGLE_API_KEY=AIzaSy...
```

---

## Quick Start

### Basic Usage

```python
import asyncio
from base44_ai_engine import (
    CodeGenerationEngine,
    LLMFactory,
    GenerationConfig,
    LLMProvider
)

async def main():
    # Create engine with default OpenAI provider
    engine = CodeGenerationEngine()
    
    # Or specify a different provider
    config = GenerationConfig(
        provider=LLMProvider.CLAUDE,
        model="claude-3-5-sonnet-20241022"
    )
    provider = LLMFactory.create(config)
    engine = CodeGenerationEngine(provider)
    
    # Generate requirements
    user_description = "Build a todo app with React and Node.js"
    result = await engine.generate_requirements(user_description)
    
    print(f"Success: {result.success}")
    print(f"Metadata: {result.metadata}")

asyncio.run(main())
```

### Generate Complete Application

```python
async def generate_full_app():
    engine = CodeGenerationEngine()
    
    user_description = """
    Build a complete project management SaaS with:
    - Multi-tenant architecture
    - Team management
    - Project and task management
    - Kanban board view
    - Real-time collaboration
    - File sharing
    - Role-based access control
    
    Technology: React, Node.js, PostgreSQL
    """
    
    results = await engine.generate_complete_application(user_description)
    
    print(f"Status: {results['status']}")
    print(f"Total Files: {results.get('total_files', 0)}")
    
    # Access generated files
    for file_info in results.get('files', []):
        print(f"Generated: {file_info['path']}")

asyncio.run(generate_full_app())
```

---

## API Reference

### LLMProvider Enum

```python
class LLMProvider(Enum):
    OPENAI = "openai"      # GPT-4, GPT-4o, GPT-3.5
    CLAUDE = "claude"      # Claude 3, Claude 3.5
    GEMINI = "gemini"      # Gemini 2.0, Gemini Pro
```

### GenerationConfig

```python
@dataclass
class GenerationConfig:
    provider: LLMProvider = LLMProvider.OPENAI
    model: str = "gpt-4o"
    temperature: float = 0.7          # 0.0-1.0
    max_tokens: int = 4096
    top_p: float = 0.9
    frequency_penalty: float = 0.0
    presence_penalty: float = 0.0
    timeout: int = 300
```

### LLMFactory

```python
# Create provider with default config
provider = LLMFactory.create_default()

# Create provider with custom config
config = GenerationConfig(
    provider=LLMProvider.OPENAI,
    model="gpt-4o",
    temperature=0.7
)
provider = LLMFactory.create(config)
```

### CodeGenerationEngine

```python
# Initialize
engine = CodeGenerationEngine(provider=None)  # Uses default if None

# Generate requirements analysis
result = await engine.generate_requirements(user_description)

# Generate database schema
result = await engine.generate_database_schema(requirements)

# Generate backend code
result = await engine.generate_backend_code(requirements, schema)

# Generate frontend code
result = await engine.generate_frontend_code(requirements)

# Generate configuration files
result = await engine.generate_configuration(requirements)

# Generate documentation
result = await engine.generate_documentation(requirements)

# Generate complete application (all phases)
results = await engine.generate_complete_application(user_description)

# Get generation history
history = engine.get_generation_history()

# Clear history
engine.clear_history()
```

### GenerationResult

```python
@dataclass
class GenerationResult:
    phase: GenerationPhase
    success: bool
    files: List[GeneratedFile]
    metadata: Dict[str, Any]
    error: Optional[str] = None
```

### GeneratedFile

```python
@dataclass
class GeneratedFile:
    path: str
    content: str
    language: str
    description: str = ""
```

---

## Advanced Usage

### Using Different Providers

#### OpenAI GPT-4

```python
from base44_ai_engine import GenerationConfig, LLMProvider, LLMFactory

config = GenerationConfig(
    provider=LLMProvider.OPENAI,
    model="gpt-4o",
    temperature=0.7,
    max_tokens=4096
)

provider = LLMFactory.create(config)
engine = CodeGenerationEngine(provider)
```

#### Anthropic Claude

```python
config = GenerationConfig(
    provider=LLMProvider.CLAUDE,
    model="claude-3-5-sonnet-20241022",
    temperature=0.7,
    max_tokens=4096
)

provider = LLMFactory.create(config)
engine = CodeGenerationEngine(provider)
```

#### Google Gemini

```python
config = GenerationConfig(
    provider=LLMProvider.GEMINI,
    model="gemini-2.0-flash",
    temperature=0.7,
    max_tokens=4096
)

provider = LLMFactory.create(config)
engine = CodeGenerationEngine(provider)
```

### Streaming Generation

```python
async def stream_generation():
    config = GenerationConfig(provider=LLMProvider.OPENAI)
    provider = LLMFactory.create(config)
    
    prompt = "Generate a React component for a todo list"
    
    # Stream the response
    async for chunk in provider.stream_generate(prompt):
        print(chunk, end="", flush=True)

asyncio.run(stream_generation())
```

### Error Handling

```python
async def robust_generation():
    try:
        engine = CodeGenerationEngine()
        result = await engine.generate_requirements("Build a CRM")
        
        if not result.success:
            print(f"Generation failed: {result.error}")
            return
        
        print(f"Generated metadata: {result.metadata}")
        
    except ValueError as e:
        print(f"Configuration error: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")

asyncio.run(robust_generation())
```

### Batch Processing

```python
async def batch_generation():
    engine = CodeGenerationEngine()
    
    apps = [
        "Build a todo app",
        "Build a blog platform",
        "Build an e-commerce store"
    ]
    
    results = []
    for app_description in apps:
        result = await engine.generate_requirements(app_description)
        results.append(result)
    
    return results

asyncio.run(batch_generation())
```

### Custom System Prompt

```python
from base44_ai_engine import BaseLLMProvider, GenerationConfig

class CustomProvider(BaseLLMProvider):
    def _load_system_prompt(self) -> str:
        return """Your custom system prompt here..."""
    
    async def generate(self, prompt: str) -> str:
        # Your custom implementation
        pass
    
    async def stream_generate(self, prompt: str):
        # Your custom implementation
        pass

# Use custom provider
provider = CustomProvider(GenerationConfig())
engine = CodeGenerationEngine(provider)
```

---

## Integration with Web Framework

### FastAPI Integration

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from base44_ai_engine import CodeGenerationEngine, LLMFactory, GenerationConfig, LLMProvider

app = FastAPI()

# Initialize engine
config = GenerationConfig(provider=LLMProvider.OPENAI)
provider = LLMFactory.create(config)
engine = CodeGenerationEngine(provider)

class GenerationRequest(BaseModel):
    description: str
    provider: str = "openai"
    model: str = "gpt-4o"

@app.post("/api/generate/requirements")
async def generate_requirements(request: GenerationRequest):
    try:
        result = await engine.generate_requirements(request.description)
        return {
            "success": result.success,
            "metadata": result.metadata,
            "error": result.error
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate/complete")
async def generate_complete(request: GenerationRequest):
    try:
        results = await engine.generate_complete_application(request.description)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/generation/history")
async def get_history():
    history = engine.get_generation_history()
    return {
        "count": len(history),
        "phases": [h.phase.value for h in history]
    }
```

### Flask Integration

```python
from flask import Flask, request, jsonify
from base44_ai_engine import CodeGenerationEngine, LLMFactory, GenerationConfig, LLMProvider
import asyncio

app = Flask(__name__)

# Initialize engine
config = GenerationConfig(provider=LLMProvider.CLAUDE)
provider = LLMFactory.create(config)
engine = CodeGenerationEngine(provider)

@app.route('/api/generate/requirements', methods=['POST'])
def generate_requirements():
    try:
        data = request.json
        description = data.get('description')
        
        result = asyncio.run(engine.generate_requirements(description))
        
        return jsonify({
            "success": result.success,
            "metadata": result.metadata,
            "error": result.error
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate/complete', methods=['POST'])
def generate_complete():
    try:
        data = request.json
        description = data.get('description')
        
        results = asyncio.run(engine.generate_complete_application(description))
        
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
```

---

## Configuration Examples

### High-Quality Generation (Slower, More Expensive)

```python
config = GenerationConfig(
    provider=LLMProvider.OPENAI,
    model="gpt-4o",
    temperature=0.3,  # Lower = more deterministic
    max_tokens=8192,
    top_p=0.9
)
```

### Fast Generation (Faster, Cheaper)

```python
config = GenerationConfig(
    provider=LLMProvider.OPENAI,
    model="gpt-3.5-turbo",
    temperature=0.7,
    max_tokens=2048,
    top_p=0.9
)
```

### Creative Generation (More Varied Output)

```python
config = GenerationConfig(
    provider=LLMProvider.CLAUDE,
    model="claude-3-5-sonnet-20241022",
    temperature=0.9,  # Higher = more creative
    max_tokens=4096,
    top_p=0.95
)
```

---

## Troubleshooting

### API Key Issues

```python
import os
from dotenv import load_dotenv

# Ensure .env is loaded
load_dotenv()

# Check if keys are set
if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("OPENAI_API_KEY not set in environment")
```

### Timeout Issues

```python
config = GenerationConfig(
    provider=LLMProvider.OPENAI,
    timeout=600  # Increase timeout to 10 minutes
)
```

### Token Limit Exceeded

```python
config = GenerationConfig(
    provider=LLMProvider.OPENAI,
    max_tokens=2048  # Reduce max tokens
)
```

### Rate Limiting

```python
import asyncio

async def rate_limited_generation():
    engine = CodeGenerationEngine()
    
    for i in range(10):
        result = await engine.generate_requirements(f"App {i}")
        await asyncio.sleep(2)  # Wait 2 seconds between requests
```

---

## Best Practices

### 1. Use Async/Await

```python
# Good
async def generate():
    result = await engine.generate_requirements("...")
    return result

# Avoid
result = engine.generate_requirements("...")  # This won't work
```

### 2. Handle Errors Gracefully

```python
try:
    result = await engine.generate_requirements(description)
    if not result.success:
        logger.error(f"Generation failed: {result.error}")
        return None
except Exception as e:
    logger.error(f"Unexpected error: {e}")
    return None
```

### 3. Cache Results

```python
from functools import lru_cache

cache = {}

async def generate_with_cache(description):
    if description in cache:
        return cache[description]
    
    result = await engine.generate_requirements(description)
    cache[description] = result
    return result
```

### 4. Log Everything

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("Starting generation...")
result = await engine.generate_requirements(description)
logger.info(f"Generation completed: {result.success}")
```

### 5. Use Type Hints

```python
from typing import Optional, Dict, Any

async def generate_app(
    description: str,
    provider: str = "openai"
) -> Optional[Dict[str, Any]]:
    try:
        engine = CodeGenerationEngine()
        result = await engine.generate_complete_application(description)
        return result
    except Exception as e:
        logger.error(f"Error: {e}")
        return None
```

---

## Performance Optimization

### Parallel Generation

```python
import asyncio

async def parallel_generation():
    engine = CodeGenerationEngine()
    
    tasks = [
        engine.generate_requirements("App 1"),
        engine.generate_requirements("App 2"),
        engine.generate_requirements("App 3"),
    ]
    
    results = await asyncio.gather(*tasks)
    return results

asyncio.run(parallel_generation())
```

### Connection Pooling

```python
# The SDK handles connection pooling automatically
# Just reuse the same engine instance
engine = CodeGenerationEngine()

# Multiple calls will reuse connections
result1 = await engine.generate_requirements("App 1")
result2 = await engine.generate_requirements("App 2")
```

---

## Testing

### Unit Tests

```python
import pytest
from base44_ai_engine import GenerationConfig, LLMProvider, LLMFactory

@pytest.mark.asyncio
async def test_openai_generation():
    config = GenerationConfig(
        provider=LLMProvider.OPENAI,
        model="gpt-4o"
    )
    provider = LLMFactory.create(config)
    assert provider is not None

@pytest.mark.asyncio
async def test_claude_generation():
    config = GenerationConfig(
        provider=LLMProvider.CLAUDE,
        model="claude-3-5-sonnet-20241022"
    )
    provider = LLMFactory.create(config)
    assert provider is not None

@pytest.mark.asyncio
async def test_gemini_generation():
    config = GenerationConfig(
        provider=LLMProvider.GEMINI,
        model="gemini-2.0-flash"
    )
    provider = LLMFactory.create(config)
    assert provider is not None
```

### Mock Testing

```python
from unittest.mock import AsyncMock, patch

@pytest.mark.asyncio
async def test_generation_with_mock():
    with patch('base44_ai_engine.openai.AsyncOpenAI') as mock:
        mock_response = AsyncMock()
        mock_response.choices[0].message.content = "Generated code"
        
        # Your test here
```

---

## Deployment

### Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY base44_ai_engine.py .

ENV OPENAI_API_KEY=${OPENAI_API_KEY}
ENV ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
ENV GOOGLE_API_KEY=${GOOGLE_API_KEY}

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables

```bash
# Production
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...
export GOOGLE_API_KEY=AIzaSy...

# Run your application
python your_app.py
```

---

## Support and Resources

- OpenAI Documentation: https://platform.openai.com/docs
- Anthropic Documentation: https://docs.anthropic.com
- Google Gemini Documentation: https://ai.google.dev/docs
- Python Async: https://docs.python.org/3/library/asyncio.html

---

## License

This implementation is provided as-is for integration into your BASE44 Clone platform.
