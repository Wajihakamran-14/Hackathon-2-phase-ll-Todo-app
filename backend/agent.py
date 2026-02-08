import os
import json
import uuid
from typing import List, Dict, Any, Optional
from groq import AsyncGroq
from mcp_tools import add_task, list_tasks, list_all_tasks, complete_task, delete_task, update_task, delete_all_tasks

class TodoAgent:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.client = AsyncGroq(api_key=self.api_key)
        self.model = "llama-3.3-70b-versatile"
        
        self.tools = [
            {
                "type": "function",
                "function": {
                    "name": "add_task",
                    "description": "Add a new task for the user.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string", "description": "The title of the task"},
                            "description": {"type": "string", "description": "Optional description"},
                            "priority": {"type": "string", "enum": ["low", "medium", "high", "urgent"]}
                        },
                        "required": ["title"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "list_tasks",
                    "description": "List active (remaining) tasks for the user.",
                    "parameters": {
                        "type": "object",
                        "properties": {}
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "list_all_tasks",
                    "description": "List ALL tasks (including completed ones) for the user.",
                    "parameters": {
                        "type": "object",
                        "properties": {}
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "complete_task",
                    "description": "Mark a task as completed.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_title": {"type": "string", "description": "The title of the task to complete"}
                        },
                        "required": ["task_title"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "delete_task",
                    "description": "Delete a specific task by title.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_title": {"type": "string", "description": "The title of the task to delete"}
                        },
                        "required": ["task_title"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "delete_all_tasks",
                    "description": "Delete ALL tasks for the current user.",
                    "parameters": {
                        "type": "object",
                        "properties": {}
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "clear_chat_history",
                    "description": "Delete the current conversation history.",
                    "parameters": {
                        "type": "object",
                        "properties": {}
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "update_task",
                    "description": "Update details of an existing task.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_title": {"type": "string", "description": "Current title of the task"},
                            "title": {"type": "string", "description": "New title"},
                            "description": {"type": "string", "description": "New description"},
                            "priority": {"type": "string", "enum": ["low", "medium", "high", "urgent"]}
                        },
                        "required": ["task_title"]
                    }
                }
            }
        ]

    async def chat(self, message: str, user_id: uuid.UUID, history: List[Dict[str, str]]) -> str:
        print(f"DEBUG GROQ AGENT: Processing message: '{message}'")
        
        if not self.api_key or "your_groq_key" in self.api_key:
            return "Error: GROQ_API_KEY is not set correctly in the backend .env file."

        messages = [
            {
                "role": "system", 
                "content": "You are a brief, helpful Todo Assistant. Use the provided tools to manage tasks. user_id is handled for you. NEVER mention technical details or IDs. If the user says hi, just say hi back."
            }
        ]
        
        for h in history[-10:]:
            messages.append({"role": h["role"], "content": h["content"]})
            
        messages.append({"role": "user", "content": message})

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                tools=self.tools,
                tool_choice="auto"
            )

            response_message = response.choices[0].message
            
            if response_message.tool_calls:
                messages.append(response_message)
                
                for tool_call in response_message.tool_calls:
                    function_name = tool_call.function.name
                    try:
                        args = json.loads(tool_call.function.arguments) if tool_call.function.arguments else {}
                    except:
                        args = {}
                    
                    if not isinstance(args, dict): args = {}
                    args["user_id"] = str(user_id)
                    
                    print(f"DEBUG GROQ AGENT: Tool -> {function_name}")
                    
                    result_text = ""
                    try:
                        if function_name == "add_task":
                            result_text = await add_task(**args)
                        elif function_name == "list_tasks":
                            result_text = await list_tasks(user_id=str(user_id))
                        elif function_name == "list_all_tasks":
                            result_text = await list_all_tasks(user_id=str(user_id))
                        elif function_name == "complete_task":
                            result_text = await complete_task(user_id=str(user_id), task_title=args.get("task_title"))
                        elif function_name == "delete_task":
                            result_text = await delete_task(user_id=str(user_id), task_title=args.get("task_title"))
                        elif function_name == "delete_all_tasks":
                            result_text = await delete_all_tasks(user_id=str(user_id))
                        elif function_name == "clear_chat_history":
                            result_text = await clear_chat_history(user_id=str(user_id))
                        elif function_name == "update_task":
                            result_text = await update_task(user_id=str(user_id), **args)
                        else:
                            result_text = "Tool not found."
                    except Exception as te:
                        result_text = f"Error: {str(te)}"
                    
                    messages.append({
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": function_name,
                        "content": str(result_text),
                    })

                second_response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=messages
                )
                return second_response.choices[0].message.content

            return response_message.content
            
        except Exception as e:
            print(f"DEBUG GROQ AGENT: Final Error: {str(e)}")
            return f"I encountered an issue. Please try again."

agent = TodoAgent()
