"""
Seed database with sample engineer data
Run this script to add initial engineers to the database
"""
import requests
import json

API_BASE_URL = "http://localhost:8000/api"

# Sample engineers data
SAMPLE_ENGINEERS = [
    {
        "name": "Sarah Chen",
        "github_username": "torvalds",  # Using real GitHub usernames for actual data
        "role": "Senior Full Stack Engineer",
        "location": "San Francisco, CA",
        "skills": ["React", "TypeScript", "Node.js", "Python", "AWS", "Docker"],
        "experience": 8
    },
    {
        "name": "Marcus Johnson",
        "github_username": "gaearon",
        "role": "Frontend Architect",
        "location": "Austin, TX",
        "skills": ["React", "JavaScript", "Redux", "Next.js", "GraphQL"],
        "experience": 10
    },
    {
        "name": "Priya Sharma",
        "github_username": "tj",
        "role": "DevOps Engineer",
        "location": "Seattle, WA",
        "skills": ["Kubernetes", "Docker", "Python", "Go", "Terraform", "AWS"],
        "experience": 6
    },
    {
        "name": "Alex Rodriguez",
        "github_username": "sindresorhus",
        "role": "Full Stack Developer",
        "location": "New York, NY",
        "skills": ["TypeScript", "Node.js", "React", "PostgreSQL", "Redis"],
        "experience": 5
    },
    {
        "name": "Emily Watson",
        "github_username": "yyx990803",
        "role": "Senior Backend Engineer",
        "location": "Remote",
        "skills": ["Python", "Django", "FastAPI", "PostgreSQL", "Redis", "Docker"],
        "experience": 7
    }
]

def create_engineer(engineer_data):
    """Create an engineer via the API"""
    try:
        response = requests.post(
            f"{API_BASE_URL}/engineers",
            json=engineer_data,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        result = response.json()
        print(f"✓ Created engineer: {engineer_data['name']} (ID: {result['id']})")
        return result
    except requests.exceptions.RequestException as e:
        print(f"✗ Failed to create {engineer_data['name']}: {e}")
        if hasattr(e.response, 'text'):
            print(f"  Response: {e.response.text}")
        return None

def main():
    print("=" * 60)
    print("Seeding Elite Engineer Discovery Platform Database")
    print("=" * 60)
    print()
    
    # Check if backend is running
    try:
        response = requests.get(f"http://localhost:8000/health")
        response.raise_for_status()
        print("✓ Backend API is running")
        print()
    except requests.exceptions.RequestException:
        print("✗ Error: Backend API is not running!")
        print("  Please start the backend first: python -m uvicorn app.main:app --reload")
        return
    
    # Create engineers
    print(f"Creating {len(SAMPLE_ENGINEERS)} sample engineers...")
    print()
    
    created_count = 0
    for engineer_data in SAMPLE_ENGINEERS:
        result = create_engineer(engineer_data)
        if result:
            created_count += 1
    
    print()
    print("=" * 60)
    print(f"Database seeding complete! Created {created_count}/{len(SAMPLE_ENGINEERS)} engineers")
    print("=" * 60)
    print()
    print("You can now:")
    print("  1. Visit http://localhost:5173/dashboard to view the engineers")
    print("  2. Visit http://localhost:8000/docs for API documentation")
    print()

if __name__ == "__main__":
    main()
