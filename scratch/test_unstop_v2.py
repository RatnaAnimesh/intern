import requests
from bs4 import BeautifulSoup

url = "https://unstop.com/internships"
# More comprehensive headers
headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
}

try:
    session = requests.Session()
    session.headers.update(headers)
    r = session.get(url, timeout=15)
    print(f"Status: {r.status_code}")
    if "stipend" in r.text.lower() or "internship" in r.text.lower():
        print("Success! Found keywords in raw HTML.")
        # Try to find a role title
        soup = BeautifulSoup(r.text, 'html.parser')
        titles = soup.find_all(['h2', 'h3'])
        for t in titles[:3]:
            print(f"Sample Title: {t.text.strip()}")
    else:
        print("Still likely dynamic or blocked.")
        print(f"Content preview: {r.text[:500]}")
except Exception as e:
    print(f"Error: {e}")
