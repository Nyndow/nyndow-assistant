import os
from langchain_community.vectorstores import Chroma
from rag.embeddings import get_embeddings
from config.llm_settings import llm_settings

def get_vectorstore():
    os.makedirs(llm_settings.vector_db_path, exist_ok=True)
    return Chroma(
        persist_directory=llm_settings.vector_db_path,
        embedding_function=get_embeddings()
    )
