from rag.retriever import get_retriever

_retriever = None

def _get_retriever():
    global _retriever
    if _retriever is None:
        _retriever = get_retriever()
    return _retriever

def search_documents(query: str):
    docs = _get_retriever().get_relevant_documents(query)
    return "\n".join(d.page_content for d in docs)
