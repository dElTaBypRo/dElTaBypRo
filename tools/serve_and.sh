#!/bin/bash
# Run a command with the local static server (port 8765) up for its duration.
cd "$(dirname "$0")/.." || exit 1
python3 -m http.server 8765 --bind 127.0.0.1 >/dev/null 2>&1 & SRV=$!
for i in $(seq 1 50); do curl -s -o /dev/null http://127.0.0.1:8765/ && break; sleep 0.1; done
"$@"; RC=$?
kill $SRV 2>/dev/null; exit $RC
