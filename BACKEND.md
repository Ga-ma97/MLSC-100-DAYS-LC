# Connecting the real backend

Frontend = static files. Open `index.html` (or host the folder anywhere). **No Node needed.**
All data access lives in `js/api.js`. Demo mode uses localStorage; to go live set
`CONFIG.API_BASE = "https://your-api.example.com"` and implement these endpoints (JSON, `Authorization: Bearer <token>`):

| Method | Path | Returns |
|---|---|---|
| POST | `/api/auth/signup` | body `{fullName,email,leetcode,college,year,password}` -> `{token,user}` |
| POST | `/api/auth/login` | body `{email,password}` -> `{token,user}` |
| GET | `/api/days` | array of 100 `{day,title,topic,difficulty,points,url?}` (`url` = direct LeetCode problem link) |
| GET | `/api/state` | `{today,completed:[dayNumbers],xp,streak,rank}` for the logged-in user |
| GET | `/api/leaderboard` | `[{rank,name,xp,streak,you?}]` sorted by xp |
| POST | `/api/sync/:day` | marks a day solved (also late solves) -> new state plus `{gained,day}` |

Errors: respond `4xx` with `{error:"message"}`; the UI shows it.

## Browser extension
Use the **same account**. The extension should sign in once (token), then after verifying an accepted LeetCode
submission call `POST /api/sync/:day`. Match the submission to the user by their **LeetCode username** captured at signup
and verify server-side (e.g. via recent accepted submissions); do not trust email alone.
