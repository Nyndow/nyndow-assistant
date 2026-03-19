import os
import threading
import tkinter as tk
from tkinter import filedialog, scrolledtext

from langchain_core.messages import HumanMessage, AIMessage

from core.agent import build_agent
from tools.pdf_ingest import ingest_pdf


class DesktopApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Nyndow Assistant")
        self.geometry("1200x700")
        self.configure(bg="#0b0f1a")

        self._fonts = {
            "title": ("Helvetica", 16, "bold"),
            "body": ("Helvetica", 11),
            "mono": ("Courier New", 10),
        }
        self._colors = {
            "bg": "#0b0f1a",
            "panel": "#121726",
            "input": "#101726",
            "text": "#ffffff",
            "muted": "#9aa4b2",
            "accent": "#2be3e3",
            "button": "#d9d9d9",
            "button_text": "#000000",
        }

        self.agent = build_agent()
        self.messages = []

        self._build_ui()

    def _build_ui(self):
        self.grid_rowconfigure(1, weight=1)
        self.grid_columnconfigure(0, weight=2)
        self.grid_columnconfigure(1, weight=5)
        self.grid_columnconfigure(2, weight=2)

        header = tk.Frame(self, padx=16, pady=12, bg=self._colors["bg"])
        header.grid(row=0, column=0, columnspan=3, sticky="ew")

        title = tk.Label(
            header,
            text="Nyndow Assistant",
            font=self._fonts["title"],
            fg=self._colors["text"],
            bg=self._colors["bg"],
        )
        title.pack(side=tk.LEFT)

        add_btn = tk.Button(
            header,
            text="Add PDF",
            command=self._on_add_pdf,
            bg=self._colors["button"],
            fg=self._colors["button_text"],
            activebackground=self._colors["button"],
            activeforeground=self._colors["button_text"],
            bd=0,
            padx=14,
            pady=6,
        )
        add_btn.pack(side=tk.RIGHT)

        main = tk.Frame(self, bg=self._colors["bg"])
        main.grid(row=1, column=0, columnspan=3, sticky="nsew")
        main.grid_columnconfigure(0, weight=2)
        main.grid_columnconfigure(1, weight=5)
        main.grid_columnconfigure(2, weight=2)
        main.grid_rowconfigure(0, weight=1)

        left_panel = tk.Frame(main, bg=self._colors["bg"], padx=16, pady=16)
        left_panel.grid(row=0, column=0, sticky="nsew")

        left_title = tk.Label(
            left_panel,
            text="DISCUSSIONS",
            font=self._fonts["body"],
            fg=self._colors["muted"],
            bg=self._colors["bg"],
        )
        left_title.pack(anchor="w")

        self.discussions = tk.Listbox(
            left_panel,
            bg=self._colors["panel"],
            fg=self._colors["text"],
            selectbackground=self._colors["accent"],
            selectforeground="#000000",
            relief=tk.FLAT,
            height=12,
            font=self._fonts["body"],
        )
        for item in [
            "Design System Strategy",
            "Python Script Optimization",
            "Marketing Taglines Draft",
            "Synthesizer Architecture",
        ]:
            self.discussions.insert(tk.END, item)
        self.discussions.pack(fill=tk.BOTH, expand=True, pady=(8, 12))

        new_btn = tk.Button(
            left_panel,
            text="+  New Interaction",
            bg=self._colors["button"],
            fg=self._colors["button_text"],
            activebackground=self._colors["button"],
            activeforeground=self._colors["button_text"],
            bd=0,
            padx=12,
            pady=6,
        )
        new_btn.pack(fill=tk.X)

        center_panel = tk.Frame(main, bg=self._colors["bg"], padx=12, pady=16)
        center_panel.grid(row=0, column=1, sticky="nsew")
        center_panel.grid_rowconfigure(2, weight=1)

        status = tk.Label(
            center_panel,
            text="● SYSTEM: READY",
            font=self._fonts["body"],
            fg=self._colors["accent"],
            bg=self._colors["bg"],
        )
        status.pack()

        mic = tk.Label(
            center_panel,
            text="🎤",
            font=("Arial", 56),
            fg=self._colors["text"],
            bg=self._colors["bg"],
        )
        mic.pack(pady=(20, 10))

        title = tk.Label(
            center_panel,
            text="How can I assist you today?",
            font=self._fonts["body"],
            fg=self._colors["text"],
            bg=self._colors["bg"],
        )
        title.pack()

        subtitle = tk.Label(
            center_panel,
            text='"Analyzing current market trends for your portfolio..."',
            font=self._fonts["body"],
            fg=self._colors["muted"],
            bg=self._colors["bg"],
        )
        subtitle.pack(pady=(4, 16))

        self.chat = scrolledtext.ScrolledText(
            center_panel,
            wrap=tk.WORD,
            state=tk.DISABLED,
            padx=14,
            pady=12,
            bg=self._colors["panel"],
            fg=self._colors["text"],
            insertbackground=self._colors["text"],
            selectbackground=self._colors["accent"],
            relief=tk.FLAT,
            font=self._fonts["body"],
            height=10,
        )
        self.chat.pack(fill=tk.BOTH, expand=True, pady=(0, 12))

        input_row = tk.Frame(center_panel, bg=self._colors["bg"])
        input_row.pack(fill=tk.X)

        self.entry = tk.Entry(
            input_row,
            bg=self._colors["input"],
            fg=self._colors["text"],
            insertbackground=self._colors["text"],
            relief=tk.FLAT,
            font=self._fonts["body"],
        )
        self.entry.pack(side=tk.LEFT, fill=tk.X, expand=True)
        self.entry.bind("<Return>", self._on_send)

        send_btn = tk.Button(
            input_row,
            text="Send",
            command=self._on_send,
            bg=self._colors["button"],
            fg=self._colors["button_text"],
            activebackground=self._colors["button"],
            activeforeground=self._colors["button_text"],
            bd=0,
            padx=14,
            pady=6,
        )
        send_btn.pack(side=tk.RIGHT, padx=(10, 0))

        right_panel = tk.Frame(main, bg=self._colors["bg"], padx=16, pady=16)
        right_panel.grid(row=0, column=2, sticky="nsew")

        right_title = tk.Label(
            right_panel,
            text="FUNCTIONS",
            font=self._fonts["body"],
            fg=self._colors["muted"],
            bg=self._colors["bg"],
        )
        right_title.pack(anchor="w")

        def _func_button(label, checked=False):
            btn = tk.Button(
                right_panel,
                text=label,
                bg=self._colors["panel"] if not checked else self._colors["accent"],
                fg=self._colors["text"] if not checked else "#000000",
                activebackground=self._colors["panel"],
                activeforeground=self._colors["text"],
                bd=0,
                padx=12,
                pady=8,
            )
            btn.pack(fill=tk.X, pady=6)
            return btn

        _func_button("Real-time Web Search", checked=True)
        _func_button("Code Interpreter")
        _func_button("Summarize PDF")
        _func_button("Settings")

        self._append_chat("Assistant: Upload a PDF or ask a question to start.\n")

    def _append_chat(self, text: str):
        self.chat.configure(state=tk.NORMAL)
        self.chat.insert(tk.END, text)
        self.chat.configure(state=tk.DISABLED)
        self.chat.see(tk.END)

    def _on_add_pdf(self):
        path = filedialog.askopenfilename(
            title="Select PDF",
            filetypes=[("PDF files", "*.pdf")],
        )
        if not path:
            return
        self._append_chat(f"\nYou: Add {os.path.basename(path)}\n")
        self._append_chat("Assistant: Ingesting PDF...\n")
        threading.Thread(target=self._ingest_pdf_worker, args=(path,), daemon=True).start()

    def _ingest_pdf_worker(self, path: str):
        result = ingest_pdf(path)
        self._append_chat(f"Assistant: {result}\n")

    def _on_send(self, event=None):
        text = self.entry.get().strip()
        if not text:
            return
        self.entry.delete(0, tk.END)
        self._append_chat(f"\nYou: {text}\n")
        threading.Thread(target=self._chat_worker, args=(text,), daemon=True).start()

    def _chat_worker(self, text: str):
        self.messages.append({"role": "user", "content": text})
        lc_messages = []
        for m in self.messages:
            if m["role"] == "user":
                lc_messages.append(HumanMessage(content=m["content"]))
            elif m["role"] == "assistant":
                lc_messages.append(AIMessage(content=m["content"]))
        response = self.agent.invoke({"messages": lc_messages})
        ai_message = response["messages"][-1]
        content = ai_message.content
        if isinstance(content, list):
            content = "".join(str(part) for part in content)
        self.messages.append({"role": "assistant", "content": content})
        self._append_chat(f"Assistant: {content}\n")


if __name__ == "__main__":
    app = DesktopApp()
    app.mainloop()
