from langchain_ollama import ChatOllama
from config.llm_settings import llm_settings

def get_llm():

    return ChatOllama(
        model=llm_settings.llm_model,
        temperature=0.3
    )
