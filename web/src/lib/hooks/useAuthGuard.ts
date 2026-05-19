import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { APP_ROUTES, API_ROUTES } from '@shared/constants';
import { UserRole } from '@shared/enums';

export function useAuthGuard(requiredRole?: UserRole) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      try {
        const res = await fetch(API_ROUTES.AUTH.ME);
        if (res.ok) {
          const data = await res.json();
          if (active) {
            if (data.user) {
              if (requiredRole && data.user.role !== requiredRole) {
                router.push(APP_ROUTES.LOGIN);
              } else {
                setCurrentUser(data.user);
              }
            } else {
              router.push(APP_ROUTES.LOGIN);
            }
          }
        } else {
          if (active) {
            router.push(APP_ROUTES.LOGIN);
          }
        }
      } catch (err) {
        console.error('Lỗi kiểm tra quyền truy cập:', err);
        if (active) {
          router.push(APP_ROUTES.LOGIN);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      active = false;
    };
  }, [router, requiredRole]);

  return { currentUser, loading };
}
