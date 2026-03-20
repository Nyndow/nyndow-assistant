from typing import Dict, Generator, List

from langchain_core.messages import HumanMessage, AIMessage

from api.state import agent, get_sessions
from config.llm_settings import llm_settings
from core.agent import SYSTEM_PROMPT
from ollama import chat as ollama_chat


def _build_lc_messages(messages: List[dict]):
    lc_messages = []
    for message in messages:
        role = message.get("role")
        content = message.get("content", "")
        if role == "user":
            lc_messages.append(HumanMessage(content=content))
        elif role == "assistant":
            lc_messages.append(AIMessage(content=content))
    return lc_messages


def chat_with_agent(session_id: str, message: str) -> str:
    sessions = get_sessions()
    history = sessions.setdefault(session_id, [])

    history.append({"role": "user", "content": message})
    lc_messages = _build_lc_messages(history)

    response = agent.invoke({"messages": lc_messages})
    ai_message = response["messages"][-1]
    content = ai_message.content
    if isinstance(content, list):
        content = "".join(str(part) for part in content)

    history.append({"role": "assistant", "content": content})
    return content


def _build_ollama_messages(messages: List[dict]) -> List[Dict[str, str]]:
    ollama_messages: List[Dict[str, str]] = [{"role": "system", "content": SYSTEM_PROMPT}]
    for message in messages:
        role = message.get("role")
        content = message.get("content", "")
        if role in {"user", "assistant"}:
            ollama_messages.append({"role": role, "content": content})
    return ollama_messages


def stream_chat_with_ollama(session_id: str, message: str) -> Generator[dict, None, None]:
    sessions = get_sessions()
    history = sessions.setdefault(session_id, [])

    history.append({"role": "user", "content": message})
    ollama_messages = _build_ollama_messages(history)

    content = ""
    thinking = ""

    try:
        stream = ollama_chat(
            model=llm_settings.llm_model,
            messages=ollama_messages,
            stream=True,
        )
        for chunk in stream:
            message_chunk = chunk.get("message") or {}
            thinking_delta = message_chunk.get("thinking")
            content_delta = message_chunk.get("content")

            if thinking_delta:
                thinking += thinking_delta
                yield {"type": "thinking", "delta": thinking_delta}

            if content_delta:
                content += content_delta
                yield {"type": "content", "delta": content_delta}
    except Exception as error:
        yield {"type": "error", "message": str(error)}
        return

    history.append({"role": "assistant", "content": content})
    yield {
        "type": "done",
        "session_id": session_id,
        "content": content,
        "thinking": thinking,
    }
