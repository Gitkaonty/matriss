import { Box, Stack } from '@mui/material';
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
    evolutionN1
}) => {
    const [flipped, setFlipped] = useState(false);
    return (
        <Box
            sx={{
                perspective: 1000,
                width: '50%',
                height: '100%',
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
                    borderRadius: 2,
                    boxShadow: 3,
                    // '&:hover': {
                    //     transform: 'rotateY(180deg)',
                    // },
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
                        backgroundColor: backgroundColor,
                        borderRadius: 2,
                        p: 3,
                        transition: 'all 0.3s ease-in-out',
                        cursor: 'pointer',
                        boxShadow: 2,
                        '&:hover': {
                            transform: 'scale(1.01)',
                            boxShadow: 3,
                        },
                    }}
                >
                    {/* Icône flip */}
                    {
                        type !== 'total' && (
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
                        )
                    }

                    {/* Contenu */}
                    <TextCard
                        text={text}
                        montant={resultatN}
                        montantN1={resultatN1}
                        type={type}
                        variation={variationN}
                        evolution={evolutionN}
                        exercice={'Exercice actuel'}
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
                        backgroundColor: backgroundColor,
                        borderRadius: 2,
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
                        color={'#6d645dff'}
                    />
                </Stack>
            </Box>
        </Box>
    );
};

export default DashboardCard;
