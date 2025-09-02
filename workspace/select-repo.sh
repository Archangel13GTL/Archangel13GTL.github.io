#!/usr/bin/env bash

usage() {
  echo "Usage: source $0 --pick <repo>" >&2
  return 1
}

if [[ "$1" != "--pick" || -z "$2" ]]; then
  usage
fi

export CHOSEN_REPO="$2"

REPO_DIR="workspace/$2"
if [[ ! -d "$REPO_DIR" ]]; then
  echo "Error: Repository directory '$REPO_DIR' not found." >&2
  return 1
fi

cd "$REPO_DIR" || return
git checkout update-links-and-ai
