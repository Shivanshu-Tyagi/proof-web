import { useEffect, useState } from 'react';
import useRelationshipStore from '../store/relationshipStore';

// Loads the person's relationships once and says whether they have an active one yet.
// Pages that need a relationship use it to show a helpful message instead of a form that cannot work.
const useActiveRelationships = () => {
  const { relationships = [], getRelationships } = useRelationshipStore();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve(getRelationships()).finally(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, [getRelationships]);

  return { relationships, loaded, hasActive: relationships.some((r) => r.status === 'active') };
};

export default useActiveRelationships;
