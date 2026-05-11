import { HometickApp } from '@/hometick/HometickApp';
import { useAuthSession } from '@/components/ProtectedRoute';

const Index = () => {
  const { session } = useAuthSession();
  if (!session) return null; // ProtectedRoute already handles redirect
  return <HometickApp userId={session.user.id} />;
};

export default Index;
