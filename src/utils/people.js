// The person on the other side of a relationship from the viewer.
// Items fresh from a create call carry only { title, type }, so everything is optional.
export const otherPerson = (relationship, userId) => {
  if (!relationship) return undefined;
  return relationship.initiator?._id === userId ? relationship.partner : relationship.initiator;
};

export const relationshipLabel = (relationship, userId) => {
  const other = otherPerson(relationship, userId);
  const name = other ? `${other.firstName ?? ''} ${other.lastName ?? ''}`.trim() : '';
  return name ? `${relationship?.title} with ${name}` : relationship?.title ?? '';
};
