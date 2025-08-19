import useAuth from "@/hooks/useAuth";
import FullPageLoader from "./full-page-loader";
import { Outlet } from "@tanstack/react-router";

function AuthLoader() {
    const { isUserLoading } = useAuth();

    if(isUserLoading){
        return <FullPageLoader />
    }

    return <Outlet />
}

export default AuthLoader;