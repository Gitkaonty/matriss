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
import { Stack } from '@mui/material';

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

    const shadowPlugin = {
        id: 'shadowPlugin',
        beforeDatasetDraw(chart, args) {
            const { ctx } = chart;
            const datasetIndex = args.index;
            const dataset = chart.data.datasets[datasetIndex];

            if (!dataset) return;

            const color = dataset.borderColor || 'rgba(0,0,0,0.5)';

            ctx.save();
            ctx.shadowColor = color;
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 10;
        },
        afterDatasetDraw(chart, args) {
            chart.ctx.restore();
        }
    };

    const chartData = {
        labels: xAxis,
        datasets: [
            {
                label: `N`,
                data: dataNOnAllLabels,
                borderColor: '#349beb',
                backgroundColor: 'rgba(52, 155, 235, 0.55)',
                borderWidth: 1,
                borderRadius: 6,
                maxBarThickness: 22,
                datalabels: {
                    display: false,
                },
            },
            ...(dataN1 ? [{
                label: `N-1`,
                data: dataN1OnAllLabels,
                borderColor: '#de5f23',
                backgroundColor: 'rgba(222, 95, 35, 0.55)',
                borderWidth: 1,
                borderRadius: 6,
                maxBarThickness: 22,
                datalabels: {
                    display: false,
                },
            }] : [])
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { right: 20 } },
        plugins: {
            legend: { display: true, position: 'top' },
            title: { display: true, text: label, font: { size: 18 } },
            tooltip: { enabled: true },
            datalabels: {},
        },
        scales: {
            y: {
                grid: {
                    display: false, // enlève la grille
                },
                border: {
                    display: true, // garde l’axe
                },
            },
            x: {
                grid: {
                    display: false,
                },
                border: {
                    display: true,
                },
            },
        },

    };

    return (
        <Stack flex={1} height={'100%'} width={'100%'} minHeight={0} alignItems="stretch" direction="column">
            <Bar data={chartData} options={options} plugins={[shadowPlugin]} style={{ width: '100%', height: '100%' }} />
        </Stack>
    );
};

export default BarChartComponent;
