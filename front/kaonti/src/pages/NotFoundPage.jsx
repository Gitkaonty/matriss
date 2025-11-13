import { Box, Typography, Button } from "@mui/material";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFoundPage = () => {
    const handleReturnLogin = () => {
        window.location.href = '/';
    }
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
            <ErrorOutlineIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h3" gutterBottom>
                Oops!
            </Typography>
            <Typography variant="h5" gutterBottom>
                Erreur 404 : Page introuvable
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
                La page que vous cherchez n'existe pas ou a été déplacée.
            </Typography>
            <Button
                onClick={handleReturnLogin}
                variant="contained"
                sx={{ mt: 1 }}
                style={{
                    textTransform: 'none',
                    outline: 'none',
                }}
            >
                {"Retour à l’authentification"}
            </Button>
        </Box>
    );
};

export default NotFoundPage;
