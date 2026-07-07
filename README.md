# DFM Output Platform Pro

Executive Output Dashboard for DFM Intelligence Platform.

## Data Source
Reads live CSV from Google Sheet:
- `ALL_DATA.outputOEE` = primary dashboard data
- `Order.outputSAP` = auxiliary order data for next phase
- `ORDER` = auxiliary order master for next phase

Spreadsheet ID is configured in:

```txt
src/config/appConfig.js
```

## Important Google Sheet permission
Set Google Sheet permission:

```txt
Share → Anyone with the link → Viewer
```

Otherwise browser cannot fetch live CSV.

## GitHub Upload
Upload files/folders inside this folder, not the ZIP file:

```txt
src/
public/
api/
supabase/
index.html
package.json
vite.config.js
vercel.json
README.md
```

## Vercel Deploy Settings
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## Login
V1 login is local email login.

Default Admin:

```txt
mastersunlove@gmail.com
```

Other emails become Viewer by default. For production, use the included Supabase schema and Supabase Auth.

## Features
- Responsive Executive Dashboard
- Email login / role-ready architecture
- Google Sheet live fetch with cache busting
- Auto refresh every 60 seconds
- Date / Month / Line / Shift / Menu filters
- KPI Cards: Output, Order, Achievement, Gap, CN, Records
- Trend by date with target line
- Line ranking
- Top menu ranking
- Negative gap focus
- Daily line traffic light matrix
- Raw Data table
- Data Entry page via browser LocalStorage
- Upload CSV preview page
- Settings and User Management placeholder

## Next Production Upgrade
For real multi-user web-entry and audit logs:
1. Create Supabase project
2. Run `supabase/schema.sql`
3. Connect Supabase Auth
4. Move web entries from LocalStorage to `output_entries`
5. Add RLS policies by role
