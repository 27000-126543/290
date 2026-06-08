interface DataPoint {
  x: number;
  y: number;
}

interface LinearRegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  predictions: number[];
}

export function trainLinearRegression(data: DataPoint[]): LinearRegressionResult {
  const n = data.length;
  if (n < 2) {
    return { slope: 0, intercept: 0, rSquared: 0, predictions: [] };
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (const point of data) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumXX += point.x * point.x;
  }

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) {
    const meanY = sumY / n;
    return { slope: 0, intercept: meanY, rSquared: 0, predictions: data.map(() => meanY) };
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  const predictions = data.map((point) => slope * point.x + intercept);

  let ssTotal = 0;
  let ssResidual = 0;
  const meanY = sumY / n;

  for (let i = 0; i < n; i++) {
    ssTotal += (data[i].y - meanY) ** 2;
    ssResidual += (data[i].y - predictions[i]) ** 2;
  }

  const rSquared = ssTotal === 0 ? 0 : 1 - ssResidual / ssTotal;

  return { slope, intercept, rSquared, predictions };
}

export function predict(slope: number, intercept: number, x: number): number {
  return slope * x + intercept;
}

export function trainMonthlyPredictionModel(historyData: any[]): LinearRegressionResult & { modelInfo: any } {
  const dataPoints: DataPoint[] = historyData.map((item, index) => ({
    x: index,
    y: item.daily_generation || item.generation || 0,
  }));

  const result = trainLinearRegression(dataPoints);

  const avgGeneration = dataPoints.reduce((sum, p) => sum + p.y, 0) / Math.max(dataPoints.length, 1);
  const maxGeneration = Math.max(...dataPoints.map((p) => p.y), 0);
  const minGeneration = Math.min(...dataPoints.map((p) => p.y), 0);

  return {
    ...result,
    modelInfo: {
      type: 'Linear Regression',
      trainingSamples: dataPoints.length,
      avgGeneration,
      maxGeneration,
      minGeneration,
      accuracy: Math.round((result.rSquared * 100) * 10) / 10,
    },
  };
}

export function generateFuturePredictions(
  slope: number,
  intercept: number,
  days: number,
  startIndex: number,
  seasonFactor: number = 1,
  weatherFactor: number = 1
): number[] {
  const predictions: number[] = [];
  const baseVariance = 0.15;

  for (let i = 0; i < days; i++) {
    const x = startIndex + i;
    const basePrediction = predict(slope, intercept, x);
    const seasonalAdjusted = basePrediction * seasonFactor;
    const weatherAdjusted = seasonalAdjusted * weatherFactor;
    const variance = (Math.random() - 0.5) * 2 * baseVariance * weatherAdjusted;
    const finalPrediction = Math.max(0, weatherAdjusted + variance);
    predictions.push(Math.round(finalPrediction * 100) / 100);
  }

  return predictions;
}

export function getSeasonFactor(date: Date): number {
  const month = date.getMonth();
  if (month >= 5 && month <= 7) return 1.3;
  if (month >= 3 && month <= 4) return 1.1;
  if (month >= 8 && month <= 10) return 1.15;
  if (month >= 11 || month <= 1) return 0.7;
  return 0.9;
}

export default {
  trainLinearRegression,
  predict,
  trainMonthlyPredictionModel,
  generateFuturePredictions,
  getSeasonFactor,
};
