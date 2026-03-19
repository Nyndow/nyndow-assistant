from typing import List

from langchain_core.messages import HumanMessage, AIMessage

from api.state import agent, get_sessions


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
