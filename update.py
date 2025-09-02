import os
import re
import shutil
from pathlib import Path
import logging
import subprocess
from html.parser import HTMLParser
import argparse
import datetime
from bs4 import BeautifulSoup
import zipfile
import json
import time


def configure_logging(level=logging.INFO):
    """Configure basic logging for scripts in this module."""
    logging.basicConfig(level=level, format='[%(asctime)s] [%(levelname)s] %(message)s')

# --- CONFIGURATION ---

SECTION_SNIPPETS = {
    "about": Path("new_snippets/about.html"),
    "apps": Path("new_snippets/apps.html"),
    "technical-showcase": Path("new_snippets/technical_showcase.html"),
    "implementation-details": Path("new_snippets/implementation_details.html"),
}

# Predefined snippet content (generated if files missing)
DEFAULT_SNIPPETS = {
    "about.html": """<section id=\"about\" class=\"section\">\n  <div class=\"container\">\n    <h2 class=\"section-title\">About Me</h2>\n    <p>I'm Gabriel Tenorio, a self-taught tech innovator specializing in AI integration and intelligent automation solutions. I focus on leveraging artificial intelligence to solve real-world problems, transforming traditional workflows into smart, efficient systems. While others theorize about AI's potential, I'm building intelligent solutions that workcombining cutting-edge technology with real-world engineering to create systems that actually deliver.</p>\n    <p>Beyond software, I bring extensive hands-on expertise across multiple domains: from troubleshooting small 2- and 4-stroke engines to electrical systems and plumbing, from circuit design and microelectronics to precision soldering and microcontroller programming. My technical foundation spans construction and drywall work, fine woodworking and custom furniture design, plus comprehensive computer rebuilds covering hardware, software, operating systems, and cybersecurity. This diverse engineering background allows me to approach AI projects with a deep understanding of how digital intelligence integrates with physical systems.</p>\n    <p>As a successful nature photographer, I combine artistic vision with technical precision, capturing the wild's beauty through both lens and code. My professional journey includes leading sales teams at Kay Jewelers (managing $1.5M annual revenue, hiring and training staff), and founding VividSight as an entrepreneur, handling everything from budgets to marketing. This results-driven background in management, team leadership, and customer relations perfectly complements my technical AI pursuits, enabling me to deliver intelligent solutions that create lasting value and transform how businesses operate.</p>\n  </div>\n</section>""",
    "apps.html": """<section id=\"apps\" class=\"section\">\n  <div class=\"container\">\n    <h2 class=\"section-title\">Interactive Apps</h2>\n    <div class=\"apps-grid\">\n      <div class=\"app-card\">\n        <div class=\"app-icon\">🏠</div>\n        <h3>Shed Layout Designer</h3>\n        <p>Design and organize shed layouts with drag-and-drop.</p>\n        <a href=\"/apps/shed-organizer/\" class=\"app-link\">Launch App</a>\n      </div>\n      <div class=\"app-card\">\n        <div class=\"app-icon\">🌿</div>\n        <h3>Chicago Wild Harvest</h3>\n        <p>Foraging guide with interactive maps and identification.</p>\n        <a href=\"/apps/wild-harvest/\" class=\"app-link\">Launch App</a>\n      </div>\n    </div>\n  </div>\n</section>""",
    "technical-showcase.html": """<section id=\"technical-showcase\" class=\"section\">\n  <div class=\"container\">\n    <h2 class=\"section-title\">Technical Showcase</h2>\n    <p class=\"section-subtitle\">Modern web practices & PWA ingenuity</p>\n    <div class=\"showcase-grid\">\n      <div class=\"showcase-item\">\n        <div class=\"showcase-icon\">🔄</div>\n        <h3>Auto-Update Feature</h3>\n        <ul class=\"showcase-list\">\n          <li>Service worker detects updates</li>\n          <li>Non-intrusive banner prompts refresh</li>\n          <li>Seamless PWA version control</li>\n        </ul>\n        <pre><code class=\"language-js\">// Listen for SW SKIP_WAITING\nif ('serviceWorker' in navigator) {\n  navigator.serviceWorker.addEventListener('message', e => {\n    if (e.data.type==='SKIP_WAITING') {\n      const b=document.createElement('div');\n      b.style=`position:fixed;top:0;left:0;right:0;background:#4ecdc4;color:#000;padding:10px;text-align:center;z-index:10000`;\n      b.innerHTML='<span>New version!</span><button onclick=\"location.reload()\">Update</button>';\n      document.body.append(b);\n    }\n  });\n}</code></pre>\n      </div>\n    </div>\n  </div>\n</section>""",
    "implementation-details.html": """<section id=\"implementation-details\" class=\"section\">\n  <div class=\"container\">\n    <h2 class=\"section-title\">How It’s Built</h2>\n    <p class=\"section-subtitle\">Key code powering TeNeT X</p>\n    <div class=\"implementation-grid\">\n      <div class=\"implementation-item\">\n        <h3>Font Optimization</h3>\n        <pre><code class=\"language-css\">@font-face{font-family:'InterVariable';src:url('/assets/fonts/InterVariable.woff2') format('woff2-variations');font-weight:100 900;font-display:swap;}</code></pre>\n      </div>\n      <div class=\"implementation-item\">\n        <h3>Mobile Nav</h3>\n        <pre><code class=\"language-js\">navToggle.addEventListener('click',()=>{navMenu.classList.toggle('active');navToggle.ariaExpanded=navMenu.classList.contains('active');});</code></pre>\n      </div>\n      <div class=\"implementation-item\">\n        <h3>SW Caching</h3>\n        <pre><code class=\"language-js\">workbox.routing.registerRoute(({request})=>request.destination==='script',new workbox.strategies.StaleWhileRevalidate());</code></pre>\n      </div>\n    </div>\n  </div>\n</section>""",
}

SECTION_ORDER = ["home", "apps", "about", "projects", "technical-showcase", "implementation-details", "contact"]

TEXT_REPLACEMENTS = {
    r"contact@tenettech\.dev": "TeNeT.GT@Gmail.com",
    r"TeNeT Tech\b": "TeNeT X",
    r"TeNeT Tech - Web Development Portfolio": "TeNeT X: Digital Innovation Lab",
}

ASSETS_TO_COPY = {
    "assets_to_add/codemirror": "assets/codemirror",
}

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
            logging.info(f"[Init] Created {fpath}")

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
        logging.info(f"[Dry-Run] Would backup {fp}")
        return
    bak = fp.with_suffix(fp.suffix + ".bak")
    try:
        shutil.copy2(fp, bak)
        logging.info(f"[Backup] {fp} -> {bak}")
    except Exception as e:
        logging.error(f"[Error] Failed to backup {fp}: {e}")

def restore_from_backup(fp: Path):
    bak = fp.with_suffix(fp.suffix + ".bak")
    if not bak.exists():
        logging.warning(f"[Warn] No backup found for {fp}")
        return False
    try:
        shutil.copy2(bak, fp)
        logging.info(f"[Undo] Restored {fp} from {bak}")
        return True
    except Exception as e:
        logging.error(f"[Error] Failed to restore {fp}: {e}")
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
                logging.info(f"[Dry-Run] Would replace section #{section_id} in {fp}")
            else:
                fp.write_text(new_html, encoding="utf-8")
                logging.info(f"[Section] Replaced #{section_id} in {fp}")
        else:
            logging.warning(f"[Warn] Section #{section_id} not found in {fp}")
    except Exception as e:
        logging.error(f"[Error] Failed to replace section in {fp}: {e}")

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
            logging.info(f"[Dry-Run] Would reorder sections in {fp}")
        else:
            fp.write_text(new_html, encoding="utf-8")
            logging.info(f"[Reorder] Sections reordered in {fp}")
    except Exception as e:
        logging.error(f"[Error] Failed to reorder sections in {fp}: {e}")

def apply_text_replacements(fp: Path, dry_run: bool):
    try:
        content = fp.read_text(encoding="utf-8")
        new_content = content
        for pat, repl in TEXT_REPLACEMENTS.items():
            new_content = re.sub(pat, repl, new_content, flags=re.IGNORECASE)
        if new_content != content:
            if dry_run:
                logging.info(f"[Dry-Run] Would apply text replacements in {fp}")
            else:
                fp.write_text(new_content, encoding="utf-8")
                logging.info(f"[Replace] Text replacements in {fp}")
        else:
            logging.info(f"[Info] No text replacements needed in {fp}")
    except Exception as e:
        logging.error(f"[Error] Failed to apply text replacements in {fp}: {e}")

def copy_assets(dry_run: bool):
    for src, dest_sub in ASSETS_TO_COPY.items():
        src_path = Path(src)
        dest_path = Path(dest_sub)
        if not src_path.exists():
            logging.warning(f"[Warn] Asset source missing: {src_path}")
            continue
        for root, _, files in os.walk(src_path):
            for fname in files:
                rel = Path(root).relative_to(src_path) / fname
                dst = dest_path / rel
                if dry_run:
                    logging.info(f"[Dry-Run] Would copy asset {rel} -> {dst}")
                else:
                    try:
                        dst.parent.mkdir(parents=True, exist_ok=True)
                        shutil.copy2(src_path / rel, dst)
                        logging.info(f"[Asset] {rel} -> {dst}")
                    except Exception as e:
                        logging.error(f"[Error] Failed to copy asset {rel}: {e}")

def validate_html_file(fp: Path):
    try:
        html = fp.read_text(encoding="utf-8")
        validator = SimpleHTMLValidator()
        basic_valid, basic_errors = validator.validate(html)
        advanced_valid, advanced_errors = advanced_validate_html(html)
        all_errors = basic_errors + advanced_errors
        if basic_valid and advanced_valid:
            logging.info(f"[Validate] {fp} is valid HTML (basic + advanced).")
        else:
            logging.error(f"[Validate] {fp} has errors:")
            for err in all_errors:
                logging.error(f"  - {err}")
        return len(all_errors) == 0
    except Exception as e:
        logging.error(f"[Error] Failed to validate {fp}: {e}")
        return False

def git_commit_changes(files, message, branch):
    try:
        subprocess.run(["git", "--version"], check=True, capture_output=True)
    except FileNotFoundError:
        logging.error("[Error] Git is not installed or not in PATH. Skipping commit.")
        return
    except subprocess.CalledProcessError as e:
        logging.error(f"[Error] Git check failed: {e}")
        return
    try:
        subprocess.run(["git", "checkout", branch], check=True)
    except subprocess.CalledProcessError:
        logging.warning(f"[Warn] Branch {branch} not found. Creating it.")
        subprocess.run(["git", "checkout", "-b", branch], check=True)
    try:
        subprocess.run(["git", "add"] + files, check=True)
        subprocess.run(["git", "commit", "-m", message], check=True)
        if AUTO_PUSH:
            subprocess.run(["git", "push", "origin", branch], check=True)
            logging.info(f"[Git] Pushed to {branch}")
        logging.info(f"[Git] Committed changes: {message}")
    except subprocess.CalledProcessError as e:
        logging.error(f"[Error] Git operation failed: {e}")

def main(dry_run=False, git_commit=False, undo=False, branch=GIT_BRANCH):
    if not logging.getLogger().hasHandlers():
        configure_logging()
    ensure_snippets()  # Auto-generate missing snippet files
    if undo:
        for file in HTML_FILES + OTHER_FILES:
            fp = Path(file)
            if restore_from_backup(fp):
                logging.info(f"[Undo] Successfully restored {fp}")
            else:
                logging.warning(f"[Warn] Could not undo {fp}")
        logging.info("\n✅ Undo complete. All changes reverted from backups.")
        return

    snippets = {}
    for sec_id, path in SECTION_SNIPPETS.items():
        if not path.exists():
            logging.warning(f"[Warn] Snippet missing: {path}")
            continue
        snippets[sec_id] = path.read_text(encoding="utf-8").strip()

    updated_files = []
    for file in HTML_FILES + OTHER_FILES:
        fp = Path(file)
        if not fp.exists():
            logging.warning(f"[Warn] File missing: {file}")
            continue
        backup_file(fp, dry_run)
        for sec_id, snip in snippets.items():
            replace_section_by_id(fp, sec_id, snip, dry_run)
        apply_text_replacements(fp, dry_run)
        if not dry_run:
            updated_files.append(str(fp))

    copy_assets(dry_run)

    # Reorder sections in HTML files
    for file in HTML_FILES:
        fp = Path(file)
        if fp.exists():
            reorder_sections(fp, SECTION_ORDER, dry_run)

    # Validate HTML files
    for file in HTML_FILES:
        fp = Path(file)
        if fp.exists():
            validate_html_file(fp)

    if git_commit and not dry_run and updated_files:
        git_commit_changes(updated_files, "Auto-update portfolio sections and assets", branch)

    logging.info("\n✅ All updates applied. Review changes and redeploy.")

if __name__ == "__main__":
    configure_logging()
    parser = argparse.ArgumentParser(description="Auto-update TeNeT X portfolio site")
    parser.add_argument('--dry-run', action='store_true', help='Preview changes without writing files')
    parser.add_argument('--git-commit', action='store_true', help='Commit changes to git after update')
    parser.add_argument('--undo', action='store_true', help='Restore files from backups (undo changes)')
    parser.add_argument('--branch', default=GIT_BRANCH, help='Git branch to commit to (default: main)')
    args = parser.parse_args()

    main(dry_run=args.dry_run, git_commit=args.git_commit, undo=args.undo, branch=args.branch)

# End of script

# This script is a fully merged, improved, and functional version of the previous two files with all proposed improvements implemented.
