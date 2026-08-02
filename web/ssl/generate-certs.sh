#!/bin/sh
# Generate self-signed SSL certificates for local/development HTTPS.
# For production, replace these with certificates from a trusted CA (e.g. Let's Encrypt).

set -e

CERT_DIR="$(dirname "$0")"
CERT_FILE="$CERT_DIR/cert.pem"
KEY_FILE="$CERT_DIR/key.pem"

mkdir -p "$CERT_DIR"

if [ -f "$CERT_FILE" ] && [ -f "$KEY_FILE" ]; then
    echo "SSL certificates already exist in $CERT_DIR"
    exit 0
fi

echo "Generating self-signed SSL certificates..."

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "$KEY_FILE" \
    -out "$CERT_FILE" \
    -subj "/C=ID/O=MPM/OU=IT/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1"

chmod 600 "$KEY_FILE"
chmod 644 "$CERT_FILE"

echo "Self-signed certificates generated:"
echo "  Certificate: $CERT_FILE"
echo "  Key:         $KEY_FILE"
