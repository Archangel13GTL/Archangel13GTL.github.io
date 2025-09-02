# Repository Selection

This document describes the heuristics used to pick repositories and how to override them.

## Scoring Heuristics

Each candidate repository receives a score composed of:

- **Stars** – weight of 2 per star.
- **Recent activity** – repositories updated within the last month receive +10 points.
- **Topic match** – +5 for each matching topic keyword.
- **Forks** – +1 per fork.

The selection process sums these values and picks the highest-scoring repository.

## Overriding Picks

To manually select a repository:

1. Set the `REPO_OVERRIDE` environment variable to the desired repository URL or name.
2. Run the selection script; the override value will be used instead of the computed score.

Alternatively, supply `--repo <name>` on the command line to bypass scoring entirely.
