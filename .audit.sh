#!/usr/bin/env bash
cd ~/test
echo "=== git remote ==="
git remote -v
echo
echo "=== git status ==="
git status --short
echo
echo "=== git config user ==="
git config user.email
git config user.name
echo
echo "=== sensitive-pattern files (excluding node_modules, .git) ==="
find . -type f \
  \( -name 'keyfile*' -o -name '*.pem' -o -name '*.key' -o -name 'id_rsa*' \
     -o -name 'id_ed25519*' -o -name '.env' -o -name '.env.local' \
     -o -name '.env.production' \) \
  -not -path './node_modules/*' -not -path './.git/*' 2>/dev/null
echo
echo "=== data/ contents ==="
ls -la data/ 2>/dev/null || echo "(no data/ directory)"
echo
echo "=== data/db.json (first lines) ==="
head -c 300 data/db.json 2>/dev/null
echo
echo
echo "=== keyfile first line (to confirm it really is a private key) ==="
head -1 keyfile 2>/dev/null
echo
echo "=== keyfile.pub (full, public anyway) ==="
cat keyfile.pub 2>/dev/null
echo
echo "=== README.md staged diff (top 30 lines) ==="
git diff --cached README.md | head -30
echo
echo "=== last 5 commits ==="
git log --oneline -5
echo
echo "=== EVERY file currently tracked in git, sorted ==="
git ls-files | sort
