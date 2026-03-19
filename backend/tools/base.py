from langchain.tools import tool as tool_factory

def create_tool(name, func, description):
    return tool_factory(name, description=description)(func)
