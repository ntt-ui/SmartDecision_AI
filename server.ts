import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to get GoogleGenAI client
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const hasGeminiKey = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    hasGeminiKey,
    timestamp: new Date().toISOString(),
  });
});

// Retry helper for Gemini API with backoff
async function generateWithRetry(ai: GoogleGenAI, params: any, maxRetries = 2) {
  let lastError: any = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        ...params,
        model: 'gemini-3.8-flash',
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const isTransient =
        err.message?.includes('503') ||
        err.message?.includes('429') ||
        err.status === 503 ||
        err.status === 429;
      if (isTransient && attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        throw err;
      }
    }
  }
  throw lastError;
}

// Chat endpoint with conversational context and WSM capabilities
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: 'Chưa cấu hình GEMINI_API_KEY trong biến môi trường hoặc hệ thống. Vui lòng thiết lập khóa API Gemini để kích hoạt Trợ lý AI thực tế.',
      });
    }

    const { messages, projectContext } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Nội dung tin nhắn không hợp lệ.' });
    }

    const systemInstruction = `Bạn là Chuyên gia Cố vấn Ra Quyết định Doanh nghiệp (AI Decision Advisor) cho nền tảng SmartDecision AI.
Bạn hỗ trợ doanh nghiệp ra quyết định khoa học bằng phương pháp Ma trận Trọng số (Weighted Scoring Model - WSM).
Nguyên tắc cốt lõi:
1. Độc lập, khách quan, chuyên nghiệp, hỗ trợ mọi ngành nghề (Sản xuất, Tài chính, Bán lẻ, Nhân sự, Kho vận, Công nghệ...).
2. Trả lời bằng tiếng Việt chuẩn xác, mạch lạc, dễ hiểu, có cấu trúc bullet point rõ ràng.
3. Không tự ý bịa đặt số liệu doanh nghiệp. Nếu người dùng thiếu thông tin, hỏi lại một cách thân thiện.
4. Khi gợi ý tiêu chí và trọng số, ĐẢM BẢO TỔNG TRỌNG SỐ BẰNG 100%.
5. Nếu trong câu trả lời bạn có đề xuất phương án, tiêu chí và trọng số cụ thể để người dùng có thể áp dụng vào dự án WSM, hãy đính kèm khối JSON đặc biệt ở cuối câu trả lời theo định dạng:
\`\`\`wsm_proposal
{
  "projectTitle": "Tên dự án gợi ý",
  "domain": "Lĩnh vực (vd: CRM / Sản xuất / HRM / Logistics / Công nghệ)",
  "problemDescription": "Tóm tắt vấn đề",
  "options": ["Phương án A", "Phương án B", "Phương án C"],
  "criteria": [
    {"name": "Chi phí đầu tư & vận hành", "weight": 25, "description": "Tổng chi phí bản quyền, triển khai và bảo trì"},
    {"name": "Khả năng đáp ứng nghiệp vụ", "weight": 35, "description": "Mức độ phù hợp với quy trình hiện tại"},
    {"name": "Thời gian triển khai", "weight": 20, "description": "Thời gian đưa vào vận hành thực tế"},
    {"name": "Dịch vụ hỗ trợ & Bảo mật", "weight": 20, "description": "Cam kết SLA và an toàn dữ liệu"}
  ]
}
\`\`\`
Lưu ý: Chỉ đính kèm khối \`\`\`wsm_proposal khi người dùng yêu cầu lập kế hoạch/đề xuất tiêu chí/phương án cho một bài toán cụ thể. Tổng trọng số trong criteria PHẢI luôn bằng 100.
${projectContext ? `\n[Ngữ cảnh dự án hiện tại của người dùng]:\n${JSON.stringify(projectContext, null, 2)}` : ''}`;

    // Format chat history for contents
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await generateWithRetry(ai, {
      contents,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || 'Xin lỗi, không thể nhận phản hồi từ AI.';
    res.json({ reply });
  } catch (err: any) {
    console.error('Error in /api/gemini/chat:', err);
    const friendlyMsg = formatGeminiError(err);
    res.status(500).json({ error: friendlyMsg });
  }
});

function formatGeminiError(err: any): string {
  const msg = err.message || '';
  if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('Quota exceeded')) {
    return 'Hệ thống AI đang tạm thời vượt quá hạn mức yêu cầu (Rate Limit/Quota). Vui lòng đợi khoảng 15-30 giây rồi thử gửi lại, hoặc kiểm tra hạn mức API trong Settings > Secrets.';
  }
  if (msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand')) {
    return 'Dịch vụ AI đang chịu tải cao tạm thời. Vui lòng thử lại sau vài giây.';
  }
  if (msg.includes('403') || msg.includes('PERMISSION_DENIED') || msg.includes('API_KEY_INVALID')) {
    return 'Khóa API Gemini không hợp lệ hoặc không có quyền truy cập. Vui lòng kiểm tra lại GEMINI_API_KEY trong Settings > Secrets.';
  }
  return msg || 'Lỗi xử lý yêu cầu AI. Vui lòng thử lại.';
}

// Dedicated structured generation endpoint: Problem to WSM Matrix Proposal
app.post('/api/gemini/generate-wsm', async (req, res) => {
  try {
    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: 'Chưa cấu hình GEMINI_API_KEY. Vui lòng cấu hình khóa API trong môi trường hệ thống.',
      });
    }

    const { problemDescription, domain, businessName } = req.body;

    if (!problemDescription) {
      return res.status(400).json({ error: 'Mô tả vấn đề không được để trống.' });
    }

    const prompt = `Phân tích bài toán ra quyết định sau và xây dựng ma trận trọng số (Weighted Scoring Model) tối ưu:
- Doanh nghiệp: ${businessName || 'Doanh nghiệp'}
- Lĩnh vực: ${domain || 'Chung'}
- Vấn đề: ${problemDescription}

Hãy đề xuất:
1. Tên dự án súc tích.
2. Phân tích mục tiêu cốt lõi.
3. 3-4 phương án giải quyết tiêu biểu cần so sánh.
4. 4-6 tiêu chí đánh giá cốt lõi kèm trọng số phần trăm (%) sao cho tổng trọng số chính xác bằng 100%.
5. Lý do phân bổ trọng số và khuyến nghị đánh giá thang điểm 1-5.`;

    const response = await generateWithRetry(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            projectTitle: { type: Type.STRING },
            objectiveSummary: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['name', 'description'],
              },
            },
            criteria: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  weight: { type: Type.NUMBER, description: 'Phần trăm trọng số, tổng các tiêu chí phải đúng bằng 100' },
                  description: { type: Type.STRING },
                },
                required: ['name', 'weight', 'description'],
              },
            },
            weightRationale: { type: Type.STRING },
          },
          required: ['projectTitle', 'objectiveSummary', 'options', 'criteria', 'weightRationale'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/gemini/generate-wsm:', err);
    res.status(500).json({
      error: formatGeminiError(err),
    });
  }
});

// Endpoint: Comprehensive In-Depth AI Advisory & Trade-off Analysis (6 Pillars)
app.post('/api/gemini/analyze-results', async (req, res) => {
  try {
    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: 'Chưa cấu hình GEMINI_API_KEY. Vui lòng thiết lập khóa API Gemini trong hệ thống.',
      });
    }

    const { project, wsmResults, crossoverPoints, whatIfScenarios, language = 'vi' } = req.body;
    if (!project) {
      return res.status(400).json({ error: 'Dữ liệu dự án không được để trống.' });
    }

    // 1. Check data completeness
    const totalOptions = project.options?.length || 0;
    const totalCriteria = project.criteria?.length || 0;
    const expectedCells = totalOptions * totalCriteria;
    let scoredCells = 0;

    project.options?.forEach((opt: any) => {
      project.criteria?.forEach((crit: any) => {
        if (project.scores?.[opt.id]?.[crit.id] !== undefined && project.scores[opt.id][crit.id] !== null) {
          scoredCells++;
        }
      });
    });

    const totalWeight = (project.criteria || []).reduce((acc: number, c: any) => acc + (Number(c.weight) || 0), 0);
    const isWeight100 = Math.abs(totalWeight - 100) < 0.5;
    const isAllCellsScored = scoredCells >= expectedCells && expectedCells > 0;
    const isCompleteData = isAllCellsScored && isWeight100;

    let completenessNote = '';
    if (!isCompleteData) {
      const missingCells = expectedCells - scoredCells;
      const issues: string[] = [];
      if (missingCells > 0) {
        issues.push(language === 'vi' ? `còn ${missingCells} ô điểm chưa được chấm` : `${missingCells} matrix cells are unrated`);
      }
      if (!isWeight100) {
        issues.push(language === 'vi' ? `tổng trọng số hiện là ${totalWeight.toFixed(1)}% (chưa chuẩn hóa 100%)` : `current total weight is ${totalWeight.toFixed(1)}% (not 100%)`);
      }
      completenessNote = language === 'vi'
        ? `Lưu ý về độ đầy đủ dữ liệu: Ma trận ${issues.join(' và ')}. Kết luận dưới đây là phân tích sơ bộ dựa trên dữ liệu hiện có.`
        : `Data completeness notice: The matrix ${issues.join(' and ')}. The following advisory represents preliminary findings.`;
    }

    // 2. Prepare concise, factual prompt payload
    const systemInstruction = `Bạn là Chuyên gia Cố vấn Chiến lược & Thẩm định Ra Quyết định Cấp cao (Chief Decision & Strategy Advisor).
Bạn phân tích bài toán ra quyết định theo phương pháp Ma trận Trọng số (WSM).
QUY TẮC CỐT LÕI (BẮT BUỘC TUÂN THỦ):
1. PHẢI sử dụng dữ liệu THỰC TẾ của dự án được cung cấp (tên phương án, tiêu chí, trọng số, điểm thô, ghi chú thẩm định, điểm WSM, margin, crossover, what-if). TUYỆT ĐỐI KHÔNG tự bịa đặt số liệu hay tên phương án không có trong dự án.
2. Phân biệt rành mạch giữa:
   - Dữ liệu đầu vào thực tế (Tiêu chí, Trọng số, Điểm thẩm định, Ghi chú)
   - Kết quả tính toán chuẩn xác (Xếp hạng WSM, Mức chênh lệch Margin, Điểm đảo chiều)
   - Nhận định & Đánh giá chuyên sâu do AI đưa ra (Ưu/nhược điểm, Trade-offs, Rủi ro, Kế hoạch).
3. KHÔNG chọn phương án #1 một cách máy móc chỉ vì điểm số cao nhất: Phải cân nhắc mục tiêu kinh doanh, độ nhạy khi trọng số thay đổi, rủi ro tiềm ẩn và các đánh đổi thực tế.
4. Trả lời bằng ${language === 'en' ? 'tiếng Anh chuẩn mực quản trị (Professional English)' : 'tiếng Việt chuẩn mực quản trị doanh nghiệp, sắc sảo, thuyết phục và có cấu trúc mạch lạc'}.`;

    const userPrompt = `Hãy thực hiện BÁO CÁO TƯ VẤN CHUYÊN SÂU & ĐÁNH ĐỔI (In-Depth Decision Advisory Report) cho dự án sau:

[DỮ LIỆU ĐẦU VÀO DỰ ÁN]:
- Tên dự án: ${project.name}
- Đơn vị / Doanh nghiệp: ${project.businessName || 'N/A'}
- Lĩnh vực: ${project.domain}
- Bối cảnh & Vấn đề cần giải quyết: ${project.problemDescription || 'N/A'}
- Các phương án đánh giá (${project.options?.length}):
${(project.options || []).map((o: any, idx: number) => `  ${idx + 1}. [${o.id}] "${o.name}": ${o.description || 'Không có mô tả'}`).join('\n')}
- Danh sách tiêu chí & Trọng số (${project.criteria?.length}, Tổng trọng số: ${totalWeight}%):
${(project.criteria || []).map((c: any) => `  - [${c.id}] "${c.name}" (${c.type === 'cost' ? 'Loại: Chi phí/Rủi ro - đảo chiều' : 'Loại: Lợi ích'}) - Trọng số: ${c.weight}% - Ý nghĩa: ${c.description || 'N/A'}`).join('\n')}
- Ghi chú thẩm định / Căn cứ điểm số:
${JSON.stringify(project.notes || {}, null, 2)}

[KẾT QUẢ TÍNH TOÁN WSM]:
${JSON.stringify(wsmResults || [], null, 2)}

[KẾT QUẢ PHÂN TÍCH ĐỘ NHẠY & ĐIỂM GIAO CẮT ĐẢO CHIỀU]:
${JSON.stringify(crossoverPoints || [], null, 2)}

[KẾT QUẢ 4 KỊCH BẢN WHAT-IF (Baseline, Cost-first, Quality-first, Equal-weights)]:
${JSON.stringify(whatIfScenarios || [], null, 2)}

YÊU CẦU NỘI DUNG BÁO CÁO (6 TRỤ CỘT BẮT BUỘC):
1. Phân tích ưu điểm, hạn chế và những đánh đổi (Trade-off) của TỪNG phương án.
2. Giải thích nguyên nhân phương án được xếp hạng cao nhất dựa trên dữ liệu và kết quả WSM.
3. Kết hợp kết quả từ biểu đồ cột xếp chồng, Radar Chart, so sánh 1-1, phân tích độ nhạy và kịch bản What-if để đưa ra nhận định toàn diện.
4. Phân tích các rủi ro tiềm ẩn và đề xuất phương án giảm thiểu.
5. Đưa ra khuyến nghị cuối cùng có căn cứ, đồng thời nêu rõ những điều kiện khiến khuyến nghị có thể thay đổi (Trigger conditions).
6. Xây dựng kế hoạch thực thi theo từng giai đoạn, bao gồm công việc cần làm, nguồn lực và kết quả kỳ vọng.`;

    const response = await generateWithRetry(ai, {
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            optionTradeoffs: {
              type: Type.ARRAY,
              description: 'Phân tích ưu điểm, hạn chế và đánh đổi của từng phương án',
              items: {
                type: Type.OBJECT,
                properties: {
                  optionId: { type: Type.STRING },
                  optionName: { type: Type.STRING },
                  pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                  cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                  tradeOffSummary: { type: Type.STRING, description: 'Đánh đổi cốt lõi cần chấp nhận nếu chọn phương án này' },
                },
                required: ['optionId', 'optionName', 'pros', 'cons', 'tradeOffSummary'],
              },
            },
            topOptionRationale: {
              type: Type.OBJECT,
              description: 'Lý giải vì sao phương án #1 chiến thắng',
              properties: {
                topOptionName: { type: Type.STRING },
                scoreSummary: { type: Type.STRING },
                keyDrivingCriteria: { type: Type.ARRAY, items: { type: Type.STRING } },
                whyBetterThanRunnerUp: { type: Type.STRING },
              },
              required: ['topOptionName', 'scoreSummary', 'keyDrivingCriteria', 'whyBetterThanRunnerUp'],
            },
            multidimensionalInsights: {
              type: Type.OBJECT,
              description: 'Tổng hợp góc nhìn từ biểu đồ Stacked Bar, Radar, 1-1, Độ nhạy và What-If',
              properties: {
                stackedBarInsight: { type: Type.STRING },
                radarInsight: { type: Type.STRING },
                headToHeadInsight: { type: Type.STRING },
                sensitivityInsight: { type: Type.STRING },
                whatIfInsight: { type: Type.STRING },
              },
              required: ['stackedBarInsight', 'radarInsight', 'headToHeadInsight', 'sensitivityInsight', 'whatIfInsight'],
            },
            risksAndMitigations: {
              type: Type.ARRAY,
              description: 'Ma trận rủi ro tiềm ẩn và phương án giảm thiểu',
              items: {
                type: Type.OBJECT,
                properties: {
                  risk: { type: Type.STRING },
                  impact: { type: Type.STRING, description: 'Cao / Trung bình / Thấp hoặc High / Medium / Low' },
                  affectedOption: { type: Type.STRING },
                  mitigationStrategy: { type: Type.STRING },
                },
                required: ['risk', 'impact', 'affectedOption', 'mitigationStrategy'],
              },
            },
            finalRecommendation: {
              type: Type.OBJECT,
              description: 'Khuyến nghị cuối cùng và điều kiện thay đổi',
              properties: {
                recommendationText: { type: Type.STRING },
                confidenceLevel: { type: Type.STRING, description: 'Ví dụ: Rất cao (88%) hoặc Vững chắc' },
                triggerConditionsToReconsider: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['recommendationText', 'confidenceLevel', 'triggerConditionsToReconsider'],
            },
            implementationRoadmap: {
              type: Type.ARRAY,
              description: 'Kế hoạch thực thi theo giai đoạn',
              items: {
                type: Type.OBJECT,
                properties: {
                  phase: { type: Type.STRING, description: 'Tên giai đoạn' },
                  timeframe: { type: Type.STRING, description: 'Thời gian ước tính' },
                  tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                  requiredResources: { type: Type.ARRAY, items: { type: Type.STRING } },
                  expectedDeliverables: { type: Type.STRING },
                },
                required: ['phase', 'timeframe', 'tasks', 'requiredResources', 'expectedDeliverables'],
              },
            },
            rawMarkdown: {
              type: Type.STRING,
              description: 'Toàn bộ nội dung báo cáo điều hành dưới dạng Markdown chuẩn đẹp mắt',
            },
          },
          required: [
            'optionTradeoffs',
            'topOptionRationale',
            'multidimensionalInsights',
            'risksAndMitigations',
            'finalRecommendation',
            'implementationRoadmap',
            'rawMarkdown',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const result = {
      ...parsed,
      generatedAt: new Date().toISOString(),
      isCompleteData,
      dataCompletenessNote: completenessNote || undefined,
    };

    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/gemini/analyze-results:', err);
    res.status(500).json({
      error: formatGeminiError(err),
    });
  }
});

// Endpoint: AI Advisor Follow-up Q&A conversation
app.post('/api/gemini/advisor-followup', async (req, res) => {
  try {
    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: 'Chưa cấu hình GEMINI_API_KEY. Vui lòng kiểm tra Settings > Secrets.',
      });
    }

    const { messages, project, previousAnalysis, language = 'vi' } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Nội dung câu hỏi không hợp lệ.' });
    }

    const systemInstruction = `Bạn là Chuyên gia Cố vấn Chiến lược WSM cao cấp (Chief Decision Advisor).
Người dùng đang thảo luận sâu hơn về Báo cáo Tư vấn Chuyên sâu đã được tạo cho dự án:
- Dự án: ${project?.name} (${project?.domain})
- Doanh nghiệp: ${project?.businessName || 'Doanh nghiệp'}
- Khuyến nghị hiện tại: ${previousAnalysis?.finalRecommendation?.recommendationText || 'Phương án tối ưu theo WSM'}

NGUYÊN TẮC TRẢ LỜI:
1. Trả lời trực diện, sắc bén, định lượng dựa trên số liệu thực của dự án và báo cáo tư vấn đã có.
2. Nếu người dùng đặt tình huống giả định (ví dụ: đối tác giảm giá, thời gian gấp rút, thay đổi ngân sách), hãy phân tích chính xác tác động lên ma trận WSM.
3. Giữ phong thái chuyên nghiệp của một chuyên gia tư vấn quản trị cấp cao.
4. Trả lời bằng ${language === 'en' ? 'tiếng Anh' : 'tiếng Việt'}.`;

    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await generateWithRetry(ai, {
      contents,
      config: {
        systemInstruction,
      },
    });

    res.json({ reply: response.text || 'Xin lỗi, không có phản hồi.' });
  } catch (err: any) {
    console.error('Error in /api/gemini/advisor-followup:', err);
    res.status(500).json({
      error: formatGeminiError(err),
    });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartDecision AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
