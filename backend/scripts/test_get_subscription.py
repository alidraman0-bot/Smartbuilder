import asyncio, sys
from pathlib import Path

project_root = str(Path(__file__).parent.parent.parent)
if project_root not in sys.path:
    sys.path.append(project_root)

from app.services.billing_service import billing_service

ORG_ID = "d65976c8-c5ec-4129-a726-a66fea109f6b"

async def main():
    result = await billing_service.get_subscription(ORG_ID)
    print("get_subscription() result:")
    import json
    print(json.dumps(result, indent=2, default=str) if result else "None")

if __name__ == "__main__":
    asyncio.run(main())
