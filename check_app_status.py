import socket
import sys

def check_port(port):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(1)
            result = s.connect_ex(('127.0.0.1', port))
            status = "OPEN" if result == 0 else "CLOSED"
            with open("status.log", "a") as f:
                f.write(f"Port {port} is {status}\n")
    except Exception as e:
        with open("status.log", "a") as f:
            f.write(f"Error checking port {port}: {e}\n")

with open("status.log", "w") as f:
    f.write("Checking ports...\n")

check_port(8000)
check_port(3000)
