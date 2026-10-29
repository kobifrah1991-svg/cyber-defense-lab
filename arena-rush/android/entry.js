// APK entry: offline practice mode, everything bundled (no network needed).
// Models are embedded as data: URLs because a WebView can't fetch() file:// assets.
import maleA from '../public/models/characters/Military_Male_01.glb';
import maleB from '../public/models/characters/Military_Male_02.glb';
import female from '../public/models/characters/Military_Female_01.glb';
import mIdle from '../public/models/anims/m_idle_neutral_01.glb';
import mWalk from '../public/models/anims/m_walk_neutral_01.glb';
import mRun from '../public/models/anims/m_run_neutral_01.glb';
import fIdle from '../public/models/anims/f_idle_neutral_01.glb';
import fWalk from '../public/models/anims/f_walk_neutral_01.glb';
import fRun from '../public/models/anims/f_run_neutral_01.glb';
import rifle from '../public/models/weapons/rifle.glb';
import shotgun from '../public/models/weapons/shotgun.glb';
import sniper from '../public/models/weapons/sniper.glb';
import pistol from '../public/models/weapons/pistol.glb';
import knife from '../public/models/weapons/knife.glb';

window.ARENA_OFFLINE = true;
window.ARENA_MODELS = {
  'characters/Military_Male_01.glb': maleA,
  'characters/Military_Male_02.glb': maleB,
  'characters/Military_Female_01.glb': female,
  'anims/m_idle_neutral_01.glb': mIdle,
  'anims/m_walk_neutral_01.glb': mWalk,
  'anims/m_run_neutral_01.glb': mRun,
  'anims/f_idle_neutral_01.glb': fIdle,
  'anims/f_walk_neutral_01.glb': fWalk,
  'anims/f_run_neutral_01.glb': fRun,
  'weapons/rifle.glb': rifle,
  'weapons/shotgun.glb': shotgun,
  'weapons/sniper.glb': sniper,
  'weapons/pistol.glb': pistol,
  'weapons/knife.glb': knife,
};
import('../public/client.js');
