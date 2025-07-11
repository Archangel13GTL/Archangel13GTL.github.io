import os
import re
import shutil
from pathlib import Path
import logging
import subprocess
from html.parser import HTMLParser
import argparse
from bs4 import BeautifulSoup  # pip install beautifulsoup4 lxml

# Setup logging
logging.basicConfig(level=logging.INFO, format='[%(asctime)s] [%(levelname)s] %(message)s')

# --- CONFIGURATION ---
SECTION_SNIPPETS = {
    "about": Path("new_snippets/about.html"),
    "apps": Path("new_snippets/apps.html"),
    "technical-showcase": Path("new_snippets/technical_showcase.html"),
    "implementation-details": Path("new_snippets/implementation_details.html"),
}
# Default snippets if missing
DEFAULT_SNIPPETS = {
    "about.html": """<section id="about" class="section">
  <div class="container">
    <h2 class="section-title">About Me</h2>
    <p>I'm Gabriel Tenorio, a self-taught AI specialist and full-stack innovator. I leverage machine learning to create intelligent, user-centric solutions that transform workflows and experiences. While I focus on AI, my hands-on mastery spans electronics, microcontrollers, woodworking, and computer repair—bridging digital and physical worlds seamlessly.</p>
    <p>My journey includes managing $1.5M revenue at Kay Jewelers, leading teams, and founding VividSight, delivering personalized, impactful solutions. I combine technical depth with business acumen to craft systems that deliver lasting value and real-world impact.</p>
  </div>
</section>""",
    "apps.html": """<section id="apps" class="section">
  <div class="container">
    <h2 class="section-title">Interactive Apps</h2>
    <div class="apps-grid">
      <div class="app-card">
        <div class="app-icon">🏠</div>
        <h3>Shed Layout Designer</h3>
        <p>Design and organize shed layouts with drag-and-drop.</p>
        <a href="/apps/shed-organizer/" class="app-link">Launch App</a>
      </div>
      <div class="app-card">
        <div class="app-icon">🌿</div>
        <h3>Chicago Wild Harvest</h3>
        <p>Foraging guide with interactive maps and identification.</p>
        <a href="/apps/wild-harvest/" class="app-link">Launch App</a>
      </div>
    </div>
  </div>
</section>""",
    "technical-showcase.html": """<section id="technical-showcase" class="section">
  <div class="container">
    <h2 class="section-title">Technical Showcase</h2>
    <p class="section-subtitle">Modern web practices & PWA ingenuity</p>
    <div class="showcase-grid">
      <div class="showcase-item">
        <div class="showcase-icon">🔄</div>
        <h3>Auto-Update Feature</h3>
        <ul class="showcase-list">
          <li>Service worker detects updates</li>
          <li>Banner prompts refresh seamlessly</li>
          <li>Ensures users always see latest version</li>
        </ul>
        <pre><code class="language-js">// Listen for SW SKIP_WAITING\nif ('serviceWorker' in navigator) {\n  navigator.serviceWorker.addEventListener('message', e => {\n    if (e.data.type==='SKIP_WAITING') {\n      const b=document.createElement('div');\n      b.style=`position:fixed;top:0;left:0;right:0;background:#4ecdc4;color:#000;padding:10px;text-align:center;z-index:10000`;\n      b.innerHTML='<span>New version!</span><button onclick=\"location.reload()\">Update</button>';\n      document.body.append(b);\n    }\n  });\n}</code></pre>
      </div>
    </div>
  </div>
</section>""",
    "implementation-details.html": """<section id="implementation-details" class="section">
  <div class="container">
    <h2 class="section-title">How It’s Built</h2>
    <p class="section-subtitle">Key code powering TeNeT X</p>
    <div class="implementation-grid">
      <div class="implementation-item">
        <h3>Font Optimization</h3>
        <pre><code class="language-css">@font-face{font-family:'InterVariable';src:url('/assets/fonts/InterVariable.woff2') format('woff2-variations');font-weight:100 900;font-display:swap;}</code></pre>
      </div>
      <div class="implementation-item">
        <h3>Mobile Nav</h3>
        <pre><code class="language-js">navToggle.addEventListener('click',()=>{navMenu.classList.toggle('active');navToggle.ariaExpanded=navMenu.classList.contains('active');});</code></pre>
      </div>
      <div class="implementation-item">
        <h3>SW Caching</h3>
        <pre><code class="language-js">workbox.routing.registerRoute(({request})=>request.destination==='script',new workbox.strategies.StaleWhileRevalidate());</code></pre>
      </div>
    </div>
  </div>
</section>""",
}

# Desired section order for reordering
SECTION_ORDER = ["home", "apps", "about", "projects", "technical-showcase", "implementation-details", "contact"]

# Text replacements (regex pattern → replacement)
TEXT_REPLACEMENTS = {
    r"contact@tenettech\.dev": "TeNeT.GT@Gmail.com",
    r"TeNeT Tech\b": "TeNeT X",
    r"TeNeT Tech - Web Development Portfolio": "TeNeT X: Digital Innovation Lab",
}

# Assets to copy
ASSETS_TO_COPY = {
    "assets_to_add/codemirror": "assets/codemirror",
}

# Files to process
HTML_FILES = [
    "index.html",
    "apps/shed-organizer/index.html",
    "apps/wild-harvest/index.html",
]
OTHER_FILES = [
    "assets/js/main.js",
    "assets/css/main.css",
]

GIT_BRANCH = "main"
AUTO_PUSH = True

# --- UTILITIES ---

def ensure_snippets():
    Path("new_snippets").mkdir(exist_ok=True)
    for fname, content in DEFAULT_SNIPPETS.items():
        fpath = Path("new_snippets") / fname
        if not fpath.exists():
            with open(fpath, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"[Init] Created {fpath}")

class SimpleHTMLValidator(HTMLParser):
    def __init__(self):
        super().__init__()
        self.errors = []
    def error(self, message):
        self.errors.append(message)
    def validate(self, html):
        self.errors = []
        try:
            self.feed(html)
        except Exception as e:
            self.errors.append(str(e))
        return len(self.errors) == 0, self.errors

def advanced_validate_html(html):
    try:
        soup = BeautifulSoup(html, 'lxml')
        interactive = soup.find_all(['a', 'button'])
        aria_errors = [tag for tag in interactive if not tag.has_attr('aria-label') and not tag.text.strip()]
        if aria_errors:
            return False, [f"Missing aria-label on {len(aria_errors)} interactive elements"]
        return True, []
    except Exception as e:
        return False, [str(e)]

def backup_file(fp: Path, dry_run: bool):
    if dry_run:
        print(f"[Dry-Run] Would backup {fp}")
        return
    bak = fp.with_suffix(fp.suffix + ".bak")
    try:
        shutil.copy2(fp, bak)
        print(f"[Backup] {fp} -> {bak}")
    except Exception as e:
        print(f"[Error] Failed to backup {fp}: {e}")

def restore_from_backup(fp: Path):
    bak = fp.with_suffix(fp.suffix + ".bak")
    if not bak.exists():
        print(f"[Warn] No backup for {fp}")
        return False
    try:
        shutil.copy2(bak, fp)
        print(f"[Undo] Restored {fp} from {bak}")
        return True
    except Exception as e:
        print(f"[Error] Failed to restore {fp}: {e}")
        return False

def replace_section_by_id(fp: Path, section_id: str, snippet_html: str, dry_run: bool):
    try:
        html = fp.read_text(encoding="utf-8")
        pattern = re.compile(
            rf"(<(section|div)\b[^>]*\bid=['\"]{section_id}['\"][^>]*>).*?(</\2>)",
            re.DOTALL | re.IGNORECASE
        )
        new_html, count = pattern.subn(rf"\1\n{snippet_html}\n\3", html)
        if count:
            if dry_run:
                print(f"[Dry-Run] Would replace section #{section_id} in {fp}")
            else:
                fp.write_text(new_html, encoding="utf-8")
                print(f"[Section] Replaced #{section_id} in {fp}")
        else:
            print(f"[Warn] Section #{section_id} not found in {fp}")
    except Exception as e:
        print(f"[Error] Failed to replace section in {fp}: {e}")

def reorder_sections(fp: Path, order: list, dry_run: bool):
    try:
        html = fp.read_text(encoding="utf-8")
        soup = BeautifulSoup(html, 'lxml')
        body = soup.body
        sections = {s['id']: s for s in body.find_all(['section', 'div'], id=True) if s['id'] in order}
        ordered_content = [str(sections[id]) for id in order if id in sections]
        new_body = '\n'.join(ordered_content)
        body.replace_with(BeautifulSoup(new_body, 'lxml'))
        new_html = str(soup)
        if dry_run:
            print(f"[Dry-Run] Would reorder sections in {fp}")
        else:
            fp.write_text(new_html, encoding="utf-8")
            print(f"[Reorder] Sections reordered in {fp}")
    except Exception as e:
        print(f"[Error] Failed to reorder sections in {fp}: {e}")

def apply_text_replacements(fp: Path, dry_run: bool):
    try:
        content = fp.read_text(encoding="utf-8")
        new_content = content
        for pat, repl in TEXT_REPLACEMENTS.items():
            new_content = re.sub(pat, repl, new_content, flags=re.IGNORECASE)
        if new_content != content:
            if dry_run:
                print(f"[Dry-Run] Would apply text replacements in {fp}")
            else:
                fp.write_text(new_content, encoding="utf-8")
                print(f"[Replace] Text replacements in {fp}")
        else:
            print(f"[Info] No text replacements needed in {fp}")
    except Exception as e:
        print(f"[Error] Failed to apply text replacements in {fp}: {e}")

def copy_assets(dry_run: bool):
    for src, dest_sub in ASSETS_TO_COPY.items():
        src_path = Path(src)
        dest_path = Path(dest_sub)
        if not src_path.exists():
            print(f"[Warn] Asset source missing: {src_path}")
            continue
        for root, _, files in os.walk(src_path):
            for fname in files:
                rel = Path(root).relative_to(src_path) / fname
                dst = dest_path / rel
                if dry_run:
                    print(f"[Dry-Run] Would copy asset {rel} -> {dst}")
                else:
                    try:
                        dst.parent.mkdir(parents=True, exist_ok=True)
                        shutil.copy2(src_path / rel, dst)
                        print(f"[Asset] {rel} -> {dst}")
                    except Exception as e:
                        print(f"[Error] Failed to copy asset {rel}: {e}")

def validate_html_file(fp: Path):
    try:
        html = fp.read_text(encoding="utf-8")
        validator = SimpleHTMLValidator()
        basic_valid, basic_errors = validator.validate(html)
        advanced_valid, advanced_errors = advanced_validate_html(html)
        all_errors = basic_errors + advanced_errors
        if basic_valid and advanced_valid:
            print(f"[Validate] {fp} is valid HTML (basic + advanced).")
        else:
            print(f"[Validate] {fp} has errors:")
            for err in all_errors:
                print(f"  - {err}")
        return len(all_errors) == 0
    except Exception as e:
        print(f"[Error] Failed to validate {fp}: {e}")
        return False

def git_commit_changes(files, message, branch):
    try:
        subprocess.run(["git", "--version"], check=True, capture_output=True)
    except FileNotFoundError:
        print("[Error] Git not found. Skipping commit.")
        return
    except subprocess.CalledProcessError:
        print("[Error] Git check failed. Skipping commit.")
        return
    try:
        subprocess.run(["git", "checkout", branch], check=True)
    except subprocess.CalledProcessError:
        print(f"[Warn] Branch {branch} not found. Creating.")
        subprocess.run(["git", "checkout", "-b", branch], check=True)
    try:
        subprocess.run(["git", "add"] + files, check=True)
        subprocess.run(["git", "commit", "-m", message], check=True)
        if AUTO_PUSH:
            subprocess.run(["git", "push", "origin", branch], check=True)
            print(f"[Git] Pushed to {branch}")
        print(f"[Git] Committed: {message}")
    except subprocess.CalledProcessError as e:
        print(f"[Error] Git commit failed: {e}")

def main(dry_run=False, git_commit=False, undo=False, branch=GIT_BRANCH):
    ensure_snippets()
    if undo:
        for file in HTML_FILES + OTHER_FILES:
            fp = Path(file)
            if restore_from_backup(fp):
                print(f"[Undo] Restored {fp}")
            else:
                print(f"[Warn] No backup for {fp}")
        print("Undo complete.")
        return
    snippets = {}
    for sec_id, path in SECTION_SNIPPETS.items():
        if not path.exists():
            print(f"[Warn] Snippet missing: {path}")
            continue
        snippets[sec_id] = path.read_text(encoding="utf-8").strip()
    updated_files = []
    for file in HTML_FILES + OTHER_FILES:
        fp = Path(file)
        if not fp.exists():
            print(f"[Warn] File missing: {file}")
            continue
        backup_file(fp, dry_run)
        for sec_id, snip in snippets.items():
            replace_section_by_id(fp, sec_id, snip, dry_run)
        apply_text_replacements(fp, dry_run)
        if not dry_run:
            updated_files.append(str(fp))
    copy_assets(dry_run)
    # Reorder sections
    for file in HTML_FILES:
        fp = Path(file)
        if fp.exists():
            reorder_sections(fp, SECTION_ORDER, dry_run)
    # Validate
    for file in HTML_FILES:
        fp = Path(file)
        if fp.exists():
            validate_html_file(fp)
    if git_commit and not dry_run and updated_files:
        git_commit_changes(updated_files, "Auto-update sections and assets", branch)
    print("Done.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--git-commit", action="store_true")
    parser.add_argument("--undo", action="store_true")
    parser.add_argument("--branch", default=GIT_BRANCH)
    args = parser.parse_args()
    main(args.dry_run, args.git_commit, args.undo, args.branch)