// Simple SVG-based chart components for institutional-grade visualizations
// No external dependencies - keeping bundle size minimal

export interface BarChartData {
    categories: string[];
    series: {
        name: string;
        values: number[];
        color: string;
    }[];
}

export interface LineChartData {
    categories: string[];
    series: {
        name: string;
        values: number[];
        color: string;
    }[];
}

export interface PositioningMapData {
    xAxis: string;
    yAxis: string;
    players: {
        name: string;
        x: number; // 0-100
        y: number; // 0-100
        color?: string;
    }[];
}

/**
 * Generate SVG path for a line chart
 */
export function generateLinePath(
    values: number[],
    width: number,
    height: number,
    padding: number = 40
): string {
    if (values.length === 0) return '';

    const maxValue = Math.max(...values);
    const minValue = Math.min(...values, 0);
    const range = maxValue - minValue || 1;

    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const stepX = chartWidth / (values.length - 1 || 1);

    const points = values.map((value, index) => {
        const x = padding + index * stepX;
        const y = padding + chartHeight - ((value - minValue) / range) * chartHeight;
        return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
}

/**
 * Format large numbers for display (e.g., 1000000 -> 1M)
 */
export function formatLargeNumber(value: number): string {
    if (value >= 1000000000) {
        return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
        return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
}

/**
 * Generate Y-axis labels for a chart
 */
export function generateYAxisLabels(maxValue: number, steps: number = 5): number[] {
    const stepValue = maxValue / steps;
    return Array.from({ length: steps + 1 }, (_, i) => stepValue * i);
}

/**
 * Calculate bar positions for stacked bar chart
 */
export function calculateStackedBarPositions(
    data: BarChartData,
    width: number,
    height: number,
    padding: number = 40
) {
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const barWidth = chartWidth / data.categories.length * 0.6;
    const barSpacing = chartWidth / data.categories.length;

    // Find max stacked value
    const maxStackedValue = Math.max(
        ...data.categories.map((_, catIndex) =>
            data.series.reduce((sum, series) => sum + series.values[catIndex], 0)
        )
    );

    const bars: {
        category: string;
        categoryIndex: number;
        series: {
            name: string;
            color: string;
            x: number;
            y: number;
            width: number;
            height: number;
            value: number;
        }[];
    }[] = [];

    data.categories.forEach((category, catIndex) => {
        let stackY = 0;
        const seriesBars = data.series.map((series) => {
            const value = series.values[catIndex];
            const barHeight = (value / maxStackedValue) * chartHeight;
            const x = padding + catIndex * barSpacing + (barSpacing - barWidth) / 2;
            const y = padding + chartHeight - stackY - barHeight;

            stackY += barHeight;

            return {
                name: series.name,
                color: series.color,
                x,
                y,
                width: barWidth,
                height: barHeight,
                value,
            };
        });

        bars.push({
            category,
            categoryIndex: catIndex,
            series: seriesBars,
        });
    });

    return { bars, maxValue: maxStackedValue, chartWidth, chartHeight, padding };
}

/**
 * Generate grid lines for charts
 */
export function generateGridLines(
    width: number,
    height: number,
    padding: number,
    steps: number = 5
): { x1: number; y1: number; x2: number; y2: number }[] {
    const chartHeight = height - padding * 2;
    const stepHeight = chartHeight / steps;

    return Array.from({ length: steps + 1 }, (_, i) => ({
        x1: padding,
        y1: padding + i * stepHeight,
        x2: width - padding,
        y2: padding + i * stepHeight,
    }));
}

/**
 * Calculate positioning for scatter plot points
 */
export function calculateScatterPoints(
    data: PositioningMapData,
    width: number,
    height: number,
    padding: number = 60
) {
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    return data.players.map((player) => ({
        ...player,
        cx: padding + (player.x / 100) * chartWidth,
        cy: padding + chartHeight - (player.y / 100) * chartHeight,
    }));
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
}

/**
 * Generate color palette for charts
 */
export const chartColors = {
    primary: '#6366f1', // Indigo
    secondary: '#8b5cf6', // Purple
    success: '#10b981', // Green
    warning: '#f59e0b', // Amber
    danger: '#ef4444', // Red
    info: '#3b82f6', // Blue
    tam: '#6366f1',
    sam: '#8b5cf6',
    som: '#10b981',
    grid: 'rgba(255, 255, 255, 0.05)',
    axis: 'rgba(255, 255, 255, 0.2)',
    text: 'rgba(255, 255, 255, 0.6)',
};

/**
 * Calculate trend line for time series data
 */
export function calculateTrendLine(values: number[]): { slope: number; intercept: number } {
    const n = values.length;
    const xValues = Array.from({ length: n }, (_, i) => i);

    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * values[i], 0);
    const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
}
