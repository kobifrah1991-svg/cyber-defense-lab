// Playable characters (display names: i18n keys char.<id> and char.<id>.role). To use your own models, put the .glb files in public/models/characters/
// and point `file` at them. Models rigged with Mixamo bones get walk/run animation and hands on the gun.
// Rocketbox avatars (Microsoft, MIT) with Rocketbox idle/walk/run clips; see public/models/CREDITS.md
const MALE = { Idle: 'anims/m_idle_neutral_01.glb', Walk: 'anims/m_walk_neutral_01.glb', Run: 'anims/m_run_neutral_01.glb' };
const FEMALE = { Idle: 'anims/f_idle_neutral_01.glb', Walk: 'anims/f_walk_neutral_01.glb', Run: 'anims/f_run_neutral_01.glb' };
export const CHARACTERS = [
  { id: 'assault', file: 'characters/Military_Male_01.glb', anims: MALE, flip: true, tint: null },
  { id: 'ranger', file: 'characters/Military_Male_02.glb', anims: MALE, flip: true, tint: null },
  { id: 'urban', file: 'characters/Military_Female_01.glb', anims: FEMALE, flip: true, tint: null },
];

export const characterById = (id) => CHARACTERS.find((c) => c.id === id) || CHARACTERS[0];
