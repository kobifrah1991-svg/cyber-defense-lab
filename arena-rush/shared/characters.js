// Playable characters. To use your own models, put the .glb files in public/models/characters/
// and point `file` at them. Models rigged with Mixamo bones get walk/run animation and hands on the gun.
export const CHARACTERS = [
  { id: 'assault', name: 'לוחם סער', role: 'מאוזן · מתאים לכל טווח', file: 'Soldier.glb', tint: null },
  { id: 'ranger', name: 'סייר יער', role: 'הסוואה ירוקה · צלף', file: 'Soldier.glb', tint: 0x4f6b3a },
  { id: 'urban', name: 'כוח עירוני', role: 'מדים כהים · קרב צמוד', file: 'Soldier.glb', tint: 0x3a4250 },
];

export const characterById = (id) => CHARACTERS.find((c) => c.id === id) || CHARACTERS[0];
