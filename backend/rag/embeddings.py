from langchain_ollama import OllamaEmbeddings
from config.llm_settings import llm_settings

def get_embeddings():
    return OllamaEmbeddings(
        model=llm_settings.embedding_model
    )
