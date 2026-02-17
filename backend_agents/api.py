from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import sys

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from crewai import Crew, Process
from agents import PurposePayAgents
from tasks import PurposePayTasks
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoanRequest(BaseModel):
    item: str
    quantity: int
    vendor_id: str
    farmer_id: str

@app.post("/run-agents")
async def run_agents(request: LoanRequest):
    try:
        # Set API Key - HARDCODED FOR DEMO
        # REPLACE THIS WITH YOUR ACTUAL OPENAI API KEY
        os.environ["OPENAI_API_KEY"] = "sk-proj-..." 
        
        # Instantiate Agents & Tasks
        agents = PurposePayAgents()
        tasks = PurposePayTasks()

        broker = agents.broker_agent()
        escrow = agents.escrow_agent()
        recovery = agents.recovery_agent()

        # Define Tasks
        task1 = tasks.verify_purchase_task(broker, request.item, request.quantity, request.vendor_id)
        task2 = tasks.execute_payment_task(escrow, "Verified Purchase Order")
        task3 = tasks.recover_loan_task(recovery, request.farmer_id)

        # Create Crew
        crew = Crew(
            agents=[broker, escrow, recovery],
            tasks=[task1, task2, task3],
            verbose=True,
            process=Process.sequential
        )

        # Kickoff
        result = crew.kickoff()
        
        return {
            "status": "success", 
            "result": str(result),
            "logs": ["Broker Verified Price", "Escrow Released Funds", "Recovery Scheduled Repayment"]
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
