import { useState } from 'react'
import { Button, FormControl, IconButton, InputAdornment, Stack, TextField } from '@mui/material';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const PasswordChangeForm = ({ formData }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const handleClickShowPassword = () => {
        setShowPassword((show) => !show);
    }

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event) => {
        event.preventDefault();
    };

    const handleClickShowPasswordConfirmation = () => {
        setShowPasswordConfirmation((show) => !show);
    }

    const handleMouseDownPasswordConfirmation = (event) => {
        event.preventDefault();
    };

    const handleMouseUpPasswordConfirmation = (event) => {
        event.preventDefault();
    };

    return (
        <form
            onSubmit={formData.handleSubmit}
        >
            <Stack
                alignItems={'left'}
                direction={"column"}
                spacing={2}
                style={{ marginLeft: '0px' }}
            >
                <FormControl size="small" fullWidth style={{ width: '100%' }}>
                    <TextField
                        size="small"
                        label="Nouveau mot de passe"
                        name="password"
                        fullWidth
                        variant='standard'
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.values.password}
                        onChange={formData.handleChange}
                        onBlur={formData.handleBlur}
                        error={Boolean(formData.touched.password && formData.errors.password)}
                        helperText={formData.touched.password && formData.errors.password}
                        InputProps={{
                            style: {
                                fontSize: '13px',
                                padding: '2px 4px',
                                height: '30px',
                            },
                            sx: {
                                '& input': {
                                    height: '30px',
                                },
                            },
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label={showPassword ? 'hide password' : 'show password'}
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword}
                                        onMouseUp={handleMouseUpPassword}
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        InputLabelProps={{
                            style: {
                                fontSize: '13px',
                                marginTop: '-2px',
                            },
                        }}
                    />
                </FormControl>

                <FormControl size="small" fullWidth style={{ width: '100%' }}>
                    <TextField
                        size="small"
                        label="Confirmation du nouveau mot de passe"
                        name="passwordConfirmation"
                        fullWidth
                        variant='standard'
                        type={showPasswordConfirmation ? 'text' : 'password'}
                        required
                        value={formData.values.passwordConfirmation}
                        onChange={formData.handleChange}
                        onBlur={formData.handleBlur}
                        error={Boolean(formData.touched.passwordConfirmation && formData.errors.passwordConfirmation)}
                        helperText={formData.touched.passwordConfirmation && formData.errors.passwordConfirmation}
                        InputProps={{
                            style: {
                                fontSize: '13px',
                                padding: '2px 4px',
                                height: '30px',
                            },
                            sx: {
                                '& input': {
                                    height: '30px',
                                },
                            },
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label={showPasswordConfirmation ? 'hide password' : 'show password'}
                                        onClick={handleClickShowPasswordConfirmation}
                                        onMouseDown={handleMouseDownPasswordConfirmation}
                                        onMouseUp={handleMouseUpPasswordConfirmation}
                                    >
                                        {showPasswordConfirmation ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        InputLabelProps={{
                            style: {
                                fontSize: '13px',
                                marginTop: '-2px',
                            },
                        }}
                    />
                </FormControl>

                <Stack
                    style={{
                        alignItems: 'end'
                    }}
                >
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{ mt: 1 }}
                        style={{
                            textTransform: 'none',
                            outline: 'none',
                            width: '100px'
                        }}
                    >
                        Enregistrer
                    </Button>
                </Stack>
            </Stack>
        </form>
    )
}

export default PasswordChangeForm