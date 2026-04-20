"""
First-Year Internship Engine for BITS Pilani Students
=====================================================

Philosophy: A 1st-year BITS student doesn't need 1000 garbage roles.
They need 30-50 high-signal roles that will actually build their CV.

Sources:
  1. Internshala TECH categories ONLY (no generic "first-year" garbage)
  2. Curated structured programs (Google STEP, Microsoft Explore, etc.)
  3. Research programs at Indian institutions (SURGE, SPARK, SRIP)

Quality Filters:
  - BLOCK: Sales, telecalling, HR, recruitment, insurance, NGO fundraising
  - BLOCK: Stipend < ₹5,000/month (no ₹400/week charity drives)
  - BLOCK: Company names that are clearly individuals or random LLPs
  - ALLOW: Software, data, ML, design, product, research roles ONLY
"""

import requests
import csv
import re
import os
import time
import random
from bs4 import BeautifulSoup


# ============================================================================
# CONFIGURATION
# ============================================================================

# Only scrape TECH-SPECIFIC categories. Never scrape generic "first-year-internships".
INTERNSHALA_TECH_SLUGS = [
    "software-development-internship",
    "web-development-internship",
    "python-django-development-internship",
    "full-stack-development-internship",
    "mobile-app-development-internship",
    "data-science-internship",
    "machine-learning-internship",
    "artificial-intelligence-ai-internship",
]

# Titles containing ANY of these terms get immediately rejected.
BLOCKED_TITLE_KEYWORDS = [
    "sales", "telecall", "tele call", "business development", "hr ",
    "human resource", "recruitment", "customer service", "customer support",
    "insurance", "cold call", "fundrais", "charity", "social work",
    "campus ambassador", "event executive", "hotel management",
    "purchase order", "retail", "tele sales", "inside sales",
    "client acquisition", "demat", "stock market",
    "b. pharmacy", "pharmacy", "company secretary",
]

# Company names containing ANY of these terms get rejected.
BLOCKED_COMPANY_KEYWORDS = [
    "insurance", "foundation", "ngo", "trust", "welfare",
    "angel one", "she can", "pawzz", "odisha development",
    "salon", "haldiram", "naturals",
]

# Minimum stipend in INR. Anything below this is rejected.
MIN_STIPEND_INR = 5000

# Pages to scrape per category. Keep low to be polite + fast.
PAGES_PER_CATEGORY = 5

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
                  'AppleWebKit/537.36 (KHTML, like Gecko) '
                  'Chrome/125.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml',
    'Accept-Language': 'en-US,en;q=0.9',
}


# ============================================================================
# CURATED HIGH-SIGNAL PROGRAMS
# These are verified, real programs that a 1st-year BITS student should know.
# Updated manually. Not scraped.
# ============================================================================

CURATED_PROGRAMS = [
    {
        "company": "Google",
        "title": "STEP Intern (Student Training in Engineering Program)",
        "location": "Bengaluru / Hyderabad",
        "stipend": "Highly Competitive",
        "duration": "12 Weeks (Summer)",
        "requirements": "For 1st & 2nd year undergrads in CS/related fields. Build real products with Google engineers. Applications typically open Nov-Dec.",
        "apply_link": "https://careers.google.com/jobs/results/?q=STEP&location=India",
        "source": "Structured Program",
    },
    {
        "company": "Microsoft",
        "title": "Explore Program (Internship)",
        "location": "Hyderabad / Bengaluru",
        "stipend": "Highly Competitive",
        "duration": "8 Weeks (Summer)",
        "requirements": "For 1st & 2nd year undergrads. Rotational exposure: PM, SDE, and Design. Focus on learning, not prior experience.",
        "apply_link": "https://jobs.careers.microsoft.com/global/en/search?q=explore&l=India",
        "source": "Structured Program",
    },
    {
        "company": "Amazon",
        "title": "Future Engineer Scholarship + Internship",
        "location": "Remote / Bengaluru",
        "stipend": "₹40,000/month + Scholarship",
        "duration": "8-10 Weeks",
        "requirements": "Open to 1st year undergrads from underrepresented backgrounds. Includes mentorship, laptop, and a paid internship.",
        "apply_link": "https://www.amazonfutureengineer.in/",
        "source": "Structured Program",
    },
    {
        "company": "Atlassian",
        "title": "Women in Tech Intern",
        "location": "Bengaluru",
        "stipend": "₹80,000/month",
        "duration": "10 Weeks",
        "requirements": "For 1st/2nd year women in engineering. Focus on building real features in Jira/Confluence. Strong problem-solving skills needed.",
        "apply_link": "https://www.atlassian.com/company/careers/students",
        "source": "Structured Program",
    },
    {
        "company": "Goldman Sachs",
        "title": "Engineering Virtual Program",
        "location": "Virtual / Bengaluru",
        "stipend": "Competitive",
        "duration": "Summer",
        "requirements": "Open to pre-final and sophomore students. Focus on financial technology and engineering fundamentals.",
        "apply_link": "https://www.goldmansachs.com/careers/students/programs/india/",
        "source": "Structured Program",
    },
    {
        "company": "IIT Kanpur (SURGE)",
        "title": "Summer Undergraduate Research (SURGE)",
        "location": "Kanpur (On-campus)",
        "stipend": "₹5,000-10,000/month + Accommodation",
        "duration": "8 Weeks (May-July)",
        "requirements": "Open to all undergrads. Work with IIT-K faculty on real research. Applications open Jan-Mar. Strong academics preferred.",
        "apply_link": "https://surge.iitk.ac.in/",
        "source": "Research Program",
    },
    {
        "company": "IIT Roorkee (SPARK)",
        "title": "Summer Research Internship (SPARK)",
        "location": "Roorkee (On-campus)",
        "stipend": "Stipend + Accommodation",
        "duration": "8 Weeks (Summer)",
        "requirements": "Open to 1st-3rd year undergrads from any college. Research exposure in CS, EE, Mechanical, and more.",
        "apply_link": "https://spark.iitr.ac.in/",
        "source": "Research Program",
    },
    {
        "company": "IIT Gandhinagar (SRIP)",
        "title": "Summer Research Internship Programme",
        "location": "Gandhinagar (On-campus)",
        "stipend": "₹5,000/month + Accommodation",
        "duration": "8 Weeks (May-July)",
        "requirements": "For undergrads and recent graduates. Work directly with IIT-GN faculty. Broad range of departments.",
        "apply_link": "https://srip.iitgn.ac.in/",
        "source": "Research Program",
    },
    {
        "company": "IISc Bangalore",
        "title": "Summer Fellowship / IASc-INSA-NASI Program",
        "location": "Bengaluru (On-campus)",
        "stipend": "₹5,000/month + Travel",
        "duration": "8 Weeks (Summer)",
        "requirements": "For science/engineering undergrads with strong CGPA. Extremely competitive. Apply through Indian Academy of Sciences portal.",
        "apply_link": "https://web-japps.ias.ac.in:8443/fellowship2024/",
        "source": "Research Program",
    },
    {
        "company": "Google Summer of Code (GSoC)",
        "title": "Open Source Contributor",
        "location": "Remote (Worldwide)",
        "stipend": "$1,500-$6,600 (based on country/project size)",
        "duration": "10-22 Weeks (Summer)",
        "requirements": "Open to all. Contribute to real open-source projects mentored by established orgs. No prior OSS experience needed — just willingness to learn.",
        "apply_link": "https://summerofcode.withgoogle.com/",
        "source": "Open Source",
    },
    {
        "company": "MLH Fellowship",
        "title": "MLH Fellowship (Open Source / SWE Track)",
        "location": "Remote (Worldwide)",
        "stipend": "$5,000 (for 12 weeks)",
        "duration": "12 Weeks",
        "requirements": "For students and recent grads. Build real software with an engineering pod. Beginner-friendly tracks available.",
        "apply_link": "https://fellowship.mlh.io/",
        "source": "Open Source",
    },
    {
        "company": "Linux Foundation (LFX)",
        "title": "LFX Mentorship Program",
        "location": "Remote (Worldwide)",
        "stipend": "$3,000-$6,600",
        "duration": "12 Weeks",
        "requirements": "Contribute to CNCF, Kubernetes, Hyperledger, and other Linux Foundation projects. Great for building a public engineering portfolio.",
        "apply_link": "https://mentorship.lfx.linuxfoundation.org/",
        "source": "Open Source",
    },
]


# ============================================================================
# QUALITY FILTERS
# ============================================================================

def parse_stipend_value(stipend_str):
    """Extract the lower-bound numeric stipend value from messy strings like '₹ 7,500 - 10,000 /month'."""
    if not stipend_str:
        return 0
    cleaned = stipend_str.replace('₹', '').replace(',', '').strip()
    # Match first number
    match = re.search(r'(\d+)', cleaned)
    if match:
        val = int(match.group(1))
        # If it says "lump sum" or "/week", it's likely very low
        if 'lump sum' in stipend_str.lower() or '/week' in stipend_str.lower():
            return val // 4  # rough monthly estimate
        return val
    return 0


def is_blocked_title(title):
    """Reject roles that are clearly not tech/design/product/research."""
    title_lower = title.lower()
    return any(blocked in title_lower for blocked in BLOCKED_TITLE_KEYWORDS)


def is_blocked_company(company):
    """Reject companies that consistently post low-quality roles."""
    company_lower = company.lower()
    return any(blocked in company_lower for blocked in BLOCKED_COMPANY_KEYWORDS)


def is_quality_role(job):
    """
    The main quality gate. Returns True only if the role passes ALL checks.
    This is intentionally aggressive — we'd rather show 30 great roles than 300 garbage ones.
    """
    title = job.get('title', '')
    company = job.get('company', '')
    stipend = job.get('stipend', '')

    # Gate 1: Block garbage titles
    if is_blocked_title(title):
        return False

    # Gate 2: Block garbage companies
    if is_blocked_company(company):
        return False

    # Gate 3: Block unpaid / near-unpaid roles
    stipend_val = parse_stipend_value(stipend)
    if 'unpaid' in stipend.lower():
        return False
    if stipend_val > 0 and stipend_val < MIN_STIPEND_INR:
        return False

    # Gate 4: Block roles from individuals (company name looks like a person's name)
    # Heuristic: if company is 2-3 words, all capitalized, and short — likely a person
    words = company.strip().split()
    if len(words) == 2 and all(w[0].isupper() and len(w) < 12 for w in words if w):
        # Could be "Himanshu Agarwal" — check if it looks like a person name
        # Allow if it has common company suffixes
        suffixes = ['ltd', 'pvt', 'inc', 'llp', 'corp', 'tech', 'labs', 'ai', 'io', 'studio']
        if not any(s in company.lower() for s in suffixes):
            return False

    return True


# ============================================================================
# SCRAPER
# ============================================================================

def scrape_internshala():
    """Scrape ONLY tech-specific Internshala categories with aggressive quality filtering."""
    base_url = 'https://internshala.com'
    all_jobs = []

    for slug in INTERNSHALA_TECH_SLUGS:
        print(f"  Scouting: {slug}...")
        for page in range(1, PAGES_PER_CATEGORY + 1):
            url = f"{base_url}/internships/{slug}/page-{page}/"
            try:
                r = requests.get(url, headers=HEADERS, timeout=12)
                if r.status_code != 200:
                    print(f"    Page {page}: HTTP {r.status_code}, skipping")
                    break

                soup = BeautifulSoup(r.text, 'html.parser')
                meta_divs = soup.find_all('div', class_=re.compile(r'.*internship_meta.*'))

                if not meta_divs:
                    break

                for div in meta_divs:
                    title_elem = div.find('a', class_='job-title-href')
                    company_elem = div.find('p', class_='company-name')
                    if not title_elem or not company_elem:
                        continue

                    loc_span = div.find('div', class_='locations')
                    location = re.sub(r'\s+', ' ', loc_span.text.strip()) if loc_span else 'India'

                    stipend_span = div.find('span', class_='stipend')
                    stipend = stipend_span.text.strip() if stipend_span else 'TBD'

                    duration_span = div.find('span', class_='duration')
                    duration = duration_span.text.strip() if duration_span else 'TBD'

                    details = ''
                    about_div = div.find('div', class_='about_job')
                    if about_div and about_div.find('div', class_='text'):
                        details = about_div.find('div', class_='text').text.strip()

                    job = {
                        "company": company_elem.text.strip(),
                        "title": title_elem.text.strip(),
                        "location": location,
                        "stipend": stipend,
                        "duration": duration,
                        "requirements": details[:500],
                        "apply_link": base_url + title_elem.get('href', ''),
                        "source": "Startup",
                    }

                    # QUALITY GATE — reject before adding
                    if is_quality_role(job):
                        all_jobs.append(job)

                # Be polite
                time.sleep(random.uniform(1.5, 3.0))

            except Exception as e:
                print(f"    Error on page {page}: {e}")
                break

    return all_jobs


# ============================================================================
# MAIN ENGINE
# ============================================================================

def run():
    print("=" * 60)
    print("First-Year Internship Engine — BITS Pilani")
    print("=" * 60)

    # Source 1: Curated programs (always included, always high quality)
    print(f"\n[1/2] Loading {len(CURATED_PROGRAMS)} curated programs...")
    all_leads = list(CURATED_PROGRAMS)

    # Source 2: Internshala tech roles (scraped + filtered)
    print(f"\n[2/2] Scraping Internshala tech categories ({len(INTERNSHALA_TECH_SLUGS)} categories, {PAGES_PER_CATEGORY} pages each)...")
    scraped = scrape_internshala()
    print(f"  Scraped & filtered: {len(scraped)} quality roles")
    all_leads.extend(scraped)

    # Deduplicate by company+title
    seen = set()
    unique_leads = []
    for job in all_leads:
        key = f"{job['company'].lower().strip()}-{job['title'].lower().strip()}"
        if key not in seen:
            seen.add(key)
            unique_leads.append(job)

    print(f"\nTotal unique leads: {len(unique_leads)}")

    # Save
    output_path = "site/internships.csv"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    fieldnames = ["company", "title", "location", "stipend", "duration", "requirements", "apply_link", "source"]
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for lead in unique_leads:
            # Only write the fields we need — no garbage columns
            row = {k: lead.get(k, '') for k in fieldnames}
            writer.writerow(row)

    print(f"Deployed {len(unique_leads)} quality leads → {output_path}")
    print("=" * 60)


if __name__ == "__main__":
    run()
