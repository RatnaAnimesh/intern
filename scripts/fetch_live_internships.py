import requests
import csv
import re
from bs4 import BeautifulSoup
import time
import random

# --- BITS Specific Branch Dictionary ---
BRANCH_KEYWORDS = {
    'CS': ['software', 'computer', 'developer', 'frontend', 'backend', 'fullstack', 'python', 'java', 'web', 'app', 'ml', 'ai', 'data science', 'coding', 'cybersecurity', 'devops', 'cloud'],
    'ECE/EEE/ENI': ['electrical', 'electronics', 'circuit', 'vlsi', 'embedded', 'robotics', 'signal', 'microcontroller', 'fpga', 'verilog', 'vhdl', 'arduino'],
    'MECH': ['mechanical', 'automotive', 'hvac', 'thermal', 'fluid', 'robotics', 'solidworks', 'cad', 'cam', 'manufacturing'],
    'MANUFACTURING': ['manufacturing', 'industrial', 'production', 'supply chain', 'logistics', 'operations', 'quality control'],
    'CIVIL': ['civil', 'construction', 'structural', 'architecture', 'surveying', 'geotechnical'],
    'CHEM': ['chemical', 'process', 'petroleum', 'mass transfer', 'heat transfer', 'catalyst'],
    'Finance/Economics': ['finance', 'investment', 'trading', 'banking', 'economics', 'fintech', 'quantitative', 'analyst', 'equity', 'portfolio'],
    'Pure Research': ['research', 'laboratory', 'physics', 'mathematics', 'biological', 'quantum', 'scientist', 'bio', 'chem research', 'genetics'],
    'General / Tech': [] # Default
}

# --- Skill Mapping ---
SKILL_KEYWORDS = {
    'Web': ['react', 'next.js', 'html', 'css', 'javascript', 'typescript', 'angular', 'vue', 'node'],
    'Mobile': ['flutter', 'react native', 'android', 'ios', 'swift', 'kotlin'],
    'AI/ML': ['machine learning', 'pytorch', 'tensorflow', 'scikit', 'opencv', 'nlp', 'vision'],
    'Data': ['sql', 'excel', 'pandas', 'tableau', 'powerbi', 'analytics', 'statistics'],
    'Backend': ['django', 'flask', 'express', 'postgresql', 'mongodb', 'redis', 'aws', 'docker'],
    'Finance': ['excel', 'portfolio', 'trading', 'investment', 'derivatives', 'stock'],
    'Hardware': ['arduino', 'raspberry pi', 'pcb', 'verilog', 'embedded', 'iot'],
}

def infer_branch(title, requirements):
    t = (title + ' ' + requirements).lower()
    for branch, keywords in BRANCH_KEYWORDS.items():
        if any(k in t for k in keywords):
            return branch
    return 'General / Tech'

def infer_skills(title, requirements):
    t = (title + ' ' + requirements).lower()
    skills = []
    for skill_name, keywords in SKILL_KEYWORDS.items():
        if any(k in t for k in keywords):
            skills.append(skill_name)
    return ', '.join(skills) if skills else 'General'

def calculate_viability_score(title, company, requirements):
    """
    Calculates a score (0-10) for 1st year viability.
    Boosts startups and explicit '1st year' mentions.
    """
    score = 5 # Baseline
    t = (title + ' ' + requirements).lower()
    
    # Positive signals
    if any(x in t for x in ['1st year', 'first year', 'freshers', 'no experience', 'stipend provided']): score += 3
    if any(x in t for x in ['college student', 'sophomore']): score += 1
    
    # Startup signal (heuristic: shorter names often mean startups or pure tech firms)
    if len(company.split()) <= 2: score += 1
    
    # Negative signals
    if any(x in t for x in ['final year', '3rd year', 'graduated', '4+ years', 'experience required']): score -= 4
    if any(x in t for x in ['senior', 'lead', 'manager']): score -= 5
    
    return max(1, min(10, score))

def infer_modality(location_str):
    loc = location_str.lower()
    if 'hybrid' in loc: return 'Hybrid'
    if any(k in loc for k in ['work from home', 'remote', 'online']): return 'Remote'
    return 'In-Person'

def get_curated_programs():
    """Returns high-quality, known BITS-friendly programs."""
    return [
        {
            "company": "Google India",
            "title": "STEP Internship (Software Engineering)",
            "location": "Bengaluru/Hyderabad",
            "stipend": "₹1,00,000+",
            "duration": "12 Weeks",
            "requirements": "1st/2nd Year B.Tech students from marginalized backgrounds or women in tech.",
            "apply_link": "https://careers.google.com/students/",
            "branch": "CS",
            "modality": "In-Person",
            "is_first_year": "Priority: 1st Year",
            "skills": "Web, Backend",
            "viability_score": 9
        },
        {
            "company": "Microsoft",
            "title": "Microsoft Engage",
            "location": "Remote / Bengaluru",
            "stipend": "Mentorship + Swags",
            "duration": "4 Weeks",
            "requirements": "Engineering students from all branches entering their 2nd year (target 1st years).",
            "apply_link": "https://careers.microsoft.com/students/",
            "branch": "General / Tech",
            "modality": "Hybrid",
            "is_first_year": "Priority: 1st Year",
            "skills": "Web, AI/ML, Mobile",
            "viability_score": 10
        },
        {
            "company": "Amazon",
            "title": "Amazon Future Engineer Scholarship + Intern",
            "location": "Remote",
            "stipend": "₹40,000+",
            "duration": "8 Weeks",
            "requirements": "Woman students in 1st year of B.Tech/BE in CS and related branches.",
            "apply_link": "https://www.amazonfutureengineer.in/",
            "branch": "CS",
            "modality": "Remote",
            "is_first_year": "Priority: 1st Year",
            "skills": "Data, Web",
            "viability_score": 9
        },
        {
            "company": "Fasal (Agri-Tech Startup)",
            "title": "Frontend Development Intern",
            "location": "Bengaluru",
            "stipend": "₹20,000",
            "duration": "3-6 Months",
            "requirements": "Strong fundamentals in HTML/CSS/JS. Open to first-year enthusiasts with a portfolio.",
            "apply_link": "https://fasal.co/careers.html",
            "branch": "CS",
            "modality": "In-Person",
            "is_first_year": "Priority: 1st Year",
            "skills": "Web",
            "viability_score": 8
        }
    ]

def scrape_internshala(target_count=100, category="first-year-internships"):
    base_url = 'https://internshala.com'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    jobs = []
    page = 1
    max_pages = 5
    
    while len(jobs) < target_count and page <= max_pages:
        url = f"{base_url}/internships/{category}/page-{page}/"
        try:
            r = requests.get(url, headers=headers, timeout=10)
            r.raise_for_status()
            soup = BeautifulSoup(r.text, 'html.parser')
            meta_divs = soup.find_all('div', class_=re.compile('.*internship_meta.*'))
            
            for div in meta_divs:
                if len(jobs) >= target_count: break
                
                title_elem = div.find('a', class_='job-title-href')
                company_elem = div.find('p', class_='company-name')
                
                if not title_elem or not company_elem: continue
                    
                title = title_elem.text.strip()
                company = company_elem.text.strip()
                apply_link = base_url + title_elem.get('href', '')
                
                loc_span = div.find('div', class_='locations')
                location_text = re.sub(r'\s+', ' ', loc_span.text.strip()) if loc_span else 'India'
                
                stipend = 'TBD'
                stipend_span = div.find('span', class_='stipend')
                if stipend_span: stipend = stipend_span.text.strip()
                
                duration = 'TBD'
                duration_icon = div.find('i', class_='ic-16-calendar')
                if duration_icon and duration_icon.find_next_sibling('span'):
                    duration = duration_icon.find_next_sibling('span').text.strip()
                
                requirements = 'Apply to learn more.'
                about_div = div.find('div', class_='about_job')
                if about_div and about_div.find('div', class_='text'):
                    requirements = about_div.find('div', class_='text').text.strip()
                
                branch = infer_branch(title, requirements)
                skills = infer_skills(title, requirements)
                viability_score = calculate_viability_score(title, company, requirements)
                
                is_first_year = 'Standard Role'
                if viability_score >= 7 or any(x in requirements.lower() for x in ['1st year', 'first year']):
                    is_first_year = 'Priority: 1st Year'

                jobs.append({
                    "company": company,
                    "title": title,
                    "location": location_text,
                    "stipend": stipend,
                    "duration": duration,
                    "requirements": requirements[:200] + '...',
                    "apply_link": apply_link,
                    "branch": branch,
                    "modality": infer_modality(location_text),
                    "is_first_year": is_first_year,
                    "skills": skills,
                    "viability_score": viability_score
                })
            
            page += 1
            time.sleep(random.uniform(1.0, 2.5))
        except Exception as e:
            print(f"Error on {category} page {page}: {e}")
            break
            
    return jobs

def synthesize_and_save():
    print("Initiating Multi-Source Scrape (Startup Focused)...")
    
    # Source A: Curated
    final_jobs = get_curated_programs()
    
    # Source B: Internshala (1st Year Category)
    print("Scraping Internshala (1st Year Specific)...")
    final_jobs.extend(scrape_internshala(target_count=100))
    
    # Source C: Internshala (Startup Category)
    print("Scraping Internshala (Startups)...")
    final_jobs.extend(scrape_internshala(target_count=50, category="internship-in-startup"))
    
    # Deduplicate by Title + Company
    seen = set()
    deduped = []
    for j in final_jobs:
        key = f"{j['company']}-{j['title']}".lower()
        if key not in seen:
            seen.add(key)
            deduped.append(j)
    
    # Final Sort: Viability Score and 1st Year Priority
    deduped.sort(key=lambda x: (x['is_first_year'] == 'Priority: 1st Year', x['viability_score']), reverse=True)

    csv_file = "frontend/public/internships.csv"
    keys = deduped[0].keys()
    
    with open(csv_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        writer.writerows(deduped)
        
    print(f"Successfully deployed {len(deduped)} roles to {csv_file}")

if __name__ == "__main__":
    synthesize_and_save()
