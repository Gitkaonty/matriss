import { useParams, Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from '../../config/axios';

export default function ProtectedDossierConsolidation() {
    const { id } = useParams();
    const [access, setAccess] = useState(null);

    useEffect(() => {
        const getInfosIdDossier = () => {
            axios.get(`/home/FileInfos/${id}`).then((response) => {
                const resData = response.data;
                if (resData.state) {
                    setAccess(resData.fileInfos[0].consolidation);
                } else {
                    setAccess(false);
                }
            });
        };

        getInfosIdDossier();
    }, [id]);

    if (access === false) return <Navigate to="/tab/unauthorized-consolidation" replace />;

    return <Outlet />;
}
