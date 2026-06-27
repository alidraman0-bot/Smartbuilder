import asyncio
import logging
from app.services.mvp_builder_service import MvpBuilderService

logging.basicConfig(level=logging.INFO)

async def test_simple():
    svc = MvpBuilderService()
    session_id = "test-simple-session"
    
    print(f"Starting simple test for session: {session_id}")
    try:
        # Create session
        session = svc.create_session(
            run_id="test-run-simple",
            idea="A simple Hello World landing page with a blue header and a centered 'Start Building' button.",
        )
        
        # Use the generated session_id
        session_id = session.session_id
        
        # Submit idea
        await svc.submit_idea(session_id, "A simple Hello World landing page with a blue header and a centered 'Start Building' button.")
        
        print(f"Final State: {session.state}")
        print(f"Files Generated: {len(session.files)}")
        for f in session.files:
            print(f" - {f['path']} ({len(f['content'])} bytes)")
            
    except Exception as e:
        print(f"Test failed with error: {e}")

if __name__ == "__main__":
    asyncio.run(test_simple())
