// APK entry: offline practice mode, everything bundled (no network needed).
// Models are embedded as data: URLs because a WebView can't fetch() file:// assets.
import soldier from '../public/models/Soldier.glb';
import rifle from '../public/models/weapons/rifle.glb';
import shotgun from '../public/models/weapons/shotgun.glb';
import sniper from '../public/models/weapons/sniper.glb';
import pistol from '../public/models/weapons/pistol.glb';

window.ARENA_OFFLINE = true;
window.ARENA_MODELS = {
  'Soldier.glb': soldier,
  'weapons/rifle.glb': rifle,
  'weapons/shotgun.glb': shotgun,
  'weapons/sniper.glb': sniper,
  'weapons/pistol.glb': pistol,
};
import('../public/client.js');
