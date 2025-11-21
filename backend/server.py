from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer(auto_error=False)

# ============= MODELS =============

# User Models
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    token: str
    user: dict

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password: str
    fullName: str
    role: str
    avatar: Optional[str] = None

# Proposal Models
class Proposal(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    client: str
    location: str
    priority: str  # high, medium, low
    status: str  # to_do, in_process, completed
    clientId: str
    firstNameInsured: str
    businessType: str
    totalInsuredValue: str
    website: str
    createdBy: str
    effectiveDate: str
    expirationDate: str
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updatedAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ProposalCreate(BaseModel):
    title: str
    client: str
    location: str
    priority: str
    status: str = "to_do"
    clientId: str
    firstNameInsured: str
    businessType: str
    totalInsuredValue: str
    website: str
    effectiveDate: str
    expirationDate: str

class ProposalUpdate(BaseModel):
    title: Optional[str] = None
    client: Optional[str] = None
    location: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    clientId: Optional[str] = None
    firstNameInsured: Optional[str] = None
    businessType: Optional[str] = None
    totalInsuredValue: Optional[str] = None
    website: Optional[str] = None
    effectiveDate: Optional[str] = None
    expirationDate: Optional[str] = None

class Statistics(BaseModel):
    totalSubmissions: int
    pendingSubmissions: int
    inProcess: int
    completed: int
    hitRatio: float

# ============= AUTHENTICATION =============

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    token = credentials.credentials
    # Simple token validation (in production, use JWT)
    user = await db.users.find_one({"id": token}, {"_id": 0})
    return user

@api_router.post("/auth/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    # Find user by username
    user = await db.users.find_one({"username": login_data.username}, {"_id": 0})
    
    if not user or user.get("password") != login_data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Return user ID as token (simplified - use JWT in production)
    return LoginResponse(
        success=True,
        token=user["id"],
        user={
            "id": user["id"],
            "username": user["username"],
            "fullName": user["fullName"],
            "role": user["role"],
            "avatar": user.get("avatar")
        }
    )

@api_router.get("/auth/me")
async def get_me(user = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {
        "id": user["id"],
        "username": user["username"],
        "fullName": user["fullName"],
        "role": user["role"],
        "avatar": user.get("avatar")
    }

# ============= PROPOSALS =============

@api_router.get("/proposals", response_model=List[Proposal])
async def get_proposals(
    status: Optional[str] = None,
    search: Optional[str] = None
):
    query = {}
    
    # Filter by status
    if status and status != "all":
        query["status"] = status
    
    # Search by title, client, or location
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"client": {"$regex": search, "$options": "i"}},
            {"location": {"$regex": search, "$options": "i"}}
        ]
    
    proposals = await db.proposals.find(query, {"_id": 0}).to_list(1000)
    return proposals

@api_router.get("/proposals/{proposal_id}", response_model=Proposal)
async def get_proposal(proposal_id: str):
    proposal = await db.proposals.find_one({"id": proposal_id}, {"_id": 0})
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return proposal

@api_router.post("/proposals", response_model=Proposal)
async def create_proposal(proposal_data: ProposalCreate, user = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    proposal_dict = proposal_data.model_dump()
    proposal_dict["createdBy"] = user["fullName"]
    proposal = Proposal(**proposal_dict)
    
    doc = proposal.model_dump()
    await db.proposals.insert_one(doc)
    return proposal

@api_router.put("/proposals/{proposal_id}", response_model=Proposal)
async def update_proposal(proposal_id: str, proposal_data: ProposalUpdate):
    # Get existing proposal
    existing = await db.proposals.find_one({"id": proposal_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    # Update only provided fields
    update_data = {k: v for k, v in proposal_data.model_dump().items() if v is not None}
    update_data["updatedAt"] = datetime.now(timezone.utc).isoformat()
    
    await db.proposals.update_one({"id": proposal_id}, {"$set": update_data})
    
    # Return updated proposal
    updated = await db.proposals.find_one({"id": proposal_id}, {"_id": 0})
    return updated

@api_router.delete("/proposals/{proposal_id}")
async def delete_proposal(proposal_id: str):
    result = await db.proposals.delete_one({"id": proposal_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return {"success": True, "message": "Proposal deleted"}

@api_router.get("/statistics", response_model=Statistics)
async def get_statistics():
    # Get all proposals
    proposals = await db.proposals.find({}, {"_id": 0}).to_list(1000)
    
    total = len(proposals)
    pending = len([p for p in proposals if p["status"] == "to_do"])
    in_process = len([p for p in proposals if p["status"] == "in_process"])
    completed = len([p for p in proposals if p["status"] == "completed"])
    
    # Calculate hit ratio (completed / total * 100)
    hit_ratio = (completed / total * 100) if total > 0 else 0
    
    return Statistics(
        totalSubmissions=total,
        pendingSubmissions=pending,
        inProcess=in_process,
        completed=completed,
        hitRatio=round(hit_ratio, 1)
    )

# ============= SEED DATA =============

@api_router.post("/seed")
async def seed_database():
    # Check if data already exists
    existing_users = await db.users.count_documents({})
    if existing_users > 0:
        return {"message": "Database already seeded"}
    
    # Create default user
    user = {
        "id": str(uuid.uuid4()),
        "username": "LARA",
        "password": "password123",
        "fullName": "Lara",
        "role": "Underwriter",
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Lara"
    }
    await db.users.insert_one(user)
    
    # Create sample proposals
    sample_proposals = [
        {
            "id": "prop-001",
            "title": "JW Marriott Chicago",
            "client": "Marriott International Inc.",
            "location": "Chicago, IL",
            "priority": "high",
            "status": "in_process",
            "clientId": "CLT-60F86F01",
            "firstNameInsured": "William",
            "businessType": "Hotel & Hospitality",
            "totalInsuredValue": "$185.0M",
            "website": "www.marriottinterna.com",
            "createdBy": "LARA",
            "effectiveDate": "10/26/2025",
            "expirationDate": "12/25/2025",
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "updatedAt": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Add more sample proposals with varied data
    for i in range(2, 41):
        statuses = ["to_do", "in_process", "completed"]
        priorities = ["high", "medium", "low"]
        business_types = ["Hotel & Hospitality", "Retail", "Manufacturing", "Healthcare", "Technology"]
        
        proposal = {
            "id": f"prop-{str(i).zfill(3)}",
            "title": f"Property {i}",
            "client": f"Client {i} Inc.",
            "location": f"City {i}, State",
            "priority": priorities[i % 3],
            "status": statuses[i % 3],
            "clientId": f"CLT-{uuid.uuid4().hex[:8].upper()}",
            "firstNameInsured": f"Person {i}",
            "businessType": business_types[i % 5],
            "totalInsuredValue": f"${i * 5}.0M",
            "website": f"www.client{i}.com",
            "createdBy": "LARA",
            "effectiveDate": f"10/{(i % 28) + 1}/2025",
            "expirationDate": f"12/{(i % 28) + 1}/2025",
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "updatedAt": datetime.now(timezone.utc).isoformat()
        }
        sample_proposals.append(proposal)
    
    await db.proposals.insert_many(sample_proposals)
    
    return {"message": "Database seeded successfully", "proposals": len(sample_proposals)}

# ============= ROOT ROUTE =============

@api_router.get("/")
async def root():
    return {"message": "Risk Intel Pro API"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()