from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import solver
import json

app = FastAPI()

# Add middleware to log all incoming requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"\n=== INCOMING REQUEST ===")
    print(f"Method: {request.method}")
    print(f"URL: {request.url}")
    print(f"Headers: {dict(request.headers)}")

    # Read the body
    body = await request.body()
    print(f"Raw Body Length: {len(body)} bytes")
    print(f"Raw Body: {body[:500]}")  # First 500 bytes

    # Important: We need to create a new request with the body for downstream processing
    async def receive():
        return {"type": "http.request", "body": body}

    request._receive = receive

    response = await call_next(request)
    print(f"Response Status: {response.status_code}")
    print(f"======================\n")
    return response

class Order(BaseModel):
    id: str  # Must be str to catch UUIDs
    latitude: float
    longitude: float
    weightKg: float = Field(alias="weightKg")
    serviceDurationMin: float = Field(alias="serviceDurationMin")
    model_config = ConfigDict(extra="allow", populate_by_name=True)

class Vehicle(BaseModel):
    id: Optional[str] = None
    capacityKg: Optional[float] = Field(None, alias="capacityKg")
    startLat: Optional[float] = None
    startLon: Optional[float] = None
    
    model_config = ConfigDict(extra="allow", populate_by_name=True)

class RouteRequest(BaseModel):
    # This matches your RouteRequest.java fields exactly
    orders: List[Order]
    vehicles: List[Vehicle]
    model_config = ConfigDict(extra="allow")

@app.post("/solve")
def solve(data: RouteRequest):
    try:
        print(f"--- Received request with {len(data.orders)} orders and {len(data.vehicles)} vehicles ---")

        # 1. Convert models to dictionaries for solver.py
        orders_list = [o.model_dump() for o in data.orders]
        # Use the first vehicle if available
        vehicle_dict = data.vehicles[0].model_dump() if data.vehicles else {}

        print(f"Sample order: {orders_list[0] if orders_list else 'None'}")
        print(f"Vehicle: {vehicle_dict}")

        # 2. Call solver.py
        result = solver.solve_route(orders_list, vehicle_dict)

        print(f"--- Optimization complete: {len(result)} stops ---")

        # 3. CRITICAL: Wrap in "route" key to match RouteResponse.java
        # RouteResponse.java expects: { "route": [ ... ] }
        return {"route": result}

    except Exception as e:
        print(f"Solver Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))