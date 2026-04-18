import requests
import csv
import re
from bs4 import BeautifulSoup
import time

def infer_branch(title, requirements):
    """
    Categorizes the internship into a BITS branch based on title and requirements.
    """
    t = title.lower()
    r = requirements.lower()
    
    # Pure Research
    if any(k in t or k in r for k in ['research', 'laboratory', 'physics', 'mathematics', 'biological', 'quantum', 'scientist', 'bio', 'chem research']):
        return 'Pure Research'
    
    # CS
    if any(k in t or k in r for k in ['software', 'computer', 'developer', 'frontend', 'backend', 'fullstack', 'python', 'java', 'web', 'app', 'ml', 'ai', 'data science', 'coding']):
        return 'CS'
    
    # ECE/EEE/ENI
    if any(k in t or k in r for k in ['electrical', 'electronics', 'circuit', 'vlsi', 'embedded', 'robotics', 'signal']):
        return 'ECE/EEE/ENI'
    
    # MECH
    if any(k in t or k in r for k in ['mechanical', 'automotive', 'hvac', 'thermal']):
        return 'MECH'
    
    # MANUFACTURING
    if any(k in t or k in r for k in ['manufacturing', 'industrial', 'cad', 'cam', 'production', 'solidworks']):
        return 'MANUFACTURING'
    
    # CIVIL
    if any(k in t or k in r for k in ['civil', 'construction', 'structural', 'architecture']):
        return 'CIVIL'
    
    # CHEM
    if any(k in t or k in r for k in ['chemical engineering', 'process engineering']):
        return 'CHEM'
    
    return 'General / Tech'

def infer_modality(location_str):
    """
    Infers modality (In-Person, Remote, Hybrid) from location string.
    """
    loc = location_str.lower()
    if 'hybrid' in loc:
        return 'Hybrid'
    if any(k in loc for k in ['work from home', 'remote', 'online']):
        return 'Remote'
    return 'In-Person'

def scrape_internshala(target_count=120):
    base_url = 'https://internshala.com'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    }
    
    jobs = []
    page = 1
    
    while len(jobs) < target_count and page <= 10:
        # Targeting Internshala's 1st-year internship category specifically
        url = f"{base_url}/internships/first-year-internships/page-{page}/"
        try:
            r = requests.get(url, headers=headers, timeout=10)
            r.raise_for_status()
            soup = BeautifulSoup(r.text, 'html.parser')
            
            meta_divs = soup.find_all('div', class_=re.compile('.*internship_meta.*'))
            
            for div in meta_divs:
                if len(jobs) >= target_count:
                    break
                    
                title_elem = div.find('a', class_='job-title-href')
                company_elem = div.find('p', class_='company-name')
                
                if not title_elem or not company_elem:
                    continue
                    
                title = title_elem.text.strip()
                company = company_elem.text.strip()
                apply_link = base_url + title_elem.get('href', '')
                
                loc_span = div.find('div', class_='locations')
                location_text = loc_span.text.strip() if loc_span else 'India (Remote)'
                location_text = re.sub(r'\s+', ' ', location_text)
                
                stipend = 'Unpaid/Variable'
                stipend_span = div.find('span', class_='stipend')
                if stipend_span:
                    stipend = stipend_span.text.strip()
                
                duration = 'TBD'
                duration_icon = div.find('i', class_='ic-16-calendar')
                if duration_icon and duration_icon.find_next_sibling('span'):
                    duration = duration_icon.find_next_sibling('span').text.strip()
                
                requirements = 'Apply to learn more details.'
                about_div = div.find('div', class_='about_job')
                if about_div and about_div.find('div', class_='text'):
                    requirements = about_div.find('div', class_='text').text.strip()
                
                branch = infer_branch(title, requirements)
                modality = infer_modality(location_text)
                
                # Double-check eligibility in text
                is_first_year = 'First Year Friendly'
                if any(x in requirements.lower() or x in title.lower() for x in ['first year', '1st year', '2028', '2029', 'fresher']):
                    is_first_year = 'Priority: 1st Year'

                jobs.append({
                    "company": company,
                    "title": title,
                    "location": location_text,
                    "stipend": stipend,
                    "duration": duration,
                    "requirements": requirements[:200] + '...' if len(requirements) > 200 else requirements,
                    "apply_link": apply_link,
                    "branch": branch,
                    "modality": modality,
                    "is_first_year": is_first_year
                })
                
            page += 1
            time.sleep(1)
            
        except Exception as e:
            print(f"Error on page {page}: {e}")
            break
            
    return jobs

def synthesize_and_save():
    print("Initiating BITS-specific branch & modality categorization scrape...")
    unique_jobs = scrape_internshala(target_count=120)
    
    if len(unique_jobs) == 0:
        print("Failed to scrape jobs.")
        return

    csv_file = "/Users/ashishmishra/interrns/frontend/public/internships.csv"
    keys = unique_jobs[0].keys()
    
    for j in unique_jobs:
        for k in j:
            if isinstance(j[k], str):
                j[k] = j[k].replace('\n', ' ').replace('\r', '').replace('"', "'")
    
    with open(csv_file, 'w', newline='', encoding='utf-8') as f:
        dict_writer = csv.DictWriter(f, fieldnames=keys)
        dict_writer.writeheader()
        dict_writer.writerows(unique_jobs)
        
    print(f"Successfully deployed {len(unique_jobs)} categorized internships into {csv_file}")

if __name__ == "__main__":
    synthesize_and_save()
