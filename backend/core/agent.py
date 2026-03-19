from langchain.agents import create_agent
from core.llm import get_llm
from tools.document_search import search_documents
from tools.base import create_tool

def build_agent():
    # Define tools
    tools = [
        create_tool(
            name="DocumentSearch",
            func=search_documents,
            description="Search local documents for information"
        )
    ]

    system_prompt = (
        "You are a friendly talking partner. Always respond in English. "
        "For every user input, follow this structure:\n"
        "1) Answer the user's question.\n"
        "2) Add relevant details or clarifications.\n"
        "3) Ask a concise follow-up question to keep the conversation going."
    )

    # Initialize the agent with the latest Chat model
    agent = create_agent(
        model=get_llm(),
        tools=tools,
        system_prompt=system_prompt,
        debug=True
    )

    return agent
