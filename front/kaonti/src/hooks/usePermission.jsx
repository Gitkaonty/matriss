import { jwtDecode } from "jwt-decode"
import useAuth from "./useAuth"

const usePermission = () => {
    const { auth } = useAuth();
    const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;

    const permission = decoded?.UserInfo?.permission || [];
    console.log('permission : ', permission)
    return {
        canAdd: permission.includes("ADD"),
        canModify: permission.includes("EDIT"),
        canDelete: permission.includes("DELETE"),
        canView: permission.includes("VIEW"),
    };
}

export default usePermission