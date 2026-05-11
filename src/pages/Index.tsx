import { FamilistApp } from '@/familist/FamilistApp';
import { useAuthSession } from '@/components/ProtectedRoute';

const Index = () => {
  const { session } = useAuthSession();
  if (!session) return null; // ProtectedRoute already handles redirect
  return <FamilistApp userId={session.user.id} />;
};

export default Index;
