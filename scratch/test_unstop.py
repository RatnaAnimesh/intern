import requests
from bs4 import BeautifulSoup

url = "https://unstop.com/internships"
headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
}

try:
    r = requests.get(url, headers=headers, timeout=10)
    print(f"Status: {r.status_code}")
    soup = BeautifulSoup(r.text, 'html.parser')
    # Look for common internship containers or titles
    # Unstop often uses <h3> or specific classes for titles
    titles = soup.find_all(['h2', 'h3'])
    print(f"Found {len(titles)} potential titles.")
    for t in titles[:5]:
        print(f"Title: {t.text.strip()}")
    
    # Check for text like "stipend" or "internship"
    if "stipend" in r.text.lower():
        print("Found 'stipend' in raw HTML.")
    else:
        print("'stipend' NOT found in raw HTML. Likely dynamic.")
except Exception as e:
    print(f"Error: {e}")
