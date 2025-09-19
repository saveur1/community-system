import Footer from '@/components/layouts/main-footer/main-footer'
import MainHeader from '@/components/layouts/main-header'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(home-routes)')({
  component: RouteComponent,
})

function RouteComponent() {
  return <>
    <MainHeader />
    <Outlet />
    <Footer />
  </>
}
