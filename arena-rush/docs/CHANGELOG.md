# Changelog

## 2026-10-29 (0.7.0)
- Reconnect: a player who drops can return within 30 s to the same seat, keeping kills and team.
- Economy and cosmetic shop: server-side accounts (credits, XP, level, inventory), idempotent purchases, rewards from server match results, Owner `givemoney`.
- Windows desktop build (Electron).
- Store release runbook (Steam, Google Play) and privacy policy template.
- Realistic Rocketbox soldiers (MIT) and CC0 PBR weapons; crosshair stays visible while aiming (except the sniper scope).
- APK 0.7.

## 2026-10-29
- Knife (key 5): server-validated melee arc with line of sight; backstab kills instantly.
- Team modes 1v1 and 2v2 with a lobby (team choice, ready, countdown), team spawn sides, no friendly fire, team score HUD; a team that empties mid-match forfeits.
- APK 0.5.
- Four interface languages (he/en/ru/ar). Server sends message keys; each client translates. Language switch in-game without disconnecting.
- Admin system: roles from verified identity or operator code, server-side permission checks, audit log, rate limit, bans, in-game admin panel (F2).
- Start screen: player name, 3 characters with 3D preview, server list with ping and player counts.
- Fix: lobby quick-match message clashed with in-room quick chat.
- Bans for signed-in players apply to the account, not the shared IP.
- Tracking docs: PROJECT_STATUS, TASKS, ADMIN_GUIDE, LOCALIZATION, SERVER_SETUP.

## 2026-10-28
- Browser FPS with multiplayer, bots and filtered chat; offline practice mode; Android APK.
- Daylight arena, procedural textures, animated soldier model, CC0 weapon models.
- Rooms, quick match, private rooms, Gmail invites, optional Google sign-in.
- Unity 6 scripts (compile-checked, not run in Unity).
