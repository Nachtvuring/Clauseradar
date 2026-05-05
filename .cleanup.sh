#!/usr/bin/env bash
set -e
cd ~/test

echo "=== STEP 1: backup keyfile outside repo (so you can rotate before destroying) ==="
BK=~/compromised-key-DELETE-AFTER-ROTATION
mkdir -p "$BK"
[ -f keyfile ]     && mv keyfile     "$BK/keyfile"     && echo "moved keyfile -> $BK/keyfile"
[ -f keyfile.pub ] && mv keyfile.pub "$BK/keyfile.pub" && echo "moved keyfile.pub -> $BK/keyfile.pub"
ls -la "$BK"

echo
echo "=== STEP 2: confirm working tree is clean of sensitive files ==="
ls -la keyfile keyfile.pub 2>&1 | head -3 || true

echo
echo "=== STEP 3: orphan branch (no parent commits) ==="
git checkout --orphan clean-main

echo
echo "=== STEP 4: clear index, then re-add everything respecting .gitignore ==="
git rm -rf --cached . >/dev/null
git add -A
echo "files staged:"
git diff --cached --name-only | sort

echo
echo "=== STEP 5: commit ==="
git commit -m "ClauseRadar MVP" --quiet
echo "new HEAD:"
git log --oneline -1

echo
echo "=== STEP 6: replace main with this clean branch locally ==="
git branch -D main 2>/dev/null || true
git branch -m main

echo
echo "=== STEP 7: force-push to overwrite GitHub history ==="
git push --force origin main 2>&1 | tail -10

echo
echo "=== STEP 8: verify locally that no commit, anywhere, contains the key ==="
echo "history:"
git log --oneline --all
echo
echo "grep all blobs in repo for OPENSSH PRIVATE KEY header:"
if git rev-list --all --objects | awk '{print $1}' | xargs -I {} git cat-file -p {} 2>/dev/null | grep -l "OPENSSH PRIVATE KEY" 2>/dev/null; then
  echo "!!! KEY STILL FOUND !!!"
else
  echo "clean — no private key in any reachable object"
fi
