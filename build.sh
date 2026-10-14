#!/bin/sh
# Genera index.html (versión web para GitHub/Vercel) a partir de guia.html
V=$(date +%s)
{ echo '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'
  sed -E "s#src=\"js/([a-z-]+)\.js\"#src=\"js/\1.js?v=$V\"#g" guia.html
  echo '</body></html>'; } > index.html
