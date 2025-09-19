import tkinter as tk
import pyperclip
import requests
import threading
import time
import pyautogui

API_URL = "http://localhost:3000/ask"

# Function to detect clipboard
def check_clipboard():
    last_text = ""
    print("📋 Clipboard watcher started.") # Log when the watcher starts
    while True:
        try:
            current_text = pyperclip.paste().strip()
            if current_text != last_text and len(current_text) > 3:
                last_text = current_text
                print(f"📄 New clipboard content detected: '{current_text}'") # Log new content
                show_popup(current_text)
        except Exception as e:
            print(f"⚠️ Error checking clipboard: {e}") # Log clipboard access errors
        time.sleep(1)

# Function to display answer popup
def show_popup(text):
    def fetch_answer():
        print(f" Sending request to API for: '{text}'") # Log before sending request
        try:
            prompt = f"Please provide a concise and accurate answer: {text}"
            res = requests.post(API_URL, json={"text": prompt})
            res.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
            answer = res.json().get("answer", " Failed to get an answer.")
            print(f"✅ API response received: '{answer}'") # Log successful response
        except requests.exceptions.RequestException as e:
            answer = f" Error connecting to API: {e}"
            print(f" Network/API error: {e}") # Log network or API specific errors
        except Exception as e:
            answer = f" Error: {e}"
            print(f"Unexpected error during API call: {e}") # Log any other unexpected errors

        width = 400
        height = 150
        cursor_x, cursor_y = pyautogui.position()
        
        # Ensure the popup appears within screen bounds
        screen_width, screen_height = pyautogui.size()
        x = max(10, min(cursor_x - width - 10, screen_width - width - 10))
        y = max(10, min(cursor_y - height - 10, screen_height - height - 10))

        popup = tk.Tk()
        popup.title("💡 Gemini Answer")
        popup.geometry(f"{width}x{height}+{x}+{y}")
        popup.attributes("-topmost", True)
        tk.Label(popup, text=answer, wraplength=width - 20, justify="left").pack(padx=10, pady=10)
        
        # Add a subtle log for popup display
        print(f"Displaying popup with answer at ({x}, {y})") 
        
        popup.after(5000, popup.destroy)  # Auto-close after 5 seconds
        popup.mainloop()

    threading.Thread(target=fetch_answer).start()

# Run clipboard watcher
threading.Thread(target=check_clipboard, daemon=True).start()

# Keep-alive loop
print("Application running. Waiting for clipboard changes...") # Initial message
while True:
    time.sleep(10)