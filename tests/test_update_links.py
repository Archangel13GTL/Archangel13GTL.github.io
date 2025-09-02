import json
from pathlib import Path
import sys

from bs4 import BeautifulSoup

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import update_links


def test_match_threshold_influences_link_matching(tmp_path, monkeypatch):
    data_dir = tmp_path / 'data'
    data_dir.mkdir()
    (data_dir / 'repos.json').write_text(json.dumps(['example']), encoding='utf-8')

    index_html = tmp_path / 'index.html'
    initial_html = (
        '<section id="projects">\n'
        '  <div class="project-card">\n'
        '    <h3>Sample</h3>\n'
        '  </div>\n'
        '</section>'
    )
    index_html.write_text(initial_html, encoding='utf-8')

    monkeypatch.chdir(tmp_path)
    monkeypatch.setattr(update_links, 'REPO_FILE', data_dir / 'repos.json')

    # High threshold prevents matching
    update_links.main(match_threshold=0.8)
    soup = BeautifulSoup(index_html.read_text(encoding='utf-8'), 'html.parser')
    assert soup.find('a') is None

    # Lower threshold allows matching
    index_html.write_text(initial_html, encoding='utf-8')
    update_links.main(match_threshold=0.7)
    soup = BeautifulSoup(index_html.read_text(encoding='utf-8'), 'html.parser')
    link = soup.find('a')
    assert link is not None
    assert link['href'].endswith('/example')
