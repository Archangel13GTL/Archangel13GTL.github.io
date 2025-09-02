import json
import re
from difflib import SequenceMatcher
from pathlib import Path
import requests
from bs4 import BeautifulSoup, Comment

REPO_FILE = Path('data/repos.json')
GITHUB_USER = 'Archangel13GTL'
MATCH_THRESHOLD = 0.8


def load_repos():
    with REPO_FILE.open() as f:
        return json.load(f)


def normalize(s: str) -> str:
    return re.sub(r'[^a-z0-9]+', ' ', s.lower()).strip()


def best_scores(title: str, repo_names: list[str]):
    nt = normalize(title)
    scores = []
    for repo in repo_names:
        repo_norm = normalize(repo.replace('-', ' '))
        ratio = SequenceMatcher(None, nt, repo_norm).ratio()
        scores.append((ratio, repo))
    scores.sort(reverse=True)
    return scores[:2]


def main():
    repo_names = load_repos()
    index_path = Path('index.html')
    soup = BeautifulSoup(index_path.read_text(encoding='utf-8'), 'html.parser')
    section = soup.find('section', id='projects')
    if not section:
        return
    for card in section.select('.project-card'):
        h3 = card.find('h3')
        if not h3:
            continue
        link = h3.find('a')
        title = h3.get_text(strip=True)
        if not link or not link.get('href'):
            match, scores = None, best_scores(title, repo_names)
            if scores and scores[0][0] >= 0.8:
                match = scores[0][1]
            if match:
                h3.string = ''
                a = soup.new_tag('a', href=f'https://github.com/{GITHUB_USER}/{match}')
                a.string = title
                h3.append(a)
            else:
                suggestions = ','.join(repo for _, repo in scores if scores)
                h3.insert_after(Comment(f' TODO: ambiguous match: {suggestions} '))
        else:
            href = link['href']
            try:
                r = requests.head(href, allow_redirects=True, timeout=5)
                if r.status_code == 404:
                    match, scores = None, best_scores(title, repo_names)
                    if scores and scores[0][0] >= 0.8:
                        match = scores[0][1]
                        link['href'] = f'https://github.com/{GITHUB_USER}/{match}'
                    else:
                        suggestions = ','.join(repo for _, repo in scores if scores)
                        link.insert_after(Comment(f' TODO: ambiguous match: {suggestions} '))
            except requests.RequestException:
                pass
    index_path.write_text(str(soup), encoding='utf-8')


if __name__ == '__main__':
    main()
