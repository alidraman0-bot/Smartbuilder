import subprocess
import os
import logging

logger = logging.getLogger("smartbuilder.generator")

class CodeGenerator:
    """
    Code Generator Agent.
    Wraps the Base44 CLI to initialize projects from a design.
    """

    def generate_project(self, project_name: str, design_spec: str) -> str:
        """
        Uses Base44 CLI to scaffold the project.
        """
        try:
            # 1. Setup the directory
            cwd = os.getcwd()
            project_path = os.path.join(cwd, "generated_projects", project_name)
            os.makedirs(project_path, exist_ok=True)

            logger.info(f"Initializing Base44 project: {project_name}")
            
            # 2. Run Base44 Init (Assuming it takes some params or we just use it to scaffold)
            # This is a hypothetical CLI usage based on standard patterns
            result = subprocess.run(
                ["base44", "init", project_name],
                cwd=project_path,
                capture_output=True,
                text=True,
                check=True
            )

            logger.info("Base44 initialization complete.")
            return f"Project {project_name} successfully scaffolded at {project_path}."

        except subprocess.CalledProcessError as e:
            logger.error(f"Base44 CLI Error: {e.stderr}")
            return f"Failed to generate project: {e.stderr}"
        except Exception as e:
            logger.error(f"Unexpected error in generation: {str(e)}")
            return str(e)

if __name__ == "__main__":
    generator = CodeGenerator()
    # generator.generate_project("test-app", "A simple dashboard")
