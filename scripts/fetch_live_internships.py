import requests
import csv
import re
from bs4 import BeautifulSoup
import time
import random
from abc import ABC, abstractmethod

# --- Institutional Metadata (GDR Blueprinted & Verified) ---
# This acts as our "Verified VC & Alumni" institutional anchor.
INSTITUTIONAL_PORTFOLIOS = {
    "Peak XV / Sequoia": ["Merlin AI", "Pipeshift", "Arva AI", "Felafax", "Driver AI", "Atri Labs", "GoSats", "1.5 Degree"],
    "YC (S24/W24)": ["Syntra Health", "RowBoat Labs", "SureBright", "Vendra", "Mica", "Kairo Health", "SimCare AI", "Helium", "Petra Security", "Thunder Compute", "Maihem", "Basepilot", "Topo", "Terrakotta", "Outerport", "DreamRP", "Melty", "PathPilot"],
    "BITSian Founders": ["Bluelearn", "Flam App", "1.5 Degree", "Acc-Red", "BarcodeAI", "Fasal", "Siftly", "Postman", "Swiggy", "Groww"],
    "Accel / Matrix / Blume": ["Zeno", "Fasthir.AI", "InstaWeb Labs", "Meerahi VR", "ONYA", "Arctus Aerospace", "Riverline AI", "DataWollet", "Omny", "Staer", "Cheer Games", "Prism Layer", "Ridge AI", "Aiko", "Hio"]
}

# Flatten for lookup
VERIFIED_COMPANIES = {company.lower(): category for category, companies in INSTITUTIONAL_PORTFOLIOS.items() for company in companies}

# --- Base Interface ---
class BaseScout(ABC):
    def __init__(self, name):
        self.name = name
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }

    @abstractmethod
    def scout(self) -> list:
        pass

class InternshalaScout(BaseScout):
    def __init__(self):
        super().__init__("Internshala")
        self.base_url = 'https://internshala.com'

    def scout(self, category="first-year-internships") -> list:
        print(f"Scouting {self.name} [{category}]...")
        jobs = []
        # Modern professional crawlers lean on shallow but frequent scrapes
        for page in range(1, 4):
            url = f"{self.base_url}/internships/{category}/page-{page}/"
            try:
                r = requests.get(url, headers=self.headers, timeout=10)
                soup = BeautifulSoup(r.text, 'html.parser')
                meta_divs = soup.find_all('div', class_=re.compile('.*internship_meta.*'))
                for div in meta_divs:
                    title_elem = div.find('a', class_='job-title-href')
                    company_elem = div.find('p', class_='company-name')
                    if not title_elem or not company_elem: continue
                    
                    loc_span = div.find('div', class_='locations')
                    location = re.sub(r'\s+', ' ', loc_span.text.strip()) if loc_span else 'India'
                    
                    stipend_span = div.find('span', class_='stipend')
                    stipend = stipend_span.text.strip() if stipend_span else 'TBD'
                    
                    details = 'Apply to learn more.'
                    about_div = div.find('div', class_='about_job')
                    if about_div and about_div.find('div', class_='text'):
                        details = about_div.find('div', class_='text').text.strip()

                    jobs.append({
                        "company": company_elem.text.strip(),
                        "title": title_elem.text.strip(),
                        "location": location,
                        "stipend": stipend,
                        "duration": "TBD",
                        "requirements": details[:500], # Pass more context for semantic ranking
                        "apply_link": self.base_url + title_elem.get('href', ''),
                        "source": self.name
                    })
                time.sleep(1)
            except Exception as e:
                print(f"Error in {self.name}: {e}")
                break
        return jobs

class LeadEngine:
    def __init__(self):
        self.scouts = [InternshalaScout()]
        self.results = []

    def get_institutional_mock(self):
        """Mocked high-signal roles based on institutional membership."""
        # In a generic production system, this would be an API call to Crunchbase.
        # Here we prioritize BITSian-founded and YC startups from our verified map.
        return [
            {
                "company": "Siftly",
                "title": "Software Engineering Intern (Founding Stage)",
                "location": "Remote",
                "stipend": "₹20,000",
                "duration": "3-6 Months",
                "requirements": "YC W24 backed. BITS alumni founded. Looking for zero-to-one builders for recruitment AI.",
                "apply_link": "https://www.siftly.io/",
                "source": "Institutional"
            },
            {
                "company": "Flam",
                "title": "AR Product Intern",
                "location": "Bengaluru",
                "stipend": "₹30,000",
                "duration": "4 Months",
                "requirements": "YC S21. Building the future of AR consumer social. High bias for action required.",
                "apply_link": "https://flam.app/",
                "source": "Institutional"
            }
        ]

    def process(self):
        self.results = self.get_institutional_mock()
        for s in self.scouts:
            self.results.extend(s.scout("first-year-internships"))
            self.results.extend(s.scout("internship-in-startup"))
            
        # Deduplicate and Enrich with Institutional Metadata
        unique_leads = {}
        for j in self.results:
            key = f"{j['company']}-{j['title']}".lower()
            if key not in unique_leads:
                # Institutional Verification Check (Sub-string matching for flexibility)
                company_name = j['company'].lower()
                validation = "Community Feed"
                verified = "No"
                
                for v_name, category in VERIFIED_COMPANIES.items():
                    if v_name in company_name or company_name in v_name:
                        validation = category
                        verified = "Yes"
                        break
                
                j['institutional_validation'] = validation
                j['is_verified'] = verified
                unique_leads[key] = j

        
        return list(unique_leads.values())

    def save(self, data):
        if not data: return
        keys = data[0].keys()
        path = "frontend/public/internships.csv"
        with open(path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=keys)
            writer.writeheader()
            writer.writerows(data)
        print(f"Institutional Engine deployed {len(data)} leads to {path}")

if __name__ == "__main__":
    engine = LeadEngine()
    leads = engine.process()
    engine.save(leads)
