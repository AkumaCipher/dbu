export const DBU = {};

/**
 * The set of Ability Scores used within the system.
 * @type {Object}
 */
DBU.abilities = {
  agility: 'DBU.Ability.Agility.long',
  force: 'DBU.Ability.Force.long',
  tenacity: 'DBU.Ability.Tenacity.long',
  scholarship: 'DBU.Ability.Scholarship.long',
  insight: 'DBU.Ability.Insight.long',
  magic: 'DBU.Ability.Magic.long',
  personality: 'DBU.Ability.Personality.long',
};

DBU.abilityAbbreviations = {
  agility: 'DBU.Ability.Agility.abbr',
  force: 'DBU.Ability.Force.abbr',
  tenacity: 'DBU.Ability.Tenacity.abbr',
  scholarship: 'DBU.Ability.Scholarship.abbr',
  insight: 'DBU.Ability.Insight.abbr',
  magic: 'DBU.Ability.Magic.abbr',
  personality: 'DBU.Ability.Personality.abbr',
};

DBU.skills = {
  acrobatics: "agility",
  pilot: "agility",
  thievery: "agility",
  stealth: "agility",
  craftItem: "scholarship",
  craftApparel: "scholarship",
  craftWeapons: "scholarship",
  craftVehicles: "scholarship",
  knowledgeScience: "scholarship",
  knowledgeProfession: "scholarship",
  knowledgeHistory: "scholarship",
  knowledgeDynamic: "scholarship",
  investigation: "scholarship",
  medicine: "scholarship",
  clairvoyance: "insight",
  concealment: "insight",
  creatureHandling: "insight",
  perception: "insight",
  intuition: "insight",
  survival: "insight",
  useMagic: "magic",
  bluff: "personality",
  intimidation: "personality",
  persuasion: "personality",
  performancePosing: "personality",
  performanceMusic: "personality",
  performanceDancing: "personality",
  performanceDynamic: "personality"
}