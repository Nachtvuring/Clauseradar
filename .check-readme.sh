#!/usr/bin/env bash
cd ~/test
echo "=== file type ==="
file README.md 2>/dev/null || echo "(file command not available)"
echo "=== size ==="
wc -c README.md
echo "=== first 64 bytes (octal) ==="
head -c 64 README.md | od -c | head -4
echo "=== first 200 chars as text ==="
head -c 200 README.md
echo
