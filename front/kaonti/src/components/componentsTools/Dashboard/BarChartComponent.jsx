import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';
import { Box } from '@mui/material';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels
);

const formatValue = (value) => {
    if (Math.abs(value) >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + 'B';
    if (Math.abs(value) >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
    if (Math.abs(value) >= 1_000) return (value / 1_000).toFixed(0) + 'k';
    return value;
};

const BarChartComponent = ({ xAxis, dataN, dataN1, label }) => {
    const dataNOnAllLabels = xAxis.map((lbl, idx) => dataN[idx] ?? null);
    const dataN1OnAllLabels = xAxis.map((lbl, idx) => dataN1?.[idx] ?? null);

    const chartData = {
        labels: xAxis,
        datasets: [
            {
                label: 'N',
                data: dataNOnAllLabels,
                backgroundColor: '#3B82F6',
                borderColor: '#3B82F6',
                borderWidth: 0,
                borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 },
                borderSkipped: false,
                barThickness: 20,
            },
            ...(dataN1 && dataN1.length > 0 ? [{
                label: 'N-1',
                data: dataN1OnAllLabels,
                borderColor: '#94A3B8',
                borderDash: [5, 5],
                borderWidth: 2,
                borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 },
                borderSkipped: false,
                barThickness: 20,
            }] : [])
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
                grid: {
                    display: true,
                    color: '#E2E8F0',
                    borderDash: [3, 3],
                    drawBorder: false,
                },
                ticks: {
                    font: { size: 11 },
                    color: '#64748B',
                    callback: (value) => formatValue(value),
                },
                border: {
                    display: false,
                },
            },
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    font: { size: 11 },
                    color: '#64748B',
                },
                border: {
                    display: false,
                },
            },
        },
    };

    return (
        <Box sx={{ width: '100%', height: '100%' }}>
            <Bar data={chartData} options={options} />
        </Box>
    );
};

export default BarChartComponent;