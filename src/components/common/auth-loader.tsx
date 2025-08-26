import useAuth from "@/hooks/useAuth";
import FullPageLoader from "./full-page-loader";
import { Outlet } from "@tanstack/react-router";
import { useEffect } from "react";

function AuthLoader() {
    const { isUserLoading, refreshUser } = useAuth();
    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    if (isUserLoading) {
        return <FullPageLoader />
    }

    return <Outlet />
}

export default AuthLoader;