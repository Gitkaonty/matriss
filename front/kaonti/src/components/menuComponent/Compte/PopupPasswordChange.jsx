import { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
    Button, Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { useFormik } from 'formik';
import * as Yup from "yup";
import toast from 'react-hot-toast';

import SendAndVerifyCodeForm from './PopupPassword/SendAndVerifyCodeForm';
import PasswordConfirmForm from './PopupPassword/PasswordConfirmForm';
import PasswordChangeForm from './PopupPassword/PasswordChangeForm';
import { init } from '../../../../init';
import axios from '../../../../config/axios';

export default function PopupPasswordChange({ open, onClose, id_compte }) {
    const initial = init[0];
    const [step, setStep] = useState(0);
    const [isCodeVerified, setIsCodeVerified] = useState(false);
    const [isPasswordVerified, setIsPassWordVerified] = useState(false);
    const [passwordVerification, setPasswordVerification] = useState('');
    const [otp, setOtp] = useState('');
    const [codeSent, setCodeSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    const validationSchema = Yup.object({
        password: Yup.string()
            .required("Le mot de passe est obligatoire")
            .min(8, "Le mot de passe doit contenir au moins 8 caractères")
            .max(30, "Le mot de passe est trop long")
            .matches(/[A-Z]/, "Doit contenir une majuscule")
            .matches(/[a-z]/, "Doit contenir une minuscule")
            .matches(/[0-9]/, "Doit contenir un chiffre")
            .matches(/[^a-zA-Z0-9]/, "Doit contenir un caractère spécial"),
        passwordConfirmation: Yup.string()
            .oneOf([Yup.ref('password'), null], "Les mots de passe ne correspondent pas")
            .required("Le mot de passe de confirmation est obligatoire"),
    });

    // Formdata du formulaire pour le step 2
    const formData = useFormik({
        initialValues: {
            password: '',
            passwordConfirmation: '',
        },
        validationSchema,
        onSubmit: (values) => {
            axios.put(`/sous-compte/updatePassword/${id_compte}`, {
                password: values.password
            })
                .then((response) => {
                    if (response?.data?.state) {
                        toast.success(response?.data?.message);
                        handleClose();
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
    })

    // Férmeture du modal et les fonctions de réactualisation
    const handleClose = () => {
        setIsCodeVerified(false);
        setIsPassWordVerified(false);
        setPasswordVerification('');
        setOtp('');
        setCodeSent(false);
        setLoading(false);
        onClose();
        formData.resetForm();
        setStep(0);
        setCooldown(0);
    }

    return (
        <Dialog
            onClose={handleClose}
            open={open}
            maxWidth="xs"
            fullWidth={false}
            sx={{
                '& .MuiDialog-paper': {
                    width: `${step === 0 ? '450px' : step === 1 ? '450px' : step === 2 ? '400px' : '350px'}`,
                    maxWidth: '90%',
                }
            }}
        >
            <DialogTitle
                sx={{
                    m: 0,
                    p: 2,
                    fontWeight: 'bold',
                    backgroundColor: initial.theme,
                    color: 'white',
                    fontSize: 18
                }}
            >
                {step === 0 ? 'Vérification du mot de passe' : step === 1 ? 'Envoye / Vérification du code' : step === 2 ? 'Modification du mot de passe' : 'Modification du mot de passe'}
            </DialogTitle>

            <IconButton
                style={{ color: 'red', textTransform: 'none', outline: 'none' }}
                aria-label="close"
                onClick={handleClose}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <CloseIcon />
            </IconButton>

            <DialogContent dividers>
                {step === 0 && (
                    <PasswordConfirmForm
                        onPasswordMatch={() => setStep(1)}
                        setPasswordVerification={setPasswordVerification}
                        passwordVerification={passwordVerification}
                        id_compte={id_compte}
                        setIsPassWordVerified={setIsPassWordVerified}
                        setCodeSent={setCodeSent}
                        setIsCodeVerified={setIsCodeVerified}
                    />
                )}

                {step === 1 && isPasswordVerified && (
                    <SendAndVerifyCodeForm
                        onVerified={() => {
                            setIsCodeVerified(true);
                            setStep(2);
                        }}
                        onFailed={() => setIsCodeVerified(false)}
                        setCodeSent={setCodeSent}
                        codeSent={codeSent}
                        setLoading={setLoading}
                        loading={loading}
                        id_compte={id_compte}
                        setOtp={setOtp}
                        otp={otp}
                        setCooldown={setCooldown}
                        cooldown={cooldown}
                    />
                )}

                {step === 2 && isCodeVerified && (
                    <PasswordChangeForm
                        id_compte={id_compte}
                        formData={formData}
                    />
                )}
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'center' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    {[0, 1, 2].map((s) => {
                        const disabled =
                            (s === 2 && !isCodeVerified) ||
                            (s === 1 && !isPasswordVerified) ||
                            (step === 2 && (s === 0 || s === 1));

                        return (
                            <Button
                                key={s}
                                variant={step === s ? "contained" : "text"}
                                color={step === s ? "primary" : "inherit"}
                                onClick={() => !disabled && setStep(s)}
                                disabled={disabled}
                                sx={{
                                    minWidth: 40,
                                    minHeight: 40,
                                    borderRadius: "50%",
                                    border: disabled ? "1px solid lightgray" : "1px solid #1976d2",
                                }}
                                style={{
                                    textTransform: "none",
                                    outline: "none",
                                }}
                            >
                                {s + 1}
                            </Button>
                        );
                    })}
                </Stack>
            </DialogActions>


        </Dialog>
    );
}
