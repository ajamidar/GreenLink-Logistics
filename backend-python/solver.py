import math
import requests # <--- New Library to talk to OSRM
from typing import List, Dict

# Configuration: Pointing to your local Docker OSRM server
OSRM_URL = "http://localhost:5000/route/v1/driving"

def get_osrm_distance(lat1, lon1, lat2, lon2):
    """
    Calls the local OSRM server to get the real-world driving distance.
    Returns distance in meters.
    """
    # OSRM expects coordinates as: longitude,latitude
    url = f"{OSRM_URL}/{lon1},{lat1};{lon2},{lat2}?overview=false"
    
    try:
        response = requests.get(url, timeout=2) # 2 second timeout to prevent hanging
        if response.status_code == 200:
            data = response.json()
            # "routes"[0]["distance"] is the driving distance in meters
            return data["routes"][0]["distance"]
        else:
            print(f"OSRM Error: {response.status_code}")
            return 999999999 # Return huge number if route fails so we don't pick it
    except Exception as e:
        print(f"Connection Error to OSRM: {e}")
        return 999999999

def solve_route(orders: List[Dict], vehicle: Dict):
    # 1. Start at the Vehicle's Depot
    # (If vehicle has no start location, default to NYC City Hall)
    current_lat = vehicle.get("startLat") if vehicle.get("startLat") else 40.7128
    current_lon = vehicle.get("startLon") if vehicle.get("startLon") else -74.0060

    unvisited = orders.copy()
    route_path = []

    print(f"--- Starting Optimization for {len(orders)} orders (Using OSRM) ---")

    # 2. Greedy Algorithm (Nearest Neighbor)
    while unvisited:
        nearest_order = None
        min_distance = float('inf')

        # Find the closest order to our CURRENT location
        for order in unvisited:
            # CALL OSRM HERE instead of math formula
            dist = get_osrm_distance(
                current_lat, current_lon, 
                order['latitude'], order['longitude']
            )

            if dist < min_distance:
                min_distance = dist
                nearest_order = order

        # Move to that order
        if nearest_order:
            route_path.append(nearest_order)
            unvisited.remove(nearest_order)
            
            # Update current location to be this order's location
            current_lat = nearest_order['latitude']
            current_lon = nearest_order['longitude']
            
            print(f" -> Added Order {nearest_order['id']} ({min_distance:.1f} meters)")

    return route_path