# DFM Output Platform Pro v1.0

Executive Output Dashboard for DFM Intelligence Platform.

## Features
- React + Vite + Recharts
- Google Sheet live CSV connection
- Default Admin: `mastersunlove@gmail.com`
- Output Target: 100%
- Buffer: >=80%
- Auto refresh every 60 seconds
- Responsive dashboard for desktop and mobile
- Data Entry page (local storage in V1)
- Upload page placeholder
- Raw data view
- Settings page

## Google Sheet Source
Spreadsheet ID:
`1dxNnhgPRjO1Fw53ClaHxXeE64Xm4Im1xARuCx7JNzDU`

Primary sheet gid used in V1:
`649828711`

Make sure Google Sheet is shared as:
`Anyone with the link -> Viewer`

## Deploy to Vercel
1. Upload all files/folders in this project to GitHub.
2. Go to Vercel > New Project.
3. Import the GitHub repo.
4. Framework: Vite.
5. Build command: `npm run build`.
6. Output directory: `dist`.
7. Click Deploy.

## Notes
If live data cannot load, the dashboard shows DEMO FALLBACK data. This means Google Sheet permission or gid must be checked.
