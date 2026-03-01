import asyncio
from app.services.opportunity_service import opportunity_service

async def test_score_service():
    print("Testing Opportunity Score Service directly...")
    
    try:
        result = await opportunity_service.process_opportunity(
            idea_title="AI-Powered Code Reviewer",
            idea_description="A GitHub app that automatically reviews pull requests using LLMs, leaving comments on structure and logic, not just syntax.",
            market_data="Growing demand for dev tools, highly saturated market but mostly low-quality competitors."
        )
        
        print("\nSuccess!")
        print("\nExtracted Signals:")
        print(result.get("signals", {}))
        print(f"\nOpportunity Score: {result.get('opportunity_score')}/10")
        
        if "error" in result:
            print(f"\nWARNING Database Error: {result['error']}")
            print("This likely means the 'opportunities' table has not been created in Supabase yet.")
            print("Please run the SQL in 'opportunities_schema.sql' in your Supabase SQL Editor.")
        else:
            print(f"\nDatabase: Successfully stored in Supabase with ID {result.get('id')}")
            
    except Exception as e:
        import traceback
        print(f"Failed to run service: {str(e)}")
        print(traceback.format_exc())

if __name__ == "__main__":
    # Ensure environment variables are loaded if typically done at startup
    from dotenv import load_dotenv
    load_dotenv()
    
    asyncio.run(test_score_service())
