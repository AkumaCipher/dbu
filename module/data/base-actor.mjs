export default class DbuActorBase extends foundry.abstract
  .TypeDataModel {
  static LOCALIZATION_PREFIXES = ["DBU.Actor.base"];

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    schema.health = new fields.SchemaField({
      value: new fields.NumberField({
        ...requiredInteger,
        initial: 60,
        min: 0
      }),
      max: new fields.NumberField({ ...requiredInteger, initial: 60 }),
    });

    schema.ki = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 50, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 50 }),
    });

    schema.capacity = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 20, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 20 }),
    });

    schema.biography = new fields.HTMLField();

    return schema;
  }
}
