import React, { useState, useEffect } from 'react';
import { Button, Stack, Typography, CircularProgress } from '@mui/material';
import toast from 'react-hot-toast';
import OtpInput from 'react-otp-input';
import axios from '../../../../../config/axios';

const SendAndVerifyCodeForm = ({ onVerified, id_compte, setOtp, otp, cooldown, setCooldown }) => {
    const [error, setError] = useState('');
    const [codeValidation, setCodeValidation] = useState('');
    const [codeSent, setCodeSent] = useState(false);
    const [loading, setLoading] = useState(false);

    // Décrémenter le cooldown
    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [cooldown]);

    // Envoi du code
    const handleSendCode = () => {
        try {
            setLoading(true);
            setOtp('');
            setError('');

            // Générer un code aléatoire
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const codeLength = 10;
            let code = '';
            for (let i = 0; i < codeLength; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                code += characters[randomIndex];
            }

            // Envoi à ton API
            axios.post('/sous-compte/sendCodeToEmail', { code, id_compte })
                .then((response) => {
                    if (response?.data?.state) {
                        toast.success(response?.data?.message);
                        setCodeValidation(code);
                        setCodeSent(true);
                        setCooldown(15); // ⏳ start cooldown
                    } else {
                        toast.error(response?.data?.message || "Erreur inconnue");
                    }
                    setLoading(false);
                })
                .catch((err) => {
                    if (err.response?.data?.message) {
                        toast.error(err.response.data.message);
                    } else {
                        toast.error(err.message || "Erreur inconnue");
                    }
                    setLoading(false);
                });

        } catch (err) {
            toast.error(err.message || "Erreur inconnue");
            setLoading(false);
        }
    };

    const handleVerify = () => {
        if (otp === codeValidation) {
            onVerified();
        } else {
            toast.error('Code incorrect');
        }
    };

    return (
        <Stack spacing={2} sx={{ width: '100%' }}>
            {!codeSent && !loading && (
                <>
                    <Typography variant="body1">
                        Nous allons envoyer un code à votre compte email
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={handleSendCode}
                        sx={{ width: 120, textTransform: 'none' }}
                    >
                        Envoyer
                    </Button>
                </>
            )}

            {loading && (
                <Stack alignItems="center">
                    <CircularProgress />
                </Stack>
            )}

            {codeSent && !loading && (
                <>
                    <Typography variant="body1">Veuillez entrer le code reçu :</Typography>

                    <Stack direction="row" justifyContent="center" sx={{ my: 2 }}>
                        <OtpInput
                            value={otp}
                            onChange={setOtp}
                            numInputs={10}
                            separator={<span style={{ width: 12 }} />}
                            inputStyle={{
                                width: '40px',
                                height: '50px',
                                fontSize: '20px',
                                borderRadius: 4,
                                border: '1px solid #ced4da',
                                backgroundColor: '#fff',
                                color: '#000',
                                textAlign: 'center',
                                outline: 'none'
                            }}
                            renderInput={(props) => <input {...props} />}
                        />
                    </Stack>

                    {error && (
                        <Typography sx={{ color: 'red', fontSize: '12px' }}>
                            {error}
                        </Typography>
                    )}

                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="contained"
                            onClick={handleVerify}
                            sx={{ textTransform: 'none' }}
                        >
                            Vérifier
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleSendCode}
                            sx={{ textTransform: 'none' }}
                            disabled={loading || cooldown > 0}
                        >
                            {cooldown > 0 ? `Renvoyer (${cooldown}s)` : "Renvoyer"}
                        </Button>
                    </Stack>
                </>
            )}
        </Stack>
    );
};

export default SendAndVerifyCodeForm;
