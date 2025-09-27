import useAuth from "@/hooks/useAuth";
import FullPageLoader from "./full-page-loader";
import { Outlet } from "@tanstack/react-router";
import { tokenManager } from "@/lib/auth";
// Note: avoid triggering refetch loops here

function AuthLoader() {
    const { isUserLoading, user } = useAuth();

    // If we have a token but user is loading, show loader
    // If no token, the route guard should have already redirected
    if (tokenManager.hasToken() && isUserLoading && !user) {
        return <FullPageLoader />
    }

    return <Outlet />
}

export default AuthLoader;