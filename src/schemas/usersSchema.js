export const usersSchema = {
  _id: { type: 'number', primaryKey: true },
  name: { type: 'string' },
  created_at: { type: 'string' },
  verified: { type: 'boolean' },
};
