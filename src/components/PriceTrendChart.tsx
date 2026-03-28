import { useEffect, useRef } from 'react';
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
  type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface PricePoint {
  date: string;
  inputPrice: number;
  outputPrice: number;
}

interface Props {
  data: PricePoint[];
  modelName: string;
  providerColour: string;
}

export default function PriceTrendChart({ data, modelName, providerColour }: Props) {
  const chartRef = useRef<ChartJS<'line'> | null>(null);

  useEffect(() => {
    // Re-render chart when theme changes
    const observer = new MutationObserver(() => {
      chartRef.current?.update();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  if (data.length < 2) return null;

  const labels = data.map(d => {
    const dt = new Date(d.date);
    return dt.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Input $/M',
        data: data.map(d => d.inputPrice),
        borderColor: providerColour,
        backgroundColor: providerColour + '20',
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Output $/M',
        data: data.map(d => d.outputPrice),
        borderColor: '#94a3b8',
        backgroundColor: '#94a3b820',
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.3,
        borderDash: [5, 5],
        fill: false,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#94a3b8',
          font: { size: 11, family: 'Inter, system-ui, sans-serif' },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
        },
      },
      title: {
        display: true,
        text: `${modelName} — Price History`,
        color: '#f1f5f9',
        font: { size: 14, weight: 'bold', family: 'Inter, system-ui, sans-serif' },
        padding: { bottom: 12 },
      },
      tooltip: {
        backgroundColor: '#1a1a2e',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: '#2a2a4e',
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        callbacks: {
          label: (ctx) => {
            const y = ctx.parsed.y;
            return y == null ? `${ctx.dataset.label}: $0.00` : `${ctx.dataset.label}: $${y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#64748b',
          font: { size: 10, family: 'Inter, system-ui, sans-serif' },
        },
        grid: { color: '#1e1e3a' },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#64748b',
          font: { size: 10, family: 'Inter, system-ui, sans-serif' },
          callback: (value) => `$${value}`,
        },
        grid: { color: '#1e1e3a' },
      },
    },
  };

  return (
    <div style={{ height: '300px', position: 'relative' }}>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
}
