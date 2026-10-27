import os
from typing import Optional
from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()


def has_groq_key() -> bool:
    """Checks whether a valid-looking Groq API key is present, reloading .env dynamically."""
    load_dotenv(override=True)
    key = os.getenv("GROQ_API_KEY", "").strip()
    return bool(key and not key.startswith("your_") and not key.startswith("replace_with_"))


def get_vision_model() -> Optional[ChatGroq]:
    """Returns a LangChain ChatGroq instance configured for multimodal vision."""
    if not has_groq_key():
        return None

    model_name = os.getenv("GROQ_VISION_MODEL", "qwen/qwen3.8-27b")
    return ChatGroq(
        api_key=os.getenv("GROQ_API_KEY"),
        model=model_name,
        temperature=0.1,
        max_tokens=2048,
        model_kwargs={"response_format": {"type": "json_object"}}
    )


def get_chat_model() -> Optional[ChatGroq]:
    """Returns a LangChain ChatGroq instance for contextual clinical chat."""
    if not has_groq_key():
        return None

    model_name = os.getenv("GROQ_CHAT_MODEL", "qwen/qwen3.8-27b")
    return ChatGroq(
        api_key=os.getenv("GROQ_API_KEY"),
        model=model_name,
        temperature=0.2,
        max_tokens=1024
    )
