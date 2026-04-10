from langchain.agents import create_agent
from core.llm import get_llm
from tools.document_search import search_documents
from tools.base import create_tool

SYSTEM_PROMPT = """
You are an intelligent assistant that helps users by answering questions clearly and accurately.

Rules:
- Always respond in English.
- Be concise but informative.
- If you don't know something, say you don't know.
- Never make up facts.

Tool usage:
- If the question requires external or document-based information, use the available tools.
- Prefer using the DocumentSearch tool when relevant.
- Do NOT use tools if you already know the answer confidently.

Response format:
1) Final answer (clear and direct)
2) Optional short explanation (only if helpful)

Behavior:
- Do not mention tools unless necessary.
- Do not explain your internal reasoning.
- Focus on usefulness and correctness over verbosity.
"""

def build_agent():
    # Define tools
    tools = [
        create_tool(
            name="DocumentSearch",
            func=search_documents,
            description="Search local documents for information"
        )
    ]

    # Initialize the agent with the latest Chat model
    agent = create_agent(
        model=get_llm(),
        tools=tools,
        system_prompt=SYSTEM_PROMPT,
        debug=True
    )

    return agent
