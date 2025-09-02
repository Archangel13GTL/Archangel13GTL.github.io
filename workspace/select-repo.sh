#!/usr/bin/env bash

usage() {
  echo "Usage: $0 --pick <repo>" >&2
  exit 1
}

if [[ "$1" != "--pick" || -z "$2" ]]; then
  usage
fi

export CHOSEN_REPO="$2"

git checkout update-links-and-ai
