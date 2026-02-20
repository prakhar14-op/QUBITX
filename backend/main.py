from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import uuid
import time
from typing import List, Optional

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Models ---

class RiskRequest(BaseModel):
    user_id: str
    credit_score: int

class BrokerRequest(BaseModel):
    category: str

class Vendor(BaseModel):
    id: str
    name: str
    price: float
    trust_score: int
    location: Optional[str] = None

class EscrowRequest(BaseModel):
    vendor_id: str
    amount: float

# --- Endpoints ---

@app.post("/api/risk-assessment")
async def risk_assessment(request: RiskRequest):
    # Simulate processing delay
    time.sleep(1)
    
    if request.credit_score < 700:
        return {
            "status": "rejected",
            "reason": "High Risk",
            "agent_triggered": True,
            "message": "Traditional lending criteria not met. Invoking Agentic Protocol..."
        }
    else:
        return {
            "status": "approved",
            "reason": "Low Risk",
            "agent_triggered": False,
            "message": "Loan Approved via Traditional Channel."
        }

@app.post("/api/broker/find-vendors")
async def find_vendors(request: BrokerRequest):
    # Simulate agent search delay
    time.sleep(1.5)
    
    category = request.category.lower()
    
    if "fertilizer" in category:
        return [
            {"id": "v1", "name": "Kisan Agro Mart", "price": 12000, "trust_score": 98, "location": "Local"},
            {"id": "v2", "name": "GreenFields Supply", "price": 12500, "trust_score": 95, "location": "Dist 4"},
            {"id": "v3", "name": "Eco-Grow Traders", "price": 11800, "trust_score": 88, "location": "Dist 2"}
        ]
    elif "seeds" in category:
        return [
            {"id": "v4", "name": "Golden Yield Seeds", "price": 4500, "trust_score": 96, "location": "Local"},
            {"id": "v5", "name": "BioTech Agronomy", "price": 4800, "trust_score": 92, "location": "Dist 1"}
        ]
    elif "equipment" in category:
        return [
            {"id": "v6", "name": "Agri-Tech Solutions", "price": 85000, "trust_score": 99, "location": "City Hub"},
            {"id": "v7", "name": "FarmMechanics Co", "price": 82000, "trust_score": 94, "location": "Dist 3"}
        ]
    else:
        return []

@app.post("/api/escrow/execute")
async def execute_escrow(request: EscrowRequest):
    # Simulate transaction processing
    time.sleep(2)
    
    tx_hash = f"0x{uuid.uuid4().hex[:16]}"
    voucher_code = f"AGRO-{random.randint(1000, 9999)}"
    
    return {
        "status": "success",
        "tx_hash": tx_hash,
        "voucher_code": voucher_code,
        "message": "Funds transferred to Vendor via Smart Contract."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
