export const ticketsSchema = {
  _id: { type: 'string', primaryKey: true },
  created_at: { type: 'string' },
  type: { type: 'string' },
  subject: { type: 'string' },
  assignee_id: { type: 'number' },
  tags: { type: 'array' },
};
