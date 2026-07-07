# DFM Output Platform Pro v2

Production-ready React + Vite dashboard for Output reporting.

## Data source
Google Sheet ID: `1dxNnhgPRjO1Fw53ClaHxXeE64Xm4Im1xARuCx7JNzDU`

Sheets used:
- `ALL_DATA.outputOEE` main dashboard data
- `Order.outputSAP`
- `ORDER`

Set Google Sheet permission to **Anyone with the link → Viewer**.

## Deploy on Vercel
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

## Admin
Initial admin email: `mastersunlove@gmail.com`

## Notes
Data Entry Form stores manual rows in local browser storage in this phase. For organization-wide write-back, connect Supabase or Google Apps Script API in the next phase.
