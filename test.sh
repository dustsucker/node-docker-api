#! /bin/bash
set -euo pipefail

docker pull ubuntu:latest
npm run lint
npm run build
npm run test:ava --timeout 30000 test