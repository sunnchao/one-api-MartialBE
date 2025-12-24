import { useSelector } from 'react-redux';

export default function useIsAdmin() {
  const user = useSelector((state: any) => state.account.user);
  if (!user) return false;
  return user.role >= 10;
}
