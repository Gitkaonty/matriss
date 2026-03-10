import { Box, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { HiOutlineSwitchHorizontal } from "react-icons/hi";
import TextCard from './TextCard';

const SparklineMini = ({ data = [], color = '#ffffff', width = 200, height = 70 }) => {
    if (!data.length) return null;
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    // Points de base
    const points = data.map((val, i) => ({
        x: (i / (data.length - 1 || 1)) * width,
        y: height - ((val - min) / range) * (height * 0.9) - (height * 0.05)
    }));
    
    // Courbe lisse avec peu de vague (Bézier simple)
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        
        // Courbes douces, pas trop de vague
        const cp1x = prev.x + (curr.x - prev.x) * 0.4;
        const cp1y = prev.y - 8; // Légère vague vers le haut
        const cp2x = curr.x - (curr.x - prev.x) * 0.4;
        const cp2y = curr.y + 5; // Légère vague vers le bas
        
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }
    
    const areaPath = `${path} L ${width} ${height} L 0 ${height} Z`;
    
    return (
        <svg width={width} height={height} style={{ overflow: 'visible' }}>
            <defs>
                <linearGradient id={`sparkGrad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.7" />
                    <stop offset="40%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={areaPath} fill={`url(#sparkGrad-${color.replace('#', '')})`} stroke="none" />
            <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

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
    compact,
    trendLabels,
    trendN,
    trendN1
}) => {
    const [flipped, setFlipped] = useState(false);

    const formatMontant = (num) => {
        if (num === null || num === undefined || isNaN(num)) return '-';
        const codeDevise = devise || '';
        return num.toLocaleString('fr-FR') + (codeDevise ? ` ${codeDevise}` : '');
    };

    const formatPourcentage = (value, evolution) => {
        if (value === null || value === undefined || Number.isNaN(Number(value))) return '0.00 %';
        const v = Number(value);
        if (evolution === 'diminution') return (-1 * Math.abs(v)).toFixed(2) + ' %';
        return Math.abs(v).toFixed(2) + ' %';
    };

    const getVariationColor = (evolution) => {
        if (evolution === 'augmentation') return '#0dba2a';
        if (evolution === 'diminution') return '#ba210d';
        return '#a3b8b7';
    };

    if (compact) {
        const montantAffiche = flipped ? resultatN1 : resultatN;
        const rangAffiche = flipped ? 'N-1' : 'N';
        const evolutionAffiche = flipped ? evolutionN1 : evolutionN;
        const variationAffiche = flipped ? variationN1 : variationN;
        const colorVariation = getVariationColor(evolutionAffiche);
        const hasSparkline = Array.isArray(trendN) && trendN.length > 0;
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

                {/* Mini sparkline - positionné en dessous de la flèche */}
                {hasSparkline && (
                    <Box
                        sx={{
                            position: 'absolute',
                            right: 0,
                            top: 32,
                            width: 200,
                            height: 70,
                            opacity: 0.85,
                            pointerEvents: 'none',
                            zIndex: 0,
                        }}
                    >
                        <SparklineMini data={trendN} color={backgroundColor} />
                    </Box>
                )}

                <Stack
                    direction="column"
                    justifyContent="space-between"
                    sx={{
                        position: 'relative',
                        height: '100%',
                        width: '100%',
                        px: 1.25,
                        py: 1,
                        zIndex: 0,
                    }}
                >
                    <Box sx={{ pr: 4 }}>
                        <Typography
                            sx={{
                                lineHeight: 1.1,
                                fontSize: '12px',
                                color: 'white',
                                fontWeight: 500,
                                textAlign: 'left',
                            }}
                        >
                            {text} {rangAffiche}
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 0.5 }}>
                        <Typography
                            sx={{
                                lineHeight: 1.05,
                                fontSize: { xs: '16px', md: '18px' },
                                color: 'white',
                                fontWeight: 700,
                                textAlign: 'left',
                            }}
                        >
                            {formatMontant(montantAffiche)}
                        </Typography>
                        <Typography
                            sx={{
                                lineHeight: 1.1,
                                fontSize: '12px',
                                color: 'white',
                                fontWeight: 700,
                                textAlign: 'left',
                                mt: 1,
                            }}
                        >
                            {formatPourcentage(variationAffiche, evolutionAffiche)} <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>vs N-1</span>
                        </Typography>
                    </Box>
                </Stack>
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
