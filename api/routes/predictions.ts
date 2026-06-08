import { Router, type Response } from 'express';
import db from '../db/index.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authMiddleware } from '../middleware/auth.js';
import { trainMonthlyPredictionModel, generateFuturePredictions, getSeasonFactor } from '../services/ml.js';

const router = Router();

router.use(authMiddleware);

function predictGeneration(historyData: any[], weatherData: any[]): { predictions: any[], modelInfo: any } {
  const weatherFactors: Record<string, number> = {
    '晴': 1.0,
    '多云': 0.75,
    '阴': 0.55,
    '小雨': 0.35,
    '中雨': 0.2,
    '大雨': 0.1,
  };

  const model = trainMonthlyPredictionModel(historyData);
  const today = new Date();
  const seasonFactor = getSeasonFactor(today);
  const startIndex = historyData.length;

  const futureValues = generateFuturePredictions(
    model.slope,
    model.intercept,
    weatherData.length,
    startIndex,
    seasonFactor,
    1
  );

  const predictions: any[] = [];
  for (let i = 0; i < weatherData.length; i++) {
    const weather = weatherData[i];
    const weatherFactor = weatherFactors[weather.weather] || 0.8;
    const basePrediction = futureValues[i] || model.modelInfo.avgGeneration || 35;
    const predictedGen = basePrediction * weatherFactor;
    
    const baseConfidence = model.rSquared * 100;
    const weatherConfidence = weatherFactor >= 0.8 ? 10 : weatherFactor >= 0.5 ? 5 : -10;
    const confidence = Math.min(95, Math.max(50, Math.round(baseConfidence + weatherConfidence)));
    
    let suggestion = '';
    if (weatherFactor >= 0.8) {
      suggestion = '天气晴好，建议增加放电比例获取更高收益';
    } else if (weatherFactor >= 0.5) {
      suggestion = '天气一般，按常规策略运行即可';
    } else {
      suggestion = '天气较差，建议减少放电，保留电池电量';
    }

    predictions.push({
      date: weather.date,
      predictedGeneration: Math.round(predictedGen * 10) / 10,
      confidence,
      weather: weather.weather,
      temperature: weather.temperature,
      suggestion,
    });
  }

  return { predictions, modelInfo: model.modelInfo };
}

router.get('/stations/:stationId', (req: AuthRequest, res: Response): void => {
  try {
    const { stationId } = req.params;
    const { days = '7' } = req.query;

    const historyData: any[] = db.prepare(`
      SELECT * FROM history_data 
      WHERE station_id = ? 
      ORDER BY date DESC 
      LIMIT 30
    `).all(stationId);

    const weatherData = [];
    const baseDate = new Date();
    const weatherOptions = ['晴', '多云', '阴', '小雨'];

    for (let i = 0; i < parseInt(days as string); i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      weatherData.push({
        date: date.toISOString().split('T')[0],
        weather: weatherOptions[Math.floor(Math.random() * weatherOptions.length)],
        temperature: Math.round(20 + Math.random() * 15),
      });
    }

    const { predictions, modelInfo } = predictGeneration(historyData, weatherData);

    for (const pred of predictions) {
      db.prepare(`
        INSERT OR REPLACE INTO predictions (station_id, date, predicted_generation, confidence, weather, temperature, suggestion)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(stationId, pred.date, pred.predictedGeneration, pred.confidence, pred.weather, pred.temperature, pred.suggestion);
    }

    res.json({
      success: true,
      data: {
        predictions,
        modelInfo,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取预测数据失败' });
  }
});

router.get('/stations/:stationId/model-info', (req: AuthRequest, res: Response): void => {
  try {
    const { stationId } = req.params;

    const historyData: any[] = db.prepare(`
      SELECT * FROM history_data 
      WHERE station_id = ? 
      ORDER BY date DESC 
      LIMIT 90
    `).all(stationId);

    const model = trainMonthlyPredictionModel(historyData);
    const { modelInfo, slope, intercept, rSquared } = model;

    res.json({
      success: true,
      data: {
        modelName: '线性回归预测模型 (Linear Regression)',
        modelVersion: 'v2.0',
        accuracy: modelInfo.accuracy || 75,
        trainingDataPoints: modelInfo.trainingSamples,
        avgDailyGeneration: Math.round(modelInfo.avgGeneration * 10) / 10,
        maxDailyGeneration: Math.round(modelInfo.maxGeneration * 10) / 10,
        minDailyGeneration: Math.round(modelInfo.minGeneration * 10) / 10,
        lastTrainingDate: historyData[0]?.date || new Date().toISOString().split('T')[0],
        modelParameters: {
          slope: Math.round(slope * 10000) / 10000,
          intercept: Math.round(intercept * 100) / 100,
          rSquared: Math.round(rSquared * 100) / 100,
        },
        factors: [
          { name: '历史发电量 (线性回归)', weight: 0.55 },
          { name: '天气预报', weight: 0.25 },
          { name: '季节因素', weight: 0.15 },
          { name: '随机波动', weight: 0.05 },
        ],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取模型信息失败' });
  }
});

router.get('/stations/:stationId/suggestions', (req: AuthRequest, res: Response): void => {
  try {
    const { stationId } = req.params;

    const predictions: any[] = db.prepare(`
      SELECT * FROM predictions 
      WHERE station_id = ? 
      ORDER BY date ASC 
      LIMIT 7
    `).all(stationId);

    const battery: any = db.prepare('SELECT * FROM batteries WHERE station_id = ?').get(stationId);
    const strategy: any = db.prepare('SELECT * FROM charge_strategies WHERE station_id = ?').get(stationId);

    const suggestions = [];

    const avgPredicted = predictions.length > 0
      ? predictions.reduce((sum, p) => sum + p.predicted_generation, 0) / predictions.length
      : 0;

    if (avgPredicted > 40) {
      suggestions.push({
        id: 1,
        type: 'storage',
        priority: 'high',
        title: '增加放电时段',
        description: '未来一周发电量充足，建议在电价高峰时段增加放电比例，可提高约15%的收益',
        action: '调整充放电策略',
      });
    }

    if (battery && battery.health < 90) {
      suggestions.push({
        id: 2,
        type: 'maintenance',
        priority: 'medium',
        title: '电池维护建议',
        description: '电池健康度低于90%，建议进行一次完整的充放电校准，可延长电池使用寿命',
        action: '创建维护工单',
      });
    }

    const alarms: any = db.prepare(`
      SELECT COUNT(*) as count FROM alarms 
      WHERE station_id = ? AND resolved = 0
    `).get(stationId);

    if (alarms && alarms.count > 0) {
      suggestions.push({
        id: 3,
        type: 'alarm',
        priority: 'high',
        title: '处理未解决告警',
        description: `当前有${alarms.count}条告警未处理，请及时查看并处理`,
        action: '查看告警列表',
      });
    }

    suggestions.push({
      id: 4,
      type: 'optimization',
      priority: 'low',
      title: '组件清洁建议',
      description: '根据历史数据分析，建议每2个月清洁一次光伏组件，可提高约5%的发电效率',
      action: '预约清洁服务',
    });

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取优化建议失败' });
  }
});

export default router;
