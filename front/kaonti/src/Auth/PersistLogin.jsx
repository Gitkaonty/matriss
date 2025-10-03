import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useRefreshToken from "../hooks/useRefreshToken";
import useAuth from "../hooks/useAuth";
import { Box, CircularProgress } from "@mui/material";

const PersistLogin = () => {
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const refresh = useRefreshToken();
    const { auth } = useAuth();

    useEffect(() => {
        const verifyRefreshToken = async () => {
            try {
                await refresh();
            } catch (err) {
                navigate('/');
            } finally {
                setIsLoading(false);
            }
        };

        !auth?.accessToken ? verifyRefreshToken() : setIsLoading(false);
    }, []);

    return (
        <>
            {
                isLoading ? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100vw",
                            height: "100vh"
                        }}
                    >
                        <CircularProgress size={50} color="success" />
                    </Box>
                ) : (
                    <Outlet />
                )
            }
        </>
    );
};

export default PersistLogin;
