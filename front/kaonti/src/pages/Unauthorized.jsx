import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const Unauthorized = () => {
    const navigate = useNavigate();

    const goBack = () => navigate(-1);

    return (
        <Box
            sx={{
                width: '95vw',
                height: '94vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: 2,
            }}
        >
            <LockOutlinedIcon color="warning" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h3" gutterBottom>
                Accès non autorisé
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
                Vous n'avez pas la permission d'accéder à cette page.
            </Typography>
            <Button
                variant="contained"
                sx={{ mt: 1 }}
                style={{
                    textTransform: 'none',
                    outline: 'none',
                }}
                onClick={goBack}
            >
                Retour en arrière
            </Button>
        </Box>
    );
};

export default Unauthorized;
