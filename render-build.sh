#!/usr/bin/env bash
set -e
(cd storefront && npm install --include=dev && npm run build)
(cd admin && npm install --include=dev && npm run build)
(cd backend && npm install)
