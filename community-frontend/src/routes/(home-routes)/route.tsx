import Footer from '@/components/layouts/main-footer/main-footer'
import MainHeader from '@/components/layouts/main-header'
import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { Capacitor } from '@capacitor/core';
import useAuth from '@/hooks/useAuth';

export const Route = createFileRoute('/(home-routes)')({
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
