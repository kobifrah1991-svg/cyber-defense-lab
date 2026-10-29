// Playable characters (display names: i18n keys char.<id> and char.<id>.role). To use your own models, put the .glb files in public/models/characters/
// and point `file` at them. Models rigged with Mixamo bones get walk/run animation and hands on the gun.
export const CHARACTERS = [
  { id: 'assault', file: 'Soldier.glb', tint: null },
  { id: 'ranger', file: 'Soldier.glb', tint: 0x4f6b3a },
  { id: 'urban', file: 'Soldier.glb', tint: 0x3a4250 },
];

export const characterById = (id) => CHARACTERS.find((c) => c.id === id) || CHARACTERS[0];
