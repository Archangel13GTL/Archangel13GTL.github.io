#!/bin/bash
set -e

npm run build || {
  echo "Build failed or missing. Copying static files to public/"
  mkdir -p public
  cp -r index.html assets manifest.json sw.js public/
}

firebase deploy --only hosting
