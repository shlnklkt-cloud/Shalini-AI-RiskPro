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
    role: str

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
    # Find user by username and role
    user = await db.users.find_one({
        "username": login_data.username,
        "role": login_data.role
    }, {"_id": 0})
    
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

# ============= UWR_C DASHBOARD APIs =============

@api_router.get("/uwrc/statistics")
async def get_uwrc_statistics():
    """Get statistics for UWR_C dashboard"""
    # Get property data
    properties = await db.properties.find({}, {"_id": 0}).to_list(1000)
    
    # Calculate statistics
    new_business = len([p for p in properties if p.get("type") == "new_business"])
    renewals = len([p for p in properties if p.get("type") == "renewal"])
    endorsements = len([p for p in properties if p.get("type") == "endorsement"])
    
    pending_submissions = len([p for p in properties if p.get("status") == "pending"])
    
    # Calculate potential premium
    total_premium = sum([float(p.get("premium", "0").replace("$", "").replace("M", "").replace(",", "")) for p in properties])
    
    # Calculate hit ratio
    completed = len([p for p in properties if p.get("status") == "completed"])
    hit_ratio = (completed / len(properties) * 100) if len(properties) > 0 else 0
    
    return {
        "newBusiness": new_business,
        "renewals": renewals,
        "endorsements": endorsements,
        "pendingSubmissions": pending_submissions,
        "potentialPremium": f"${total_premium:.1f}M",
        "hitRatio": round(hit_ratio, 1)
    }

@api_router.get("/uwrc/properties")
async def get_uwrc_properties(
    state: Optional[str] = None,
    lob: Optional[str] = None,
    customerId: Optional[str] = None
):
    """Get properties for UWR_C dashboard with filters"""
    query = {}
    
    if state and state != "All":
        query["state"] = state
    if lob and lob != "All":
        query["lobs"] = lob
    if customerId and customerId != "All":
        query["customerId"] = customerId
    
    properties = await db.properties.find(query, {"_id": 0}).to_list(1000)
    return properties

@api_router.get("/uwrc/filters")
async def get_uwrc_filters():
    """Get available filter options"""
    properties = await db.properties.find({}, {"_id": 0}).to_list(1000)
    
    # Extract unique states
    states = list(set([p.get("state") for p in properties if p.get("state")]))
    states.sort()
    
    # Extract unique customer IDs
    customer_ids = list(set([p.get("customerId") for p in properties if p.get("customerId")]))
    customer_ids.sort()
    
    return {
        "states": ["All"] + states,
        "lobs": ["All", "Package", "Property", "Auto", "Inland Marine", "Umbrella", "General Liability"],
        "customerIds": ["All"] + customer_ids
    }

# ============= PROPERTY DETAILS APIs =============

@api_router.get("/properties/{property_id}")
async def get_property_detail(property_id: str):
    """Get detailed property information"""
    property_data = await db.properties.find_one({"id": property_id}, {"_id": 0})
    if not property_data:
        raise HTTPException(status_code=404, detail="Property not found")
    return property_data

@api_router.get("/properties/{property_id}/exposure/{lob}")
async def get_property_exposure(property_id: str, lob: str):
    """Get exposure data for a specific LOB"""
    exposure = await db.exposures.find_one({"propertyId": property_id, "lob": lob}, {"_id": 0})
    if not exposure:
        # Return default structure
        return {
            "propertyId": property_id,
            "lob": lob,
            "totalInsurableValue2024": "$0M",
            "totalInsurableValue2025": "$0M",
            "coverages": []
        }
    return exposure

@api_router.get("/properties/{property_id}/limits/{lob}")
async def get_property_limits(property_id: str, lob: str):
    """Get limit of liabilities for a specific LOB"""
    limits = await db.limits.find_one({"propertyId": property_id, "lob": lob}, {"_id": 0})
    if not limits:
        return {
            "propertyId": property_id,
            "lob": lob,
            "categories": []
        }
    return limits

@api_router.post("/properties/{property_id}/whatif/{lob}")
async def save_whatif_analysis(property_id: str, lob: str, data: dict):
    """Save what-if analysis data"""
    whatif_data = {
        "propertyId": property_id,
        "lob": lob,
        "coverages": data.get("coverages", []),
        "totalPremium": data.get("totalPremium", "0"),
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }
    
    # Update or insert
    await db.whatif.update_one(
        {"propertyId": property_id, "lob": lob},
        {"$set": whatif_data},
        upsert=True
    )
    
    return {"success": True, "message": "What-if analysis saved"}

@api_router.get("/properties/{property_id}/whatif/{lob}")
async def get_whatif_analysis(property_id: str, lob: str):
    """Get what-if analysis data"""
    whatif = await db.whatif.find_one({"propertyId": property_id, "lob": lob}, {"_id": 0})
    if not whatif:
        # Get default from exposure
        exposure = await db.exposures.find_one({"propertyId": property_id, "lob": lob}, {"_id": 0})
        if exposure:
            return {
                "propertyId": property_id,
                "lob": lob,
                "coverages": exposure.get("coverages", []),
                "totalPremium": "0"
            }
        return {
            "propertyId": property_id,
            "lob": lob,
            "coverages": [],
            "totalPremium": "0"
        }
    return whatif

@api_router.get("/properties/{property_id}/multiline-quote")
async def get_multiline_quote(property_id: str):
    """Get multi-line quote summary"""
    property_data = await db.properties.find_one({"id": property_id}, {"_id": 0})
    if not property_data:
        raise HTTPException(status_code=404, detail="Property not found")
    
    lobs = property_data.get("lobs", [])
    quote_items = []
    total_premium = 0
    
    for lob in lobs:
        whatif = await db.whatif.find_one({"propertyId": property_id, "lob": lob}, {"_id": 0})
        if whatif:
            premium_str = whatif.get("totalPremium", "0").replace("$", "").replace("M", "").replace(",", "")
            premium = float(premium_str) if premium_str else 0
            quote_items.append({
                "product": lob,
                "premium": f"${premium:.2f}M"
            })
            total_premium += premium
    
    return {
        "items": quote_items,
        "totalPremium": f"${total_premium:.2f}M"
    }

# ============= SEED DATA =============

@api_router.post("/seed")
async def seed_database(force: bool = False):
    # Check if data already exists
    existing_users = await db.users.count_documents({})
    if existing_users > 0 and not force:
        return {"message": "Database already seeded, use force=true to reseed"}
    
    # Clear existing data if force is true
    if force:
        await db.users.delete_many({})
        await db.proposals.delete_many({})
    
    # Create users
    users = [
        {
            "id": str(uuid.uuid4()),
            "username": "LARA",
            "password": "password123",
            "fullName": "Lara",
            "role": "UWR_B",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Lara"
        },
        {
            "id": str(uuid.uuid4()),
            "username": "ZARA",
            "password": "password123",
            "fullName": "Zara",
            "role": "UWR_C",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Zara"
        }
    ]
    await db.users.insert_many(users)
    
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
    
    # Add more sample proposals with real property data
    real_properties = [
        {"title": "Austin Commercial Center", "client": "John's Bakery", "location": "Springfield, IL", "priority": "low", "status": "completed", "businessType": "Retail", "value": "$45.0M"},
        {"title": "Austin Office Tower", "client": "Summit Commercial Inc.", "location": "Austin, TX", "priority": "medium", "status": "completed", "businessType": "Office", "value": "$78.0M"},
        {"title": "Austin Retail Plaza", "client": "Coastal Properties LLC Inc.", "location": "Austin, TX", "priority": "high", "status": "completed", "businessType": "Retail", "value": "$52.0M"},
        {"title": "Boston Commercial Center", "client": "Apex Real Estate Inc.", "location": "Boston, MA", "priority": "medium", "status": "completed", "businessType": "Office", "value": "$95.0M"},
        {"title": "Boston Retail Plaza", "client": "Horizon Investments Inc.", "location": "Boston, MA", "priority": "medium", "status": "to_do", "businessType": "Retail", "value": "$38.0M"},
        {"title": "Charlotte Office Tower", "client": "Apex Real Estate Inc.", "location": "Charlotte, NC", "priority": "low", "status": "completed", "businessType": "Office", "value": "$62.0M"},
        {"title": "Denver Shopping Mall", "client": "Mountain View Properties", "location": "Denver, CO", "priority": "high", "status": "in_process", "businessType": "Retail", "value": "$120.0M"},
        {"title": "Miami Beach Resort", "client": "Oceanfront Hotels Group", "location": "Miami, FL", "priority": "high", "status": "in_process", "businessType": "Hotel & Hospitality", "value": "$250.0M"},
        {"title": "Seattle Tech Campus", "client": "Pacific Northwest Tech Inc.", "location": "Seattle, WA", "priority": "medium", "status": "to_do", "businessType": "Technology", "value": "$180.0M"},
        {"title": "Portland Industrial Park", "client": "Northwest Manufacturing", "location": "Portland, OR", "priority": "low", "status": "completed", "businessType": "Manufacturing", "value": "$65.0M"},
        {"title": "Phoenix Medical Center", "client": "Desert Healthcare Systems", "location": "Phoenix, AZ", "priority": "high", "status": "in_process", "businessType": "Healthcare", "value": "$145.0M"},
        {"title": "Las Vegas Convention Center", "client": "Nevada Events Corp", "location": "Las Vegas, NV", "priority": "medium", "status": "in_process", "businessType": "Entertainment", "value": "$200.0M"},
        {"title": "Atlanta Financial Tower", "client": "Southern Banking Group", "location": "Atlanta, GA", "priority": "high", "status": "to_do", "businessType": "Finance", "value": "$165.0M"},
        {"title": "San Francisco Tech Hub", "client": "Bay Area Ventures LLC", "location": "San Francisco, CA", "priority": "high", "status": "in_process", "businessType": "Technology", "value": "$320.0M"},
        {"title": "Houston Energy Complex", "client": "Texas Energy Holdings", "location": "Houston, TX", "priority": "medium", "status": "completed", "businessType": "Energy", "value": "$275.0M"},
        {"title": "Detroit Manufacturing Plant", "client": "Great Lakes Industrial", "location": "Detroit, MI", "priority": "low", "status": "to_do", "businessType": "Manufacturing", "value": "$85.0M"},
        {"title": "Philadelphia Historic Building", "client": "Liberty Properties Inc.", "location": "Philadelphia, PA", "priority": "medium", "status": "completed", "businessType": "Office", "value": "$72.0M"},
        {"title": "Nashville Music Hall", "client": "Tennessee Entertainment LLC", "location": "Nashville, TN", "priority": "low", "status": "completed", "businessType": "Entertainment", "value": "$48.0M"},
        {"title": "Minneapolis Corporate Center", "client": "Twin Cities Realty", "location": "Minneapolis, MN", "priority": "medium", "status": "in_process", "businessType": "Office", "value": "$98.0M"},
        {"title": "San Diego Coastal Resort", "client": "Pacific Beachfront Hotels", "location": "San Diego, CA", "priority": "high", "status": "in_process", "businessType": "Hotel & Hospitality", "value": "$195.0M"},
        {"title": "New Orleans Convention Hotel", "client": "Crescent City Hospitality", "location": "New Orleans, LA", "priority": "medium", "status": "to_do", "businessType": "Hotel & Hospitality", "value": "$125.0M"},
        {"title": "Pittsburgh Innovation Center", "client": "Steel City Ventures", "location": "Pittsburgh, PA", "priority": "low", "status": "completed", "businessType": "Technology", "value": "$78.0M"},
        {"title": "Indianapolis Distribution Hub", "client": "Midwest Logistics Corp", "location": "Indianapolis, IN", "priority": "medium", "status": "in_process", "businessType": "Logistics", "value": "$92.0M"},
        {"title": "Tampa Bay Medical Plaza", "client": "Florida Healthcare Partners", "location": "Tampa, FL", "priority": "high", "status": "to_do", "businessType": "Healthcare", "value": "$115.0M"},
        {"title": "Kansas City Business Park", "client": "Heartland Commercial Group", "location": "Kansas City, MO", "priority": "low", "status": "completed", "businessType": "Office", "value": "$68.0M"},
        {"title": "Salt Lake City Ski Resort", "client": "Mountain Peak Resorts Inc.", "location": "Salt Lake City, UT", "priority": "high", "status": "in_process", "businessType": "Hotel & Hospitality", "value": "$155.0M"},
        {"title": "Raleigh Research Facility", "client": "Triangle Innovation Partners", "location": "Raleigh, NC", "priority": "medium", "status": "completed", "businessType": "Technology", "value": "$88.0M"},
        {"title": "Milwaukee Brewery Complex", "client": "Great Lakes Brewing Co", "location": "Milwaukee, WI", "priority": "low", "status": "to_do", "businessType": "Manufacturing", "value": "$42.0M"},
        {"title": "Richmond Historic District", "client": "Virginia Heritage Properties", "location": "Richmond, VA", "priority": "medium", "status": "in_process", "businessType": "Mixed Use", "value": "$105.0M"},
        {"title": "Oklahoma City Energy Tower", "client": "Plains Petroleum Group", "location": "Oklahoma City, OK", "priority": "high", "status": "completed", "businessType": "Energy", "value": "$132.0M"},
        {"title": "Louisville Distribution Center", "client": "Kentucky Commerce Holdings", "location": "Louisville, KY", "priority": "medium", "status": "to_do", "businessType": "Logistics", "value": "$75.0M"},
        {"title": "Tucson Desert Plaza", "client": "Southwest Retail Partners", "location": "Tucson, AZ", "priority": "low", "status": "completed", "businessType": "Retail", "value": "$55.0M"},
        {"title": "Albuquerque Tech Park", "client": "Rio Grande Innovation LLC", "location": "Albuquerque, NM", "priority": "medium", "status": "in_process", "businessType": "Technology", "value": "$82.0M"},
        {"title": "Buffalo Industrial Complex", "client": "Great Lakes Manufacturing", "location": "Buffalo, NY", "priority": "low", "status": "completed", "businessType": "Manufacturing", "value": "$58.0M"},
        {"title": "Fresno Agricultural Center", "client": "Central Valley Agribusiness", "location": "Fresno, CA", "priority": "medium", "status": "to_do", "businessType": "Agriculture", "value": "$48.0M"},
        {"title": "Omaha Financial Plaza", "client": "Midwest Banking Corporation", "location": "Omaha, NE", "priority": "high", "status": "in_process", "businessType": "Finance", "value": "$128.0M"},
        {"title": "Boise Tech Campus", "client": "Mountain West Technology", "location": "Boise, ID", "priority": "medium", "status": "completed", "businessType": "Technology", "value": "$95.0M"},
        {"title": "Charleston Historic Inn", "client": "Lowcountry Hospitality Group", "location": "Charleston, SC", "priority": "high", "status": "to_do", "businessType": "Hotel & Hospitality", "value": "$112.0M"},
        {"title": "Spokane Medical Complex", "client": "Inland Northwest Healthcare", "location": "Spokane, WA", "priority": "medium", "status": "in_process", "businessType": "Healthcare", "value": "$98.0M"},
    ]
    
    for i, prop_data in enumerate(real_properties, start=2):
        proposal = {
            "id": f"prop-{str(i).zfill(3)}",
            "title": prop_data["title"],
            "client": prop_data["client"],
            "location": prop_data["location"],
            "priority": prop_data["priority"],
            "status": prop_data["status"],
            "clientId": f"CLT-{uuid.uuid4().hex[:8].upper()}",
            "firstNameInsured": prop_data["client"].split()[0],
            "businessType": prop_data["businessType"],
            "totalInsuredValue": prop_data["value"],
            "website": f"www.{prop_data['client'].lower().replace(' ', '').replace('.', '').replace(',', '')[:15]}.com",
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