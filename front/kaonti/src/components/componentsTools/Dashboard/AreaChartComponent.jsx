import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Box } from '@mui/material';

// On n'enregistre PAS ChartDataLabels ici pour éviter l'affichage sur la ligne
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const AreaChartComponent = ({ xAxis, dataN, dataN1, label }) => {
    const dataNOnAllLabels = xAxis.map((lbl, idx) => dataN[idx] ?? null);
    const dataN1OnAllLabels = xAxis.map((lbl, idx) => dataN1?.[idx] ?? null);


    const verticalLinePlugin = {
        id: 'verticalLine',
        afterDraw: (chart) => {
            if (chart.tooltip?._active?.length) {
                const { ctx } = chart;
                const activePoint = chart.tooltip._active[0];
                const { x } = activePoint.element;
                const topY = chart.scales.y.top;
                const bottomY = chart.scales.y.bottom;
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(x, topY);
                ctx.lineTo(x, bottomY);
                ctx.lineWidth = 1;
                ctx.strokeStyle = '#E2E8F0';
                ctx.setLineDash([5, 5]);
                ctx.stroke();
                ctx.restore();
            }
        }
    };

    const chartData = {
        labels: xAxis,
        datasets: [
            {
                label: 'N',
                data: dataNOnAllLabels,
                borderColor: '#3B82F6',
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
                    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
                    return gradient;
                },
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 0, // Aucun point sur la ligne
                pointHoverRadius: 6, // Point visible uniquement au survol
            },
            ...(dataN1 && dataN1.length > 0 ? [{
                label: `N-1`,
                data: dataN1OnAllLabels,
                borderColor: '#94A3B8',
                borderDash: [5, 5],
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointRadius: 0,
                datalabels: {
                    display: false,
                },
            }] : [])
            // {
            //     label: 'Année N-1',
            //     data: dataN1,
            //     borderColor: '#94A3B8',
            //     borderDash: [5, 5],
            //     borderWidth: 2,
            //     fill: false,
            //     tension: 0.4,
            //     pointRadius: 0,
            // }
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: { display: true, position: 'top' },
            title: { display: true, text: label, font: { size: 18 } },
            datalabels: { display: false },
            tooltip: {
                enabled: true,
                backgroundColor: '#1E293B',
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    // Affichage du montant dans la bulle au survol
                    label: (context) => {
                        return ` ${context.dataset.label} : ${new Intl.NumberFormat('fr-FR').format(context.raw)} €`;
                    }
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#F1F5F9', drawBorder: false },
                ticks: {
                    color: '#64748B',
                    font: { size: 11 },
                    // Affichage des montants sur l'axe de gauche
                    callback: (value) => {
                        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                        return new Intl.NumberFormat('fr-FR').format(value);
                    }
                }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#64748B', font: { size: 11 } }
            }
        }
    };

    return (
        <Box sx={{ height: '100%', width: '100%' }}>
            <Line data={chartData} options={options} plugins={[verticalLinePlugin]} />
        </Box>
    );
};

export default AreaChartComponent;