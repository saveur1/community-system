import Footer from '@/components/layouts/main-footer/main-footer'
import MainHeader from '@/components/layouts/main-header'
import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { Capacitor } from '@capacitor/core'
import useAuth from '@/hooks/useAuth'
import { authUtils } from '@/lib/auth'

export const Route = createFileRoute('/auth')({
    // Redirect authenticated users to dashboard
    beforeLoad: async ({ context }) => {
        return await authUtils.requireGuest(context.queryClient);
    },
    component: RouteComponent,
})

function RouteComponent() {
    const isCapacitor = Capacitor.isNativePlatform();
    const { user } = useAuth();

    if (isCapacitor && user) {
        return <Navigate to="/dashboard" />
    }
    return (
        <>
            <MainHeader />
            <Outlet />
            <Footer />
        </>
    )
}
