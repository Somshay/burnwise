#!/bin/bash
# Creates a LOCAL dev CA + server certificate so phones on the same Wi-Fi can load https://<LAN-IP>:3000
# (browsers only allow GPS on HTTPS). Nothing is added to this Mac's trust store.
# The CA is name-constrained to localhost and 192.168.x.x so trusting it on a phone cannot be abused for other sites.
# Usage: scripts/gen-dev-cert.sh [LAN_IP]   (defaults to this Mac's Wi-Fi IP)
set -euo pipefail
cd "$(dirname "$0")/.."
IP="${1:-$(ipconfig getifaddr en0 || ipconfig getifaddr en1)}"
[ -n "$IP" ] || { echo "Could not detect LAN IP; pass it as an argument." >&2; exit 1; }
mkdir -p certs dev-ca-public
umask 077
cd certs

if [ ! -f ca.pem ]; then
  cat > ca.cnf <<CNF
[req]
distinguished_name=dn
x509_extensions=v3
prompt=no
[dn]
CN=BurnWise Dev CA (local only)
[v3]
basicConstraints=critical,CA:TRUE,pathlen:0
keyUsage=critical,keyCertSign,cRLSign
subjectKeyIdentifier=hash
nameConstraints=critical,permitted;DNS:localhost,permitted;IP:127.0.0.0/255.0.0.0,permitted;IP:192.168.0.0/255.255.0.0
CNF
  openssl req -x509 -newkey rsa:2048 -nodes -keyout ca-key.pem -out ca.pem -days 825 -config ca.cnf
fi

cat > leaf.cnf <<CNF
[req]
distinguished_name=dn
prompt=no
[dn]
CN=BurnWise dev server
CNF
cat > leaf.ext <<CNF
basicConstraints=CA:FALSE
keyUsage=critical,digitalSignature,keyEncipherment
extendedKeyUsage=serverAuth
subjectAltName=DNS:localhost,IP:127.0.0.1,IP:$IP
CNF
openssl req -newkey rsa:2048 -nodes -keyout dev-key.pem -out dev.csr -config leaf.cnf
openssl x509 -req -in dev.csr -CA ca.pem -CAkey ca-key.pem -CAcreateserial -out dev.pem -days 397 -extfile leaf.ext
rm -f dev.csr
cp ca.pem ../dev-ca-public/burnwise-dev-ca.crt   # public cert only, for installing on the phone
openssl verify -CAfile ca.pem dev.pem
echo "Server cert covers: localhost, 127.0.0.1, $IP"
