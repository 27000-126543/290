import { Router, type Response } from 'express';
import db from '../db/index.js';
import { generateId, getTodayString } from '../utils/common.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contractsDir = path.join(__dirname, '../../data/contracts');

if (!fs.existsSync(contractsDir)) {
  fs.mkdirSync(contractsDir, { recursive: true });
}

router.get('/contracts/:filename', (req: any, res: Response): void => {
  try {
    const { filename } = req.params;
    const contractPath = path.join(contractsDir, filename);

    if (!fs.existsSync(contractPath)) {
      res.status(404).json({ success: false, error: '合同文件不存在' });
      return;
    }

    const content = fs.readFileSync(contractPath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
    res.send(content);
  } catch (error) {
    res.status(500).json({ success: false, error: '下载合同失败' });
  }
});

router.use(authMiddleware);

let cachedFontBytes: Uint8Array | null = null;

function getChineseFontBytes(): Uint8Array {
  if (cachedFontBytes) return cachedFontBytes;
  const fontPaths = [
    'C:\\Windows\\Fonts\\simhei.ttf',
    'C:\\Windows\\Fonts\\msyh.ttc',
    'C:\\Windows\\Fonts\\simsun.ttc',
  ];
  for (const fp of fontPaths) {
    if (fs.existsSync(fp)) {
      cachedFontBytes = new Uint8Array(fs.readFileSync(fp));
      return cachedFontBytes;
    }
  }
  throw new Error('No Chinese font found on system');
}

async function generateContractPDF(application: any): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const fontBytes = getChineseFontBytes();
  const customFont = await pdfDoc.embedFont(fontBytes, { subset: true });

  const page = pdfDoc.addPage([600, 800]);
  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;

  const drawText = (text: string, size: number = 12, indent: number = 0) => {
    page.drawText(text, {
      x: margin + indent,
      y,
      size,
      font: customFont,
      color: rgb(0, 0, 0),
    });
    y -= size + 8;
  };

  const drawLine = () => {
    page.drawLine({
      start: { x: margin, y },
      end: { x: width - margin, y },
      thickness: 0.5,
      color: rgb(0.5, 0.5, 0.5),
    });
    y -= 15;
  };

  const date = new Date().toISOString().split('T')[0];

  drawText('分布式电源并网服务合同', 20);
  y -= 5;
  drawText('Distributed Power Grid Connection Service Contract', 10);
  y -= 10;
  drawLine();

  drawText(`合同编号: GE-${application.id.toUpperCase()}`, 12);
  drawText(`签订日期: ${date}`, 12);
  y -= 10;

  drawText('甲方（供电企业）：绿能电力有限公司', 13);
  drawText('法定代表人：张经理', 11, 20);
  drawText('地址：北京市朝阳区能源大厦', 11, 20);
  y -= 5;

  drawText(`乙方（用户）：${application.applicant_name}`, 13);
  drawText(`身份证号：${application.applicant_id_card}`, 11, 20);
  drawText(`联系电话：${application.applicant_phone}`, 11, 20);
  drawText(`用电地址：${application.address}`, 11, 20);
  y -= 10;
  drawLine();

  drawText('一、并网项目基本情况', 13);
  drawText(`1. 项目名称：${application.station_name}`, 11, 20);
  drawText(`2. 项目类型：${application.station_type === 'photovoltaic' ? '光伏发电' : '风力发电'}`, 11, 20);
  drawText(`3. 装机容量：${application.station_capacity} kW`, 11, 20);
  drawText(`4. 项目地址：${application.address}`, 11, 20);
  y -= 5;

  drawText('二、服务内容', 13);
  drawText('1. 甲方负责为乙方提供并网接入服务', 11, 20);
  drawText('2. 乙方按照国家相关标准建设分布式电源项目', 11, 20);
  drawText('3. 甲方按照国家规定的电价标准结算电费', 11, 20);
  y -= 5;

  drawText('三、双方权利与义务', 13);
  drawText('（一）甲方权利与义务', 12, 20);
  drawText('1. 按照国家电网公司相关规定受理乙方并网申请', 11, 40);
  drawText('2. 及时组织完成并网验收和调试工作', 11, 40);
  drawText('3. 按照约定及时支付电费及补贴', 11, 40);
  drawText('4. 为乙方提供必要的技术支持和服务', 11, 40);
  y -= 3;
  drawText('（二）乙方权利与义务', 12, 20);
  drawText('1. 按照批准的方案建设分布式电源项目', 11, 40);
  drawText('2. 保证项目设备符合国家相关标准', 11, 40);
  drawText('3. 配合甲方完成并网验收工作', 11, 40);
  drawText('4. 按时缴纳相关费用', 11, 40);
  y -= 5;

  drawText('四、电费结算', 13);
  drawText('1. 上网电价按照国家相关规定执行', 11, 20);
  drawText('2. 电费按月结算，每月15日前支付上月电费', 11, 20);
  drawText('3. 国家补贴按照相关政策执行', 11, 20);
  y -= 5;

  drawText('五、合同期限', 13);
  drawText('本合同有效期为20年，自并网验收合格之日起计算。', 11, 20);
  y -= 5;

  drawText('六、违约责任', 13);
  drawText('任何一方违反本合同约定，应承担相应的违约责任。', 11, 20);
  y -= 5;

  drawText('七、争议解决', 13);
  drawText('双方因履行本合同发生争议，应协商解决；协商不成的，可向当地人民法院提起诉讼。', 11, 20);
  y -= 5;

  drawText('八、其他', 13);
  drawText('1. 本合同一式两份，甲乙双方各执一份', 11, 20);
  drawText('2. 本合同自双方签字盖章之日起生效', 11, 20);
  y -= 20;
  drawLine();
  y -= 10;

  drawText('甲方（盖章）：                    乙方（签字）：', 12);
  y -= 30;
  drawText(`                            ${application.applicant_name}`, 12);
  y -= 10;
  drawText(`日期：${date}                    日期：${date}`, 12);
  y -= 30;

  page.drawText('绿能电力有限公司', {
    x: margin,
    y,
    size: 10,
    font: customFont,
    color: rgb(0.6, 0.6, 0.6),
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

router.get('/', (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    let applications: any[];
    if (role === 'admin') {
      applications = db.prepare(`
        SELECT ga.*, u.name as user_name, u.phone as user_phone
        FROM grid_applications ga
        LEFT JOIN users u ON ga.user_id = u.id
        ORDER BY ga.created_at DESC
      `).all();
    } else {
      applications = db.prepare(`
        SELECT * FROM grid_applications WHERE user_id = ? ORDER BY created_at DESC
      `).all(userId);
    }

    res.json({
      success: true,
      data: applications.map((a: any) => ({
        id: a.id,
        stationId: a.station_id,
        stationName: a.station_name,
        applicantName: a.applicant_name,
        applicantPhone: a.applicant_phone,
        address: a.address,
        stationCapacity: a.station_capacity,
        stationType: a.station_type,
        status: a.status,
        reviewRemark: a.review_remark,
        contractUrl: a.contract_url,
        createdAt: a.created_at,
        updatedAt: a.updated_at,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取并网申请列表失败' });
  }
});

router.get('/:id', (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const application: any = db.prepare('SELECT * FROM grid_applications WHERE id = ?').get(id);

    if (!application) {
      res.status(404).json({ success: false, error: '申请不存在' });
      return;
    }

    res.json({
      success: true,
      data: {
        id: application.id,
        stationId: application.station_id,
        stationName: application.station_name,
        applicantName: application.applicant_name,
        applicantPhone: application.applicant_phone,
        applicantIdCard: application.applicant_id_card,
        address: application.address,
        stationCapacity: application.station_capacity,
        stationType: application.station_type,
        documents: application.documents ? JSON.parse(application.documents) : [],
        status: application.status,
        reviewRemark: application.review_remark,
        contractUrl: application.contract_url,
        createdAt: application.created_at,
        updatedAt: application.updated_at,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取申请详情失败' });
  }
});

router.post('/', (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user?.id;
    const {
      stationId,
      stationName,
      applicantName,
      applicantPhone,
      applicantIdCard,
      address,
      stationCapacity,
      stationType,
      documents = [],
    } = req.body;

    if (!stationId || !applicantName || !applicantPhone || !applicantIdCard || !address) {
      res.status(400).json({ success: false, error: '请填写完整信息' });
      return;
    }

    if (!/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(applicantIdCard)) {
      res.status(400).json({ success: false, error: '身份证号格式不正确' });
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(applicantPhone)) {
      res.status(400).json({ success: false, error: '手机号格式不正确' });
      return;
    }

    const applicationId = generateId('ga');

    db.prepare(`
      INSERT INTO grid_applications (
        id, user_id, station_id, station_name, applicant_name, applicant_phone, 
        applicant_id_card, address, station_capacity, station_type, documents
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      applicationId,
      userId,
      stationId,
      stationName,
      applicantName,
      applicantPhone,
      applicantIdCard,
      address,
      stationCapacity,
      stationType,
      JSON.stringify(documents)
    );

    db.prepare(`
      INSERT INTO notifications (id, user_id, title, content, type)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      generateId('notif'),
      userId,
      '并网申请已提交',
      `您的并网申请【${stationName}】已成功提交，等待审核`,
      'grid'
    );

    res.status(201).json({ success: true, data: { id: applicationId }, message: '申请提交成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: '提交申请失败' });
  }
});

router.put('/:id/review', roleMiddleware(['admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, remark } = req.body;

    const application: any = db.prepare('SELECT * FROM grid_applications WHERE id = ?').get(id);
    if (!application) {
      res.status(404).json({ success: false, error: '申请不存在' });
      return;
    }

    let newStatus = status;
    let reviewRemark = remark;
    let contractUrl = null;

    if (status === 'approved') {
      const pdfBytes = await generateContractPDF(application);
      const contractFileName = `contract_${id}.pdf`;
      const contractPath = path.join(contractsDir, contractFileName);
      fs.writeFileSync(contractPath, Buffer.from(pdfBytes));
      contractUrl = `/api/grid/contracts/${contractFileName}`;
      newStatus = 'completed';
      reviewRemark = remark || '资质审核通过，已生成电子合同';
    } else if (status === 'rejected') {
      newStatus = 'rejected';
      reviewRemark = remark || '资质审核未通过，请补充材料后重新申请';
    } else if (status === 'verified') {
      newStatus = 'verified';
      reviewRemark = remark || '现场核验通过，等待并网';
    }

    db.prepare(`
      UPDATE grid_applications 
      SET status = ?, review_remark = ?, contract_url = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(newStatus, reviewRemark, contractUrl, id);

    db.prepare(`
      INSERT INTO notifications (id, user_id, title, content, type)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      generateId('notif'),
      application.user_id,
      newStatus === 'completed' ? '并网申请已通过' : 
      newStatus === 'rejected' ? '并网申请未通过' :
      newStatus === 'verified' ? '现场核验通过' : '申请状态更新',
      `您的并网申请【${application.station_name}】状态已更新：${
        newStatus === 'completed' ? '审核通过，电子合同已生成' :
        newStatus === 'rejected' ? reviewRemark :
        newStatus === 'verified' ? '现场核验通过' : reviewRemark
      }`,
      'grid'
    );

    res.json({ success: true, message: '审核完成', data: { contractUrl } });
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ success: false, error: '审核失败', detail: (error as Error).message });
  }
});

router.put('/:id/auto-review', roleMiddleware(['admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const application: any = db.prepare('SELECT * FROM grid_applications WHERE id = ?').get(id);

    if (!application) {
      res.status(404).json({ success: false, error: '申请不存在' });
      return;
    }

    let passed = true;
    const reasons: string[] = [];

    if (application.station_capacity > 500) {
      passed = false;
      reasons.push('装机容量超过500kW，需进行专项审批');
    }

    if (!/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(application.applicant_id_card)) {
      passed = false;
      reasons.push('身份证号码格式校验不通过');
    }

    if (passed) {
      const pdfBytes = await generateContractPDF(application);
      const contractFileName = `contract_${id}.pdf`;
      const contractPath = path.join(contractsDir, contractFileName);
      fs.writeFileSync(contractPath, Buffer.from(pdfBytes));
      const contractUrl = `/api/grid/contracts/${contractFileName}`;

      db.prepare(`
        UPDATE grid_applications 
        SET status = 'completed', review_remark = ?, contract_url = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run('系统自动审核通过，资质齐全', contractUrl, id);

      db.prepare(`
        INSERT INTO notifications (id, user_id, title, content, type)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        generateId('notif'),
        application.user_id,
        '并网申请自动审核通过',
        `您的并网申请【${application.station_name}】已通过系统自动审核，电子合同已生成`,
        'grid'
      );

      res.json({
        success: true,
        data: { passed: true, contractUrl },
        message: '自动审核通过',
      });
    } else {
      db.prepare(`
        UPDATE grid_applications 
        SET status = 'rejected', review_remark = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(`自动审核未通过：${reasons.join('；')}`, id);

      res.json({
        success: true,
        data: { passed: false, reasons },
        message: '自动审核未通过',
      });
    }
  } catch (error) {
    console.error('Auto review error:', error);
    res.status(500).json({ success: false, error: '自动审核失败', detail: (error as Error).message });
  }
});

router.get('/:id/timeline', (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const application: any = db.prepare('SELECT * FROM grid_applications WHERE id = ?').get(id);

    if (!application) {
      res.status(404).json({ success: false, error: '申请不存在' });
      return;
    }

    const timeline = [
      {
        time: application.created_at,
        status: 'submitted',
        title: '提交申请',
        description: '用户提交并网申请材料',
        completed: true,
      },
    ];

    if (application.status !== 'pending') {
      timeline.push({
        time: application.updated_at,
        status: application.status === 'rejected' ? 'review_failed' : 'reviewed',
        title: application.status === 'rejected' ? '资质审核未通过' : '资质审核通过',
        description: application.review_remark || '系统自动审核资质',
        completed: true,
      });
    }

    if (application.status === 'verified' || application.status === 'completed') {
      timeline.push({
        time: application.updated_at,
        status: 'verified',
        title: '现场核验通过',
        description: '工作人员现场核验设备安装情况',
        completed: true,
      });
    }

    if (application.status === 'completed') {
      timeline.push({
        time: application.updated_at,
        status: 'completed',
        title: '并网完成',
        description: '并网成功，电子合同已生成',
        completed: true,
      });
    }

    res.json({ success: true, data: timeline });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取进度失败' });
  }
});

export default router;
