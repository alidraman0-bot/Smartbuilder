"""
Editor Service

Handles file operations for the in-app code editor.
Responsible for reading, writing, and listing files in the project workspace.
"""

import os
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path

logger = logging.getLogger(__name__)

class EditorService:
    def __init__(self, base_path: str = "."):
        self.base_path = Path(base_path).resolve()

    def list_files(self, current_path: str = "") -> List[Dict[str, Any]]:
        """List files in the project workspace for the file tree."""
        target_path = self.base_path / current_path
        if not target_path.exists() or not target_path.is_dir():
            return []

        files = []
        try:
            for item in target_path.iterdir():
                # Skip hidden files and common exclusions
                if item.name.startswith((".", "__pycache__", "node_modules", "v-env")):
                    continue
                
                relative_path = item.relative_to(self.base_path).as_posix()
                files.append({
                    "name": item.name,
                    "path": relative_path,
                    "is_dir": item.is_dir(),
                    "size": item.stat().st_size if item.is_file() else 0
                })
        except Exception as e:
            logger.error(f"Error listing files in {target_path}: {e}")
        
        # Sort: directories first, then files
        files.sort(key=lambda x: (not x["is_dir"], x["name"].lower()))
        return files

    def read_file(self, file_path: str) -> Optional[str]:
        """Read content of a file."""
        target_path = (self.base_path / file_path).resolve()
        
        # Security check: ensure path is within base_path
        if not str(target_path).startswith(str(self.base_path)):
            logger.warning(f"Access denied to path: {file_path}")
            return None

        if not target_path.exists() or not target_path.is_file():
            return None

        try:
            return target_path.read_text(encoding="utf-8")
        except Exception as e:
            logger.error(f"Error reading file {target_path}: {e}")
            return None

    def write_file(self, file_path: str, content: str) -> bool:
        """Write content to a file."""
        target_path = (self.base_path / file_path).resolve()
        
        # Security check
        if not str(target_path).startswith(str(self.base_path)):
            logger.warning(f"Write denied to path: {file_path}")
            return False

        try:
            # Ensure parent directories exist
            target_path.parent.mkdir(parents=True, exist_ok=True)
            target_path.write_text(content, encoding="utf-8")
            return True
        except Exception as e:
            logger.error(f"Error writing file {target_path}: {e}")
            return False

# Global instance
editor_service = EditorService()
