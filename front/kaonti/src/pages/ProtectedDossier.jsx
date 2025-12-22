import { useParams, Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAxiosPrivate from '../../config/axiosPrivate';

export default function ProtectedDossier({ type }) {
    const { id } = useParams();
    const [access, setAccess] = useState(null);
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const verifyAccess = () => {
            try {
                axiosPrivate.get(`/home/checkAccessDossier/${id}`).then((response) => {
                    if (response?.data?.state) {
                        setAccess(true);
                    } else {
                        setAccess(false);
                    }
                })
            } catch {
                setAccess(false);
            }
        };

        verifyAccess();
    }, [id]);

    if (access === false) return <Navigate to="/tab/unauthorized-dossier" replace />;

    return <Outlet />;
}
