import DbuActorBase from './base-actor.mjs';

export default class DbuCharacter extends DbuActorBase {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    'DBU.Actor.Character',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.attributes = new fields.SchemaField({
      level: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 1 }),
        max: new fields.NumberField({ ...requiredInteger, initial: 30 }),
      }),
      holdingBackAmount: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 1 })
      }),
    });

    // Iterate over ability names and create a new SchemaField for each.
    schema.abilities = new fields.SchemaField(
      Object.keys(CONFIG.DBU.abilities).reduce((obj, ability) => {
        obj[ability] = new fields.SchemaField({
          value: new fields.NumberField({
            ...requiredInteger,
            initial: 1,
            min: 1,
          }),
        });
        return obj;
      }, {})
    );

    schema.skills = new fields.SchemaField(
      Object.entries(CONFIG.DBU.skills).reduce((obj, [skill, props]) => {
        obj[skill] = new fields.SchemaField({
          value: new fields.NumberField({
            initial: 0
          }),
          rank: new fields.NumberField({
            initial: 0,
            min: 0,
          }),
        });
        return obj;
      }, {})
    );

    schema.thresholds = new fields.SchemaField({
      hasPassedBruised: new fields.SchemaField({
        value: new fields.BooleanField({ initial: false }),
      }),
      hasPassedInjured: new fields.SchemaField({
        value: new fields.BooleanField({ initial: false }),
      }),
      hasPassedCritical: new fields.SchemaField({
        value: new fields.BooleanField({ initial: false }),
      }),
    });

    return schema;
  }

  prepareBaseData() {

    this.attributes.level.value = Math.min(this.attributes.level.value, this.attributes.level.max);

    this.baseTierOfPower = Math.ceil((this.attributes.level.value + 1) / 5);

    this.tierOfPower = Math.max(this.baseTierOfPower - this.attributes.holdingBackAmount.value, 1);

    this.holdingBackMax = this.attributes.holdingBackAmount.value == this.baseTierOfPower;

    // Tier of Power

    // Maximum for a score
    this.maxStat = 8 + 3 * (this.tierOfPower - 1)

    // Loop through ability scores, and add their modifiers to our sheet output.
    for (const key in this.abilities) {
      // Make sure the scores do not surpass the allowed maximum
      this.abilities[key].value = Math.min(this.abilities[key].value, this.maxStat);
      // Calculate the modifier using d10 rules.
      this.abilities[key].mod = this.abilities[key].value;
      // Handle ability label localization.
      this.abilities[key].label =
        game.i18n.localize(CONFIG.DBU.abilities[key]) ?? key;
    }

    // Resources Max Calculation

    this.health.max = 60 + this.abilities.tenacity.value * (this.attributes.level.value) + 12 * (this.attributes.level.value - 1);

    this.health.value = Math.min(this.health.value, this.health.max);

    this.ki.max = 50 + 12 * (this.attributes.level.value - 1);

    this.ki.value = Math.min(this.ki.value, this.ki.max);

    this.capacity.max = 20 + 4 * (this.attributes.level.value - 1);

    this.capacity.value = Math.min(this.capacity.value, this.capacity.max);

    // Health Thresholds

    this.currentHealthThreshold =
      this.health.value > Math.floor(this.health.max / 2) ? 'Healthy' :
        this.health.value > Math.floor(this.health.max / 4) ? 'Bruised' :
          this.health.value > Math.floor(this.health.max / 10) ? 'Injured' :
            'Critical';

    this.steadfastDice = 'd10';

    this.belowBruised = this.health.value <= Math.floor(this.health.max / 2) ? true : false;

    this.belowBruisedEffects = this.belowBruised;

    this.belowInjured = this.health.value <= Math.floor(this.health.max / 4) ? true : false;

    this.belowInjuredEffects = this.belowInjured;

    this.belowCritical = this.health.value <= Math.floor(this.health.max / 10) ? true : false;

    this.belowCriticalEffects = this.belowCritical;

    this.thresholdsDebuff = 0;

    if (this.belowCritical && !this.thresholds.hasPassedCritical.value) {
      this.thresholdsDebuff = 3;
    } else if (this.belowInjured && !this.thresholds.hasPassedInjured.value) {
      this.thresholdsDebuff = 2;
    } else if (this.belowBruised && !this.thresholds.hasPassedBruised.value) {
      this.thresholdsDebuff = 1;
    }

    this.thresholdsCombatRollsDebuff = this.baseTierOfPower * this.thresholdsDebuff;

    // Agility Aptitudes

    this.haste = Math.floor(this.abilities.agility.mod / 2);

    this.defenseValue = this.abilities.agility.mod;

    this.normalSpeed = 2 + Math.floor(this.abilities.agility.mod / 2);

    this.boostedSpeed = 2 + this.abilities.agility.mod;

    this.initiative = Math.floor(this.abilities.agility.value / 2);

    this.initiativeDice = `d10+${this.initiative}`;

    // Force Aptitudes

    this.might = Math.max(this.abilities.force.mod, this.abilities.magic.mod); // Also magic, no need to declare it twice.

    this.mightForClash = this.might;

    this.surgency = this.abilities.force.mod;

    this.superStacks = Math.max(Math.min(Math.floor((this.abilities.force.value - this.abilities.agility.value) / 5), 3), 0)

    // Tenacity Aptitudes

    this.soak = Math.max(this.tierOfPower, this.abilities.tenacity.mod);

    // Scholarship

    this.giftedStudent = Math.floor(this.abilities.scholarship.value / 2);

    this.skillChecks = Math.min(Math.floor(this.abilities.scholarship.value / 4), this.baseTierOfPower * 2);

    // Insight Aptitudes

    this.awareness = this.abilities.insight.mod;

    // Personality Aptitudes

    this.determination = Math.floor(this.abilities.personality.value / 4);

    // Saving Throws

    this.savingThrowDice = 'd10';

    this.savingThrows = {
      "impulsive": {
        "value": this.abilities.agility.value,
        "label": "Impulsive"
      },
      "cognitive": {
        "value": this.abilities.insight.value,
        "label": "Cognitive"
      },
      "corporeal": {
        "value": this.abilities.tenacity.value,
        "label": "Corporeal"
      },
      "morale": {
        "value": this.abilities.personality.value,
        "label": "Impulsive"
      },
    }

    // Combat Rolls

    this.strike = Math.max(this.haste + this.awareness - (this.holdingBackMax ? this.baseTierOfPower : 0) - this.thresholdsCombatRollsDebuff, 0);

    this.dodge = Math.max(this.defenseValue - (this.holdingBackMax ? this.baseTierOfPower : 0) - this.thresholdsCombatRollsDebuff, 0);

    this.physicalWound = Math.max(this.abilities.force.mod - (this.holdingBackMax ? this.baseTierOfPower : 0) - this.thresholdsCombatRollsDebuff, 0);

    this.energyWound = Math.max(this.abilities.force.mod - (this.holdingBackMax ? this.baseTierOfPower : 0) - this.thresholdsCombatRollsDebuff, 0);

    this.magicWound = Math.max(this.abilities.magic.mod - (this.holdingBackMax ? this.baseTierOfPower : 0) - this.thresholdsCombatRollsDebuff, 0);

    // Skills

    for (const key in this.skills) {

      this.skills[key].rank = Math.min(this.skills[key].rank, this.baseTierOfPower + 1);

      this.skills[key].value = Math.floor(this.abilities[CONFIG.DBU.skills[key]].value / 2) + this.skillChecks + this.skills[key].rank * 2;

    }

    this.healingSurgeDice = `${this.tierOfPower * 2}d10+${this.surgency}`;

    this.powerSurgeAmount = Math.floor(this.ki.max / 4) + this.surgency;

    this.damageReduction = 0;

  }

  prepareDerivedData() {



  }

  getRollData() {
    const data = {};

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (this.abilities) {
      for (let [k, v] of Object.entries(this.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    data.lvl = this.attributes.level.value;

    return data;
  }
}
