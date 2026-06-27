#!/bin/bash
set -e

VERSION=$(git rev-parse --short HEAD)
echo "Deploying version $VERSION"

# Stamp all module import URLs and the HTML script tag with the current git hash.
# This forces browsers to fetch fresh copies of all JS files after each deploy.
sed -i '' "s/?v=[^'\"&]*/?v=$VERSION/g" index.html projection.js ui.js

git add interactive.html projection.js ui.js
git commit -m "Deploy: stamp cache-busting version $VERSION"
git push

# Restore placeholder version so the working copy stays clean
sed -i '' "s/?v=$VERSION/?v=1/g" interactive.html projection.js ui.js
git checkout -- interactive.html projection.js ui.js
