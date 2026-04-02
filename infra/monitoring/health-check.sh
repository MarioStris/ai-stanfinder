#!/usr/bin/env bash
# =============================================================
# health-check.sh — AI StanFinder service health verification
# =============================================================
# Usage:
#   ./health-check.sh                        # check production (reads BASE_URL from env)
#   BASE_URL=http://localhost:3001 ./health-check.sh
#   ./health-check.sh --env staging
#
# Exit codes:
#   0 — all checks passed
#   1 — one or more checks failed
# =============================================================

set -euo pipefail

# -------------------------------------------------------
# Config
# -------------------------------------------------------
BASE_URL="${BASE_URL:-https://api.ai-stanfinder.com}"
TIMEOUT=10
RETRIES=3
RETRY_DELAY=5

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

FAILED=0

# -------------------------------------------------------
# Helpers
# -------------------------------------------------------
log_ok()   { echo -e "${GREEN}[OK]${NC}   $1"; }
log_fail() { echo -e "${RED}[FAIL]${NC} $1"; FAILED=1; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_info() { echo -e "       $1"; }

http_check() {
  local label="$1"
  local url="$2"
  local expected_status="${3:-200}"

  for attempt in $(seq 1 $RETRIES); do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$url" 2>/dev/null || echo "000")
    if [ "$STATUS" = "$expected_status" ]; then
      log_ok "$label — HTTP $STATUS"
      return 0
    fi
    if [ "$attempt" -lt "$RETRIES" ]; then
      log_warn "$label — HTTP $STATUS (attempt $attempt/$RETRIES, retrying in ${RETRY_DELAY}s)"
      sleep "$RETRY_DELAY"
    fi
  done

  log_fail "$label — HTTP $STATUS after $RETRIES attempts (expected $expected_status)"
  return 1
}

json_field_check() {
  local label="$1"
  local url="$2"
  local field="$3"
  local expected="$4"

  BODY=$(curl -s --max-time "$TIMEOUT" "$url" 2>/dev/null || echo "{}")
  ACTUAL=$(echo "$BODY" | grep -o "\"$field\":\"[^\"]*\"" | cut -d'"' -f4 || echo "")

  if [ "$ACTUAL" = "$expected" ]; then
    log_ok "$label — $field=$actual"
  else
    log_fail "$label — expected $field=$expected, got '$ACTUAL'"
  fi
}

# -------------------------------------------------------
# Checks
# -------------------------------------------------------
echo ""
echo "=== AI StanFinder Health Check ==="
echo "Target: $BASE_URL"
echo "Time:   $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo "-----------------------------------"

# 1. Basic liveness
http_check "GET /api/health" "$BASE_URL/api/health" "200"

# 2. Response body validation
if command -v jq &>/dev/null; then
  HEALTH=$(curl -s --max-time "$TIMEOUT" "$BASE_URL/api/health" 2>/dev/null)
  STATUS_FIELD=$(echo "$HEALTH" | jq -r '.data.status' 2>/dev/null || echo "")
  if [ "$STATUS_FIELD" = "ok" ]; then
    log_ok "Health body — data.status=ok"
  else
    log_fail "Health body — data.status expected 'ok', got '$STATUS_FIELD'"
  fi
else
  log_warn "jq not installed — skipping body validation"
fi

# 3. 404 route handling
http_check "404 on unknown route" "$BASE_URL/api/nonexistent-route" "404"

# 4. Response time check (warning only)
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" --max-time "$TIMEOUT" "$BASE_URL/api/health" 2>/dev/null || echo "99")
RT_MS=$(echo "$RESPONSE_TIME * 1000" | bc 2>/dev/null || echo "?")
if (( $(echo "$RESPONSE_TIME < 1.0" | bc -l 2>/dev/null || echo 0) )); then
  log_ok "Response time — ${RT_MS}ms (target: < 1000ms)"
else
  log_warn "Response time — ${RT_MS}ms (target: < 1000ms) — investigate if sustained"
fi

# -------------------------------------------------------
# Summary
# -------------------------------------------------------
echo "-----------------------------------"
if [ "$FAILED" -eq 0 ]; then
  echo -e "${GREEN}All checks passed.${NC}"
  exit 0
else
  echo -e "${RED}One or more checks FAILED. Review output above.${NC}"
  exit 1
fi
