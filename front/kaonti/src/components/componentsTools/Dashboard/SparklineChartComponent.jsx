import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Box } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const formatValue = (value) => {
    if (value === null || value === undefined) return '';
    const num = Number(value);
    if (Number.isNaN(num)) return '';
    if (Math.abs(num) >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
    if (Math.abs(num) >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (Math.abs(num) >= 1_000) return (num / 1_000).toFixed(0) + 'k';
    return num;
};

const SparklineChartComponent = ({ xAxis = [], dataN = [], dataN1, colorN = '#349beb', colorN1 = '#de5f23' }) => {
    const labels = xAxis.length ? xAxis : dataN.map((_, i) => i);
    const dataNOnAllLabels = labels.map((_, idx) => dataN[idx] ?? null);
    const dataN1OnAllLabels = labels.map((_, idx) => dataN1?.[idx] ?? null);

    const chartData = {
        labels,
        datasets: [
            {
                label: `N`,
                data: dataNOnAllLabels,
                borderColor: colorN,
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.35,
                pointHoverRadius: 5,
                fill: false,
            },
            ...(dataN1 ? [{
                label: `N-1`,
                data: dataN1OnAllLabels,
                borderColor: colorN1,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 5,
                tension: 0.35,
                fill: false,
            }] : [])
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { display: false },
            title: { display: false },
            tooltip: {
                enabled: true,
                callbacks: {
                    label: (context) => {
                        const dsLabel = context.dataset?.label ? `${context.dataset.label}: ` : '';
                        return dsLabel + formatValue(context.parsed?.y);
                    },
                },
            },
        },
        scales: {
            y: {
                display: true,
                ticks: { display: true },
                grid: { display: false, drawOnChartArea: false },
                border: { display: true },
            },
            x: {
                display: true,
                ticks: { display: true },
                grid: { display: false, drawOnChartArea: false },
                border: { display: true },
            },
        },

    };

    return (
        <Box sx={{ width: '100%', height: '100%', minHeight: 0 }}>
            <Line data={chartData} options={options} style={{ width: '100%', height: '100%' }} />
        </Box>
    );
};

export default SparklineChartComponent;
