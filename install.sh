#!/bin/sh

set -eu

INSTALLER_VERSION="v2"
REPO_URL="https://github.com/newfreebitcoins/newfreebitcoins-mono.git"
INSTALL_DIR="${INSTALL_DIR:-$HOME/.local/bin}"
TMP_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "$TMP_DIR"
}

trap cleanup EXIT INT TERM

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "error: required command not found: $1" >&2
    exit 1
  fi
}

require_command git
require_command cargo
require_command mktemp

echo "==> New Free Bitcoins CLI installer ${INSTALLER_VERSION}"
echo "==> Cloning newfreebitcoins-mono"
git clone --depth 1 "$REPO_URL" "$TMP_DIR/repo"

echo "==> Installing donor CLI with Cargo"
cd "$TMP_DIR/repo"
cargo install --path apps/donor-cli --root "$TMP_DIR/install-root"

find_installed_binary() {
  for candidate in \
    "$TMP_DIR/install-root/bin/donor-cli" \
    "$TMP_DIR/install-root/bin/donor-cli.exe"
  do
    if [ -f "$candidate" ]; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done

  return 1
}

INSTALLED_BINARY="$(find_installed_binary || true)"

if [ -z "$INSTALLED_BINARY" ]; then
  echo "error: could not find installed donor-cli binary after cargo install" >&2
  exit 1
fi

echo "==> Installing newfreebitcoins"
mkdir -p "$INSTALL_DIR"
cp "$INSTALLED_BINARY" "$INSTALL_DIR/newfreebitcoins"
chmod +x "$INSTALL_DIR/newfreebitcoins"

echo
echo "Installed: $INSTALL_DIR/newfreebitcoins"

case ":$PATH:" in
  *":$INSTALL_DIR:"*)
    ;;
  *)
    echo
    echo "Add this to your shell profile if needed:"
    echo "  export PATH=\"$INSTALL_DIR:\$PATH\""
    ;;
esac

echo
echo "Run it with:"
echo "  newfreebitcoins --help"
