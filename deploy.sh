#!/usr/bin/env bash
# deploy.sh — regenerate AsliVastu data, validate it, and sync it to the web app.
#
# Exists because the pipeline->web handoff used to be a manual copy: data was
# fixed in data/processed/ and never reached nqr-web/public/, so the live site
# served stale numbers while the terminal showed correct ones. This makes the
# steps atomic — validation must pass before anything is copied.
#
# Usage:
#   ./deploy.sh              # full run: scrape -> score -> validate -> sync
#   ./deploy.sh --no-scrape  # skip scrapers (use existing raw data), just rescore
#   ./deploy.sh --check      # validate only, change nothing
set -euo pipefail

PIPELINE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_DIR="$(cd "$PIPELINE_DIR/../nqr-web" 2>/dev/null && pwd || echo "")"
cd "$PIPELINE_DIR"

bold() { printf "\033[1m%s\033[0m\n" "$1"; }
ok()   { printf "  \033[32mok\033[0m   %s\n" "$1"; }
die()  { printf "\n\033[31mFAILED:\033[0m %s\n" "$1"; exit 1; }

SCRAPE=1; CHECK_ONLY=0
for a in "$@"; do
  case "$a" in
    --no-scrape) SCRAPE=0 ;;
    --check)     CHECK_ONLY=1 ;;
    *) die "unknown flag: $a (use --no-scrape or --check)" ;;
  esac
done

if [ "$CHECK_ONLY" = "1" ]; then
  bold "Validating only"
  python3 validate.py || die "validation failed"
  exit 0
fi

# ── 1. scrape + merge ──────────────────────────────────────────────────────
if [ "$SCRAPE" = "1" ]; then
  bold "1/4  Running pipeline (scrapers + merge)"
  python3 run_pipeline.py || die "run_pipeline.py errored"
  ok "master_by_pin regenerated"
else
  bold "1/4  Skipping scrapers (--no-scrape); re-merging existing data"
  python3 -c "import run_pipeline as rp; rp.merge()" || die "merge errored"
  ok "master_by_pin re-merged"
fi

# ── 2. score ───────────────────────────────────────────────────────────────
bold "2/4  Scoring"
python3 scoring.py > /dev/null || die "scoring.py errored"
ok "nqi_scores regenerated"

# ── 3. validate BEFORE copying — bad data must never reach the web app ─────
bold "3/4  Validating"
if ! python3 validate.py --quiet; then
  die "validation failed — nothing was copied. Fix the data, then rerun."
fi
ok "all checks passed"

# ── 4. sync to the web app ─────────────────────────────────────────────────
bold "4/4  Syncing to nqr-web/public"
[ -n "$WEB_DIR" ] || die "nqr-web not found next to this repo — copy manually"
for pair in "nqi_scores_latest.json:nqi_scores.json" \
            "master_by_pin_latest.json:master_by_pin.json" \
            "methodology_latest.json:methodology.json"; do
  src="data/processed/${pair%%:*}"; dst="$WEB_DIR/public/${pair##*:}"
  [ -f "$src" ] || die "missing $src"
  cp "$src" "$dst"
  ok "$(basename "$dst")"
done

# confirm the sync actually took (the check that would have caught the last bug)
python3 validate.py --quiet || die "post-sync validation failed"

cat <<EOF

$(bold "Data is regenerated, validated and synced.")

Next — commit and deploy:

  cd $PIPELINE_DIR
  rm -f .git/index.lock
  git add -A && git commit -m "Refresh data" && git push

  cd $WEB_DIR
  rm -f .git/index.lock
  git add public/*.json && git commit -m "Refresh scores" && git push
  npx vercel --prod      # REQUIRED — git push alone does not deploy

EOF
