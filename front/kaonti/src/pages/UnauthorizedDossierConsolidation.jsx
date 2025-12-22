import LockIcon from '@mui/icons-material/Lock';

const UnauthorizedDossierConsolidation = () => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '90vh',
                textAlign: 'center',
                margin: 0,
                padding: 0,
                backgroundColor: '#f5f5f5',
            }}
        >
            <LockIcon style={{ fontSize: 60, color: '#f44336', marginBottom: 20 }} />

            <h2 style={{ margin: 0, fontSize: '2rem', color: '#333' }}>
                La consolidation de ce dossier est désactivé
            </h2>

            <p style={{ marginTop: 10, fontSize: '1rem', color: '#666' }}>
                Veuillez l'activer dans le paramétrage CRM.
            </p>
        </div>
    );
}

export default UnauthorizedDossierConsolidation