from flask import Flask, request, jsonify
from flask_cors import CORS
import re

app = Flask(__name__)
CORS(app)

# Skill groups mapping
SKILL_GROUPS = {
    'fullstack java': ['java', 'angular', 'spring boot'],
    'fullstack javascript': ['react', 'javascript', 'redux', 'node.js', 'express'],
    'devops': ['docker', 'kubernetes', 'aws', 'azure', 'ci/cd'],
}

def normalize_skill(skill):
    """Normalize skill names for consistent matching"""
    return re.sub(r'[^a-z0-9]+', ' ', skill.lower()).strip()

def expand_query(query):
    """Expand search query to include related skills"""
    query = normalize_skill(query)
    expanded = set()
    
    # Check if the query matches any skill group
    for group, skills in SKILL_GROUPS.items():
        if group in query:
            expanded.update(skills)
    
    # Always include the original search terms
    expanded.update(query.split())
    
    return list(expanded)

def calculate_match_score(requirements, candidate_skills):
    """Calculate match percentage based on skill overlap"""
    required_skills = expand_query(requirements)
    candidate_skills = [normalize_skill(s) for s in candidate_skills]
    
    if not required_skills:
        return 0
    
    matched = sum(1 for skill in required_skills if skill in candidate_skills)
    return round((matched / len(required_skills)) * 100, 2)

@app.route('/match', methods=['POST'])
def match_candidates():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        requirements = data.get('requirements', '')
        candidates = data.get('candidates', [])
        
        if not requirements or not candidates:
            return jsonify({"error": "Missing requirements or candidates"}), 400
        
        results = []
        for candidate in candidates:
            if not isinstance(candidate, dict):
                continue
                
            skills = candidate.get('skills', [])
            if not isinstance(skills, list):
                skills = []
            
            score = calculate_match_score(requirements, skills)
            
            results.append({
                "id": candidate.get('id'),
                "name": f"{candidate.get('prenom', '')} {candidate.get('nom', '')}".strip(),
                "match_percentage": score,
                "skills": skills,
                "matched_skills": [s for s in skills 
                                 if normalize_skill(s) in expand_query(requirements)]
            })
        
        # Sort by match percentage (highest first)
        results.sort(key=lambda x: x['match_percentage'], reverse=True)
        
        return jsonify({
            "matches": results,
            "expanded_query": expand_query(requirements)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)