import { Box, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { HiOutlineSwitchHorizontal } from "react-icons/hi";
import TextCard from './TextCard';

const DashboardCard = ({
    text,
    type,
    backgroundColor,
    resultatN,
    resultatN1,
    variationN,
    variationN1,
    evolutionN,
    evolutionN1,
    devise,
    sx,
    compact
}) => {
    const [flipped, setFlipped] = useState(false);

    const formatMontant = (num) => {
        if (num === null || num === undefined || isNaN(num)) return '-';
        const codeDevise = devise || '';
        return num.toLocaleString('fr-FR') + (codeDevise ? ` ${codeDevise}` : '');
    };

    if (compact) {
        const montantAffiche = flipped ? resultatN1 : resultatN;
        const rangAffiche = flipped ? 'N-1' : 'N';
        return (
            <Box
                sx={{
                    width: '50%',
                    height: '100%',
                    position: 'relative',
                    backgroundColor: backgroundColor,
                    boxShadow: 0,
                    borderRadius: 0,
                    overflow: 'hidden',
                    ...sx,
                }}
            >
                <Stack
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        cursor: 'pointer',
                        zIndex: 1,
                        color: 'white',
                        '&:hover': {
                            transform: 'scale(1.1)',
                        },
                    }}
                    onClick={() => setFlipped((v) => !v)}
                >
                    <HiOutlineSwitchHorizontal size={18} />
                </Stack>

                <Box sx={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ position: 'absolute', top: 8, left: 10, pr: 4 }}>
                        <Typography
                            sx={{
                                lineHeight: 1.1,
                                fontSize: '12px',
                                color: 'white',
                                fontWeight: 400,
                                textAlign: 'left',
                            }}
                        >
                            {text} {rangAffiche}
                        </Typography>
                    </Box>

                    <Box sx={{ width: '100%', px: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
                        <Typography
                            sx={{
                                lineHeight: 1.1,
                                fontSize: { xs: '13px', md: '15px' },
                                color: 'white',
                                fontWeight: 400,
                                textAlign: 'right',
                                pr: 1.5,
                            }}
                        >
                            {formatMontant(montantAffiche)}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                perspective: 1000,
                width: '50%',
                height: '100%',
                ...sx,
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    textAlign: 'center',
                    transition: 'transform 0.5s',
                    transformStyle: 'preserve-3d',
                    borderRadius: 0,
                    boxShadow: 0,
                    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
            >
                {/* Face avant */}
                <Stack
                    direction="column"
                    alignItems="flex-start"
                    justifyContent="space-between"
                    sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        backgroundColor: `${backgroundColor}33`,
                        borderRadius: 0,
                        p: 3,
                        transition: 'all 0.3s ease-in-out',
                        boxShadow: 1,
                    }}
                >
                    {/* Icône flip */}
                    <Stack
                        sx={{
                            position: 'absolute',
                            top: 15,
                            right: 15,
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease-in-out',
                            '&:hover': {
                                transform: 'scale(1.2)',
                            },
                        }}
                        onClick={() => setFlipped(true)}
                    >
                        <HiOutlineSwitchHorizontal size={20} />
                    </Stack>

                    {/* Contenu */}
                    <TextCard
                        text={text}
                        montant={resultatN}
                        montantN1={resultatN1}
                        type={type}
                        variation={variationN}
                        evolution={evolutionN}
                        exercice={'Exercice actuel'}
                        devise={devise}
                    />
                </Stack>


                {/* Face arrière */}
                <Stack
                    direction="column"
                    alignItems="flex-start"
                    justifyContent="space-between"
                    sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        backgroundColor: `${backgroundColor}25`,
                        borderRadius: 0,
                        p: 3,
                        transform: 'rotateY(180deg)',
                    }}
                >
                    <Stack
                        sx={{
                            position: 'absolute',
                            top: 15,
                            right: 15,
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease-in-out',
                            '&:hover': {
                                transform: 'scale(1.2)',
                            },
                        }}
                        onClick={() => setFlipped(false)}
                    >
                        <HiOutlineSwitchHorizontal size={20} />
                    </Stack>

                    <TextCard
                        text={text}
                        montant={resultatN1}
                        type={type}
                        variation={variationN1}
                        evolution={evolutionN1}
                        exercice={'Exercice précédent'}
                        color={'#292724ff'}
                        devise={devise}
                    />
                </Stack>
            </Box>
        </Box>
    );
};

export default DashboardCard;
