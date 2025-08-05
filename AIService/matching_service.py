from flask import Flask, request, jsonify
from flask_cors import CORS
import re
from difflib import SequenceMatcher
import json

app = Flask(__name__)
CORS(app)

# Enhanced skill groups mapping with synonyms and related technologies
SKILL_GROUPS = {
    'fullstack java': {
        'core': ['java', 'spring', 'springboot', 'spring boot', 'hibernate'],
        'frontend': ['angular', 'react', 'vue', 'javascript', 'typescript', 'html', 'css'],
        'database': ['mysql', 'postgresql', 'mongodb', 'oracle'],
        'tools': ['maven', 'gradle', 'git', 'docker', 'jenkins']
    },
    'frontend': {
        'core': ['javascript', 'typescript', 'html', 'css', 'sass', 'scss'],
        'frameworks': ['angular', 'react', 'vue', 'svelte', 'next.js', 'nuxt.js'],
        'tools': ['webpack', 'vite', 'npm', 'yarn', 'babel']
    },
    'backend': {
        'java': ['java', 'spring', 'springboot', 'spring boot', 'hibernate', 'jpa'],
        'python': ['python', 'django', 'flask', 'fastapi', 'sqlalchemy'],
        'node': ['node.js', 'express', 'nestjs', 'koa'],
        'dotnet': ['c#', 'asp.net', '.net', 'entity framework']
    },
    'devops': {
        'containerization': ['docker', 'kubernetes', 'podman'],
        'ci_cd': ['jenkins', 'gitlab ci', 'github actions', 'azure devops'],
        'cloud': ['aws', 'azure', 'gcp', 'google cloud'],
        'monitoring': ['prometheus', 'grafana', 'elk', 'splunk']
    }
}

# Skill synonyms for better matching
SKILL_SYNONYMS = {
    'js': 'javascript',
    'ts': 'typescript',
    'angular': 'angularjs',
    'react': 'reactjs',
    'vue': 'vuejs',
    'node': 'node.js',
    'nodejs': 'node.js',
    'spring boot': 'springboot',
    'postgresql': 'postgres',
    'mongodb': 'mongo',
    'k8s': 'kubernetes',
    'docker': 'containerization',
    'ci/cd': 'continuous integration'
}

# Skill importance weights (1.0 = normal, >1.0 = more important, <1.0 = less important)
SKILL_WEIGHTS = {
    'core_technologies': 1.5,  # Core programming languages and main frameworks
    'secondary_technologies': 1.0,  # Supporting technologies
    'tools': 0.7,  # Development tools
    'soft_skills': 0.5  # Non-technical skills
}

# Define which skills are core vs secondary
CORE_SKILLS = ['java', 'python', 'javascript', 'typescript', 'angular', 'react', 'vue', 'spring', 'springboot', 'django', 'flask']
TOOL_SKILLS = ['git', 'docker', 'jenkins', 'maven', 'gradle', 'webpack', 'npm', 'yarn']

def normalize_skill(skill):
    """Normalize skill names for consistent matching"""
    if not skill:
        return ""
    
    # Convert to lowercase and clean
    normalized = re.sub(r'[^a-z0-9\s.#+]+', ' ', skill.lower()).strip()
    
    # Handle common abbreviations and synonyms
    if normalized in SKILL_SYNONYMS:
        normalized = SKILL_SYNONYMS[normalized]
    
    # Remove extra spaces
    normalized = re.sub(r'\s+', ' ', normalized)
    
    return normalized

def calculate_similarity(skill1, skill2, threshold=0.8):
    """Calculate similarity between two skills using fuzzy matching"""
    if skill1 == skill2:
        return 1.0
    
    # Use SequenceMatcher for fuzzy matching
    similarity = SequenceMatcher(None, skill1, skill2).ratio()
    return similarity if similarity >= threshold else 0.0

def get_skill_weight(skill):
    """Get the importance weight for a skill"""
    skill = normalize_skill(skill)
    
    if skill in CORE_SKILLS:
        return SKILL_WEIGHTS['core_technologies']
    elif skill in TOOL_SKILLS:
        return SKILL_WEIGHTS['tools']
    else:
        return SKILL_WEIGHTS['secondary_technologies']

def expand_query(query):
    """Expand search query to include related skills"""
    query = normalize_skill(query)
    expanded = set()
    
    # Add original query terms
    query_terms = query.split()
    expanded.update(query_terms)
    
    # Check skill groups for related skills
    for group_name, categories in SKILL_GROUPS.items():
        if group_name in query or any(term in group_name for term in query_terms):
            for category, skills in categories.items():
                expanded.update([normalize_skill(s) for s in skills])
    
    # Check if any individual terms match skill categories
    for group_name, categories in SKILL_GROUPS.items():
        for category, skills in categories.items():
            for skill in skills:
                skill_norm = normalize_skill(skill)
                for term in query_terms:
                    if calculate_similarity(term, skill_norm, 0.7) > 0:
                        expanded.add(skill_norm)
    
    return list(expanded)

def calculate_advanced_match_score(requirements, candidate_skills, years_of_experience=0):
    """Calculate enhanced match percentage with weighted scoring and fuzzy matching"""
    required_skills = expand_query(requirements)
    candidate_skills_normalized = [normalize_skill(s) for s in candidate_skills if s]
    
    if not required_skills:
        return {
            'score': 0,
            'details': {
                'total_required': 0,
                'exact_matches': 0,
                'partial_matches': 0,
                'missing_skills': [],
                'matched_skills': [],
                'skill_breakdown': {}
            }
        }
    
    total_weight = 0
    matched_weight = 0
    exact_matches = 0
    partial_matches = 0
    matched_skills = []
    missing_skills = []
    skill_breakdown = {}
    
    for required_skill in required_skills:
        skill_weight = get_skill_weight(required_skill)
        total_weight += skill_weight
        
        best_match = 0
        best_candidate_skill = None
        
        # Check for exact and fuzzy matches
        for candidate_skill in candidate_skills_normalized:
            similarity = calculate_similarity(required_skill, candidate_skill)
            if similarity > best_match:
                best_match = similarity
                best_candidate_skill = candidate_skill
        
        if best_match >= 0.9:  # Exact or near-exact match
            matched_weight += skill_weight * best_match
            exact_matches += 1
            matched_skills.append({
                'required': required_skill,
                'candidate': best_candidate_skill,
                'similarity': best_match,
                'weight': skill_weight
            })
        elif best_match >= 0.7:  # Partial match
            matched_weight += skill_weight * best_match * 0.8  # Reduce weight for partial matches
            partial_matches += 1
            matched_skills.append({
                'required': required_skill,
                'candidate': best_candidate_skill,
                'similarity': best_match,
                'weight': skill_weight
            })
        else:
            missing_skills.append(required_skill)
        
        skill_breakdown[required_skill] = {
            'weight': skill_weight,
            'match_score': best_match,
            'status': 'exact' if best_match >= 0.9 else 'partial' if best_match >= 0.7 else 'missing'
        }
    
    # Calculate final score
    base_score = (matched_weight / total_weight * 100) if total_weight > 0 else 0
    
    # Apply experience-based adjustments
    experience_multipliers = {
        0: 0.85,   # 0 years - Fresh graduates, more lenient
        1: 0.9,    # 1 year - Entry level, slightly lenient
        2: 0.95,   # 2 years - Junior level
        3: 1.0,    # 3+ years - Standard scoring (mid-level)
        5: 1.05,   # 5+ years - Slightly higher expectations
        7: 1.1,    # 7+ years - Senior level, higher standards
        10: 1.15   # 10+ years - Very experienced, strictest standards
    }
    
    # Find the appropriate multiplier based on years of experience
    experience_multiplier = 1.0
    for years_threshold in sorted(experience_multipliers.keys(), reverse=True):
        if years_of_experience >= years_threshold:
            experience_multiplier = experience_multipliers[years_threshold]
            break
    
    final_score = base_score * experience_multiplier
    final_score = min(final_score, 100)  # Cap at 100%
    
    return {
        'score': round(final_score, 2),
        'details': {
            'total_required': len(required_skills),
            'exact_matches': exact_matches,
            'partial_matches': partial_matches,
            'missing_skills': missing_skills,
            'matched_skills': matched_skills,
            'skill_breakdown': skill_breakdown,
            'base_score': round(base_score, 2),
            'years_of_experience': years_of_experience,
            'experience_adjustment': experience_multiplier
        }
    }

@app.route('/match', methods=['POST'])
def match_candidates():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        requirements = data.get('requirements', '')
        candidates = data.get('candidates', [])
        include_details = data.get('include_details', False)
        
        if not requirements or not candidates:
            return jsonify({"error": "Missing requirements or candidates"}), 400
        
        results = []
        for candidate in candidates:
            if not isinstance(candidate, dict):
                continue
                
            skills = candidate.get('skills', [])
            if not isinstance(skills, list):
                skills = []
            
            # Extract years of experience from candidate data
            years_of_experience = candidate.get('experiencePeriod', 0)
            if isinstance(years_of_experience, str):
                # Extract number from string like "5 years" or "2-3 years"
                import re
                match = re.search(r'(\d+)', str(years_of_experience))
                years_of_experience = int(match.group(1)) if match else 0
            elif not isinstance(years_of_experience, (int, float)):
                years_of_experience = 0
            
            # Use advanced matching with years of experience
            match_result = calculate_advanced_match_score(requirements, skills, years_of_experience)
            
            candidate_result = {
                "id": candidate.get('id'),
                "name": f"{candidate.get('prenom', '')} {candidate.get('nom', '')}".strip(),
                "match_percentage": match_result['score'],
                "skills": skills,
                "years_of_experience": years_of_experience,
                "matched_skills": [ms['candidate'] for ms in match_result['details']['matched_skills']],
                "exact_matches": match_result['details']['exact_matches'],
                "partial_matches": match_result['details']['partial_matches'],
                "missing_skills": match_result['details']['missing_skills']
            }
            
            # Include detailed breakdown if requested
            if include_details:
                candidate_result["detailed_analysis"] = match_result['details']
            
            results.append(candidate_result)
        
        # Sort by match percentage (highest first)
        results.sort(key=lambda x: x['match_percentage'], reverse=True)
        
        # Calculate statistics
        scores = [r['match_percentage'] for r in results]
        stats = {
            "total_candidates": len(results),
            "average_match": round(sum(scores) / len(scores), 2) if scores else 0,
            "highest_match": max(scores) if scores else 0,
            "candidates_above_70": len([s for s in scores if s >= 70]),
            "candidates_above_50": len([s for s in scores if s >= 50])
        }
        
        return jsonify({
            "matches": results,
            "expanded_query": expand_query(requirements),
            "statistics": stats,
            "matching_criteria": {
                "exact_match_threshold": "≥90% similarity",
                "partial_match_threshold": "≥70% similarity", 
                "experience_based_scoring": "Adjusted based on years of experience"
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "matching_service", "version": "2.0"})

@app.route('/skills/analyze', methods=['POST'])
def analyze_skills():
    """Analyze and categorize skills"""
    try:
        data = request.get_json()
        skills = data.get('skills', [])
        
        if not skills:
            return jsonify({"error": "No skills provided"}), 400
        
        analysis = {
            "core_skills": [],
            "secondary_skills": [],
            "tools": [],
            "unknown_skills": []
        }
        
        for skill in skills:
            normalized_skill = normalize_skill(skill)
            weight = get_skill_weight(skill)
            
            category = {
                SKILL_WEIGHTS['core_technologies']: "core_skills",
                SKILL_WEIGHTS['secondary_technologies']: "secondary_skills", 
                SKILL_WEIGHTS['tools']: "tools"
            }.get(weight, "unknown_skills")
            
            analysis[category].append({
                "original": skill,
                "normalized": normalized_skill,
                "weight": weight
            })
        
        return jsonify(analysis)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)