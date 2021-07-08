export const relationships = {
  users: [
    {
      relation: 'hasMany',
      entity: 'tickets',
      primaryKeyName: '_id',
      foreignKeyName: 'assignee_id',
      foreignFieldName: 'tickets',
      valueFromField: 'subject',
    },
  ],
  tickets: [
    {
      relation: 'belongsTo',
      entity: 'users',
      primaryKeyName: '_id',
      foreignKeyName: 'assignee_id',
      foreignFieldName: 'assignee_name',
      valueFromField: 'name',
    },
  ],
};
