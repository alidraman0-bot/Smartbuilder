import asyncio
import logging
from app.services.mvp_builder_service import MvpBuilderService

logging.basicConfig(level=logging.INFO)

async def test_base44():
    svc = MvpBuilderService()
    session = svc.create_session(
        run_id="test-run-id-123",
        idea="A simple task management app with users, tasks, and projects.",
    )
    
    try:
        await svc.submit_idea(session.session_id, "A simple task management app with users, tasks, and projects.")
    except Exception as e:
        print(f"Error during submit_idea: {e}")
        
    print(f"Final state: {session.state}")
    print(f"Files Generated: len({len(session.files)})")
    for file in session.files:
         print(f" - {file['path']} ({len(file['content'])} bytes)")
    
    if session.last_error:
        print(f"Last Error: {session.last_error}")
        
    for event in session.timeline:
        print(f"Timeline: [{event.timestamp}] {event.type} - {event.message}")

if __name__ == "__main__":
    asyncio.run(test_base44())
