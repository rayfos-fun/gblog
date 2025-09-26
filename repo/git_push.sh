#!/bin/bash

REPO_PATH="$HOME/gblog"

cd "$REPO_PATH" || { echo "Failed to change directory to $REPO_PATH" >&2; exit 1; }

/usr/local/git/current/bin/git push

exit 0
