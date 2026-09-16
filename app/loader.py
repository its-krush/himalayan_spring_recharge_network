import json
from pathlib import Path

DATA_FILE = Path("data/glaciers_india.json")

def load_indian_glaciers():
    """Dynamically loads the Indian glacier dataset."""
    if not DATA_FILE.exists():
        raise FileNotFoundError(f"Glacier registry not found at {DATA_FILE}")
    
    with open(DATA_FILE, "r") as f:
        registry = json.load(f)
    
    return registry

# Example test run
if __name__ == "__main__":
    glaciers = load_indian_glaciers()
    print(f"Successfully loaded {len(glaciers)} glaciers across India.")
    for key, data in glaciers.items():
        print(f" - {data['name']} ({data['state']})")