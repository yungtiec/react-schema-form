export const get = (path, initialObject) =>
  path.reduce((object, key) => object[key], initialObject);

const isNumber = input => isFinite(input) && !isNaN(input);

export const toIdSchema = ({
  schema,
  parentIdSchema,
  name,
  index,
  idPrefix = 'root'
}) => {
  const separator = '_';
  const arrayItem = isNumber(index);
  const idSchema = parentIdSchema
    ? {
      $id: parentIdSchema.$id + separator + (arrayItem ? index : name),
      $path: [...parentIdSchema.$path, arrayItem ? `#${index}` : name]
    }
    : {
      $id: idPrefix,
      $path: []
    };

  if (schema.type === 'object') {
    Object.keys(schema.properties).forEach(prop => {
      idSchema[prop] = toIdSchema({
        name: prop,
        schema: schema.properties[prop],
        parentIdSchema: idSchema
      });
    });
  }

  return idSchema;
};
