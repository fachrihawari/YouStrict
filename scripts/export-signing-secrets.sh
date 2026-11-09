#!/usr/bin/env bash
# Prints the `gh secret set` commands for the Gradle release workflow, using the
# keystore that `eas credentials` wrote to credentials/.
#
#   bash scripts/export-signing-secrets.sh
#
# The values are read from credentials.json and piped straight into gh; nothing
# is echoed to the terminal. Requires the GitHub CLI, logged in.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

if [ ! -f credentials.json ]; then
  echo "credentials.json not found. Run: bunx eas-cli credentials -p android" >&2
  echo "then choose 'credentials.json: Upload/Download' -> 'Download credentials from EAS'." >&2
  exit 1
fi

eval "$(python3 - <<'PY'
import json
k = json.load(open('credentials.json'))['android']['keystore']
print(f"KEYSTORE_PATH={k['keystorePath']}")
print(f"KEY_ALIAS={k['keyAlias']}")
PY
)"

if [ ! -f "$KEYSTORE_PATH" ]; then
  echo "Keystore not found at $KEYSTORE_PATH" >&2
  exit 1
fi

base64 -w0 "$KEYSTORE_PATH" | gh secret set ANDROID_KEYSTORE_BASE64
python3 -c "import json;print(json.load(open('credentials.json'))['android']['keystore']['keystorePassword'])" \
  | gh secret set ANDROID_KEYSTORE_PASSWORD
printf '%s' "$KEY_ALIAS" | gh secret set ANDROID_KEY_ALIAS
python3 -c "import json;print(json.load(open('credentials.json'))['android']['keystore']['keyPassword'])" \
  | gh secret set ANDROID_KEY_PASSWORD

echo "Set ANDROID_KEYSTORE_BASE64, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD."
gh secret list | grep '^ANDROID_' || true
