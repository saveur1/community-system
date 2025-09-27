import Footer from '@/components/layouts/main-footer/main-footer'
import MainHeader from '@/components/layouts/main-header'
import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { Capacitor } from '@capacitor/core';
import useAuth from '@/hooks/useAuth';
import { authUtils } from '@/lib/auth';

export const Route = createFileRoute('/(home-routes)')({
  // Public routes - get auth context without redirects
  beforeLoad: async ({ context }) => {
    return await authUtils.getAuthContext(context.queryClient);
  },
  component: RouteComponent,
})

function RouteComponent() {
  const isCapacitor = Capacitor.isNativePlatform();
  const { user } = useAuth();

  if(isCapacitor && user){
    return <Navigate to="/dashboard" />
  }
  
  return <>
    <MainHeader />
    <Outlet />
    <Footer />
  </>
}
