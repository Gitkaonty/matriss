import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Autocomplete, Box, Button, Checkbox, Chip, FormControl, MenuItem, Paper, Select, Stack, Tab, TextField, Typography } from '@mui/material';
import axios from '../../../../../config/axios';
import useAuth from '../../../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

import { FaUserShield, FaUserCog, FaUser, FaEye } from "react-icons/fa";
import { useEffect, useState } from 'react';

import RolePermissionTab from '../../../componentsTools/RolePermission/RolePermissionTab';
import CompteTab from '../../../componentsTools/RolePermission/CompteTab';

const roleStyles = {
    SuperAdmin: { color: "error", icon: <FaUserShield size={14} /> },
    Admin: { color: "warning", icon: <FaUserCog size={14} /> },
    User: { color: "primary", icon: <FaUser size={14} /> },
    Lector: { color: "default", icon: <FaEye size={14} /> },
};

const RoleChip = ({ value }) => {
    const style = roleStyles[value] || { color: "default" };

    return (
        <Chip
            label={value}
            color={style.color}
            icon={style.icon}
            sx={{ cursor: "default" }}
        />
    );
};

const RolePermission = () => {
    let tabRolePermission = "";
    if (typeof window !== 'undefined') {
        tabRolePermission = localStorage.getItem('tabRolePermission');
    }

    const { auth } = useAuth();
    const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
    const compteId = decoded.UserInfo.compteId || null;

    const [value, setValue] = useState(tabRolePermission || "1");

    const [listCompte, setListCompte] = useState([]);
    const [listSousCompte, setListSousCompte] = useState([]);
    const [listPermissionColumns, setListPermissionColumns] = useState([]);
    const [listPermissions, setListPermissions] = useState([]);
    const [listRole, setListRole] = useState([]);
    const [userPermissions, setUserPermissions] = useState([]);

    const [selectedCompteId, setSelectedCompteId] = useState(null);
    const [selectedSousCompteId, setSelectedSousCompteId] = useState([]);

    const handleChangeTAB = (event, newValue) => {
        setValue(newValue);
        localStorage.setItem('tabRolePermission', newValue);
    };

    const getAllComptes = () => {
        axios.get('/compte/getAllComptes')
            .then((response) => {
                if (response?.data?.state) {
                    const list = response.data.list;
                    setListCompte(list);

                    // Défaut sélectionné
                    const defaultCompte = list.find(c => c.id === Number(compteId)) || null;
                    setSelectedCompteId(defaultCompte);

                } else {
                    toast.error(response?.data?.message);
                }
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || err.message || "Erreur inconnue");
            });
    };

    // Récupération des sous-comptes
    const getAllSousComptesByIdCompte = () => {
        axios.post('/sous-compte/getAllSousComptesByIdCompte', {
            compteIds: [selectedCompteId?.id]
        })
            .then((response) => {
                if (response?.data?.state) {
                    setListSousCompte(response?.data?.list);
                } else {
                    toast.error(response?.data?.message);
                }
            })
            .catch((err) => {
                if (err.response && err.response.data && err.response.data.message) {
                    toast.error(err.response.data.message);
                } else {
                    toast.error(err.message || "Erreur inconnue");
                }
            })
    }

    const handleSearch = () => {
        if (selectedSousCompteId.length === 0) {
            // toast.error('Veuillez sélectionner une sous-compte s\'il vous plaît');
            return;
        }
        const sousCompteId = selectedSousCompteId.map(val => val.id);
        axios.post(`/sous-compte/getUserPermissions`, { sousCompteId })
            .then((response) => {
                if (response?.data?.state) {
                    const permissionNames = response.data.list[0]?.userpermissions.map(p => p.permission.nom) || [];
                    const list = response.data.list.map((item) => ({
                        id: item.id,
                        username: item.username,
                        role: item?.role?.id || "—",
                        ...Object.fromEntries(
                            item.userpermissions.map(p => [
                                p.permission.nom,
                                p.allowed
                            ])
                        )
                    }));
                    setUserPermissions(list);
                    setListPermissionColumns(permissionNames);
                    setListPermissions(response.data.listPermissions || []);
                    setListRole(response.data.listRoles || []);
                } else {
                    toast.error(response?.data?.message);
                }
            })
            .catch((err) => {
                if (err.response && err.response.data && err.response.data.message) {
                    toast.error(err.response.data.message);
                } else {
                    toast.error(err.message || "Erreur inconnue");
                }
            })
    }

    useEffect(() => {
        handleSearch();
    }, [selectedSousCompteId])

    useEffect(() => {
        getAllComptes();
    }, []);

    useEffect(() => {
        getAllSousComptesByIdCompte();
    }, [selectedCompteId])

    const columnRolePermissions = [
        { field: 'username', headerName: 'Utilisateur', flex: 2 },
        {
            field: 'role',
            headerName: 'Rôle',
            width: 150,
            editable: true,
            renderCell: (params) => {
                const role = listRole.find(r => r.id === params.value);
                return <RoleChip value={role?.nom || '---'} />;
            },
            renderEditCell: (params) => {
                const { id, field, value, api } = params;

                const handleChange = (e) => {
                    const newValue = e.target.value;

                    axios.post('/sous-compte/updateUserRole', {
                        userId: id,
                        roleId: newValue
                    }).catch(err => {
                        console.error(err);
                    });

                    api.setEditCellValue({ id, field, value: newValue }, e);
                    api.stopCellEditMode({ id, field });
                };

                return (
                    <Select
                        value={value}
                        onChange={handleChange}
                        size="small"
                        autoFocus
                        sx={{
                            width: '100%'
                        }}
                    >
                        {
                            listRole.map(val => {
                                return (
                                    <MenuItem value={val.id} key={val.id}>{val.nom}</MenuItem>
                                )
                            })
                        }
                    </Select>
                );
            }
        },
        ...listPermissionColumns.map(name => ({
            field: name,
            headerName: name,
            width: 130,
            type: 'boolean',
            renderCell: (params) => {
                const { id, field, value } = params;

                const handleChange = (e) => {
                    const newValue = e.target.checked;
                    setUserPermissions((prevRows) =>
                        prevRows.map((row) =>
                            row.id === id ? { ...row, [field]: newValue } : row
                        )
                    );

                    const permissionId = listPermissions.find(val => val.nom === field);

                    axios.post('/sous-compte/updateUserPermission', {
                        userId: id,
                        permissionId: permissionId.id,
                        allowed: newValue,
                    }).catch(err => {
                        console.error(err);
                    });
                };

                return <Checkbox checked={value} onChange={handleChange} />;
            }
        }))
    ];

    const columnCompte = [
        { field: 'username', headerName: 'Utilisateur', flex: 3 },
        { field: 'email', headerName: 'Email', flex: 3 },
        {
            field: 'refresh_token',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => {
                const isOnline = params.value !== null && params.value !== '';
                return (
                    <Chip
                        label={isOnline ? 'Actif' : 'Hors ligne'}
                        color={isOnline ? 'success' : 'error'}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                    />
                );
            }
        }
    ];

    return (
        <Box>
            <TabContext value={"1"} >
                <TabPanel value="1" style={{ height: '100%' }}>
                    <Stack width={"100%"} height={"100%"} spacing={1} alignItems={"flex-start"} alignContent={"flex-start"} justifyContent={"stretch"}>
                        <Typography
                            variant='h6'
                            sx={{
                                color: "black",
                                maxWidth: "100%",
                                whiteSpace: "normal",
                                wordBreak: "break-word"
                            }}
                            align='left'
                        >
                            Gestion rôle & permission
                        </Typography>
                        <Box sx={{
                            width: '100%',
                            pl: '1%'
                        }}
                        >
                            <TabContext value={value}>
                                <Box sx={{
                                    borderBottom: 1,
                                    borderColor: 'transparent',
                                }}>
                                    <TabList onChange={handleChangeTAB} aria-label="lab API tabs example" variant='scrollable'>
                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="Compte" value="1" />
                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="Rôle & Permission" value="2" />
                                    </TabList>
                                </Box>
                                <TabPanel value="1">
                                    <CompteTab
                                        rows={listSousCompte}
                                        columns={columnCompte}
                                    />
                                </TabPanel>
                                <TabPanel value="2">
                                    <RolePermissionTab
                                        listCompte={listCompte}
                                        listSousCompte={listSousCompte}
                                        setSelectedCompteId={setSelectedCompteId}
                                        setSelectedSousCompteId={setSelectedSousCompteId}
                                        setUserPermissions={setUserPermissions}
                                        userPermissions={userPermissions}
                                        selectedCompteId={selectedCompteId}
                                        selectedSousCompteId={selectedSousCompteId}
                                        columns={columnRolePermissions}
                                    />
                                </TabPanel>
                            </TabContext>
                        </Box>
                    </Stack>
                </TabPanel>
            </TabContext>
        </Box>
    )
}

export default RolePermission