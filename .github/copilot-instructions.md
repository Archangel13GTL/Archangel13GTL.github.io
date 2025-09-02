# TENET Tech Portfolio Website

Modern portfolio website with progressive web app capabilities, interactive applications, and Firebase integration for AI services. Built with static HTML/CSS/JS and Python automation scripts - no WordPress, no heavy build process.

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Bootstrap the Repository:
- Ensure Node.js 18+ is installed: `node --version` (should be >=18)
- Install Python dependencies: `pip install beautifulsoup4 lxml` -- takes 5 seconds
- No npm dependencies needed for basic functionality - package.json is minimal

### Build and Run the Website:
- Generate complete website package: `python3 website_compiler.py` -- takes < 1 second. NEVER CANCEL.
- Start local development server: `python3 -m http.server 8000` -- starts immediately
- Access at: http://localhost:8000
- Stop server: `pkill -f "python3.*http.server"`

### Test the Repository:
- Run Python tests: `python3 tests/test_update_links.py` -- takes < 1 second. NEVER CANCEL.
- Validate portfolio updates: `python3 update_portfolio.py --dry-run` -- takes < 1 second. NEVER CANCEL.

### Firebase Deployment (Optional):
- Install Firebase CLI: `npm install -g firebase-tools` -- takes 5-10 minutes. NEVER CANCEL. Set timeout to 600+ seconds.
- Deploy: `./deploy.sh` (requires Firebase authentication)
- **WARNING**: Firebase CLI installation often fails due to network restrictions

## Validation

- **ALWAYS run Python tests after making changes to Python scripts**
- **ALWAYS test the website with HTTP server and verify it loads properly**
- **MANUAL VALIDATION REQUIRED**: Navigate through the portfolio sections, test interactive apps
- **VALIDATION SCENARIOS**:
  1. Visit homepage and verify all sections load (About, Projects, Technical Showcase, Apps, Contact)
  2. Test Shed Layout Designer app at `/apps/shed-organizer/`
  3. Test Chicago Wild Harvest app at `/apps/wild-harvest/`
  4. Verify responsive design works on mobile viewport
  5. Check that contact links work (email, GitHub, LinkedIn)

## Common Tasks

### Repository Structure:
```
/
├── index.html                  # Main portfolio page
├── assets/                     # CSS, JS, fonts, images
│   ├── css/main.css           # Main styles
│   ├── js/main.js             # Main JavaScript
│   ├── fonts/                 # Variable fonts (Inter, Mona Sans)
│   └── codemirror/            # Code editor for apps
├── apps/                      # Interactive applications
│   ├── shed-organizer/        # Drag & drop layout designer
│   └── wild-harvest/          # Chicago foraging guide
├── functions/ai-proxy/        # Firebase function for AI API
├── scripts/                   # Utility scripts
├── tests/                     # Python tests
├── .github/workflows/         # CI/CD pipelines
├── website_compiler.py        # Generates complete website package
├── update_portfolio.py        # Updates content and sections
└── deploy.sh                  # Firebase deployment script
```

### Key Python Scripts:
- `website_compiler.py` - Main build script, generates tenet-tech-portfolio.zip
- `update_portfolio.py` - Updates content, validates HTML, manages sections
- `tests/test_update_links.py` - Validates link matching functionality

### Working with Apps:
- Both apps are standalone HTML/CSS/JS applications
- Shed organizer: Touch-friendly drag & drop interface
- Wild harvest: Interactive plant database with search
- Apps use localStorage for data persistence
- CodeMirror integration for code editing features

### CI/CD Workflows:
- `.github/workflows/ci.yml` - Runs on all pushes/PRs
- `.github/workflows/build-deploy.yml` - Deploys to GitHub Pages
- Scripts may fail due to missing dependencies (puppeteer, repo-scoring)

### Environment Variables (for AI features):
```bash
export OPENAI_API_KEY="your-key"
export ANTHROPIC_API_KEY="your-key" 
export GEMINI_API_KEY="your-key"
```

## Commands That Work vs Don't Work

### ✅ Commands That ALWAYS Work:
- `python3 website_compiler.py` - Generates complete website (< 1 second)
- `python3 -m http.server 8000` - Local development server (instant)
- `python3 tests/test_update_links.py` - Runs tests (< 1 second)
- `python3 update_portfolio.py --dry-run` - Validates updates (< 1 second)
- `curl http://localhost:8000` - Test server response (< 1 second)

### ⚠️ Commands That May Fail:
- `npm install puppeteer` - Fails due to network restrictions downloading Chrome
- `npm install -g firebase-tools` - Takes 5-10 minutes, may timeout. Set timeout to 600+ seconds.
- `node scripts/generate-gif-demo.js` - Requires puppeteer (fails)
- `node scripts/score-repos.js` - Requires /workspace directory (fails)
- `firebase deploy` - Requires authentication setup

### 🚫 Commands That Don't Exist:
- `npm run build` - No build script in package.json
- `npm run test` - No test script defined
- `npm run dev` - Use Python HTTP server instead

## Timing Expectations

**NEVER CANCEL any of these operations:**

- Python dependency installation: 5 seconds - Set timeout to 30+ seconds
- Website compilation: < 1 second - Set timeout to 10+ seconds  
- Python tests: < 1 second - Set timeout to 10+ seconds
- HTTP server startup: Instant - Set timeout to 10+ seconds
- Portfolio validation: < 1 second - Set timeout to 10+ seconds
- Firebase CLI installation: 5-10 minutes - Set timeout to 600+ seconds

## Troubleshooting

### Font Loading Warnings:
- Browser may show font decode warnings for InterVariable.woff2 and MonaSans-Variable.woff2
- This is normal - fonts are placeholder files, not actual variable fonts
- Website functions correctly despite warnings

### Missing Dependencies:
- If BeautifulSoup missing: `pip install beautifulsoup4 lxml`
- If puppeteer fails: Skip GIF demo generation (optional feature)
- If Firebase CLI fails: Use GitHub Pages deployment instead

### File Not Found Errors:
- `/workspace` directory: Repo scoring script expects different environment
- Asset sources missing: Some optional assets not included in repository
- Snippet files missing: Update scripts reference optional content files

## Development Workflow

1. **Make changes to Python scripts or static files**
2. **Run validation**: `python3 tests/test_update_links.py`
3. **Test locally**: `python3 -m http.server 8000`
4. **Manual validation**: Navigate through all sections and apps
5. **Generate package**: `python3 website_compiler.py`
6. **Commit changes** (build artifacts auto-ignored via .gitignore)

## Browser Support

- Chrome 80+, Firefox 75+, Safari 14+, Edge 80+
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive Web App installable on all modern browsers
- Touch-optimized with 48px minimum touch targets