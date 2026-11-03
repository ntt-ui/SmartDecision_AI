import { Project, SampleProject } from '../types';

export const SAMPLE_PROJECTS_LIBRARY: SampleProject[] = [
  {
    id: 'sample-crm-retail',
    name: 'Lựa chọn phần mềm CRM cho chuỗi bán lẻ thời trang đa kênh',
    businessName: 'Chuỗi Thời Trang Modern Style (12 cửa hàng & Online)',
    domain: 'Quản lý khách hàng (CRM)',
    category: 'Kinh doanh',
    problemDescription:
      'Doanh nghiệp bán lẻ có 12 cửa hàng vật lý và các kênh bán hàng trực tuyến (Website, Shopee, TikTok Shop). Hệ thống dữ liệu khách hàng hiện đang phân mảnh, chưa có hệ thống loyalty tập trung và thiếu tự động hóa chăm sóc sau bán. Cần lựa chọn giải pháp CRM cân đối giữa chi phí, tính năng đa kênh và tốc độ triển khai.',
    options: [
      {
        id: 'crm-opt-1',
        name: 'HubSpot CRM Pro',
        description: 'Giải pháp quốc tế chuẩn SaaS, giao diện thân thiện, tự động hóa marketing và phễu bán lẻ vượt trội.',
        color: '#f97316',
      },
      {
        id: 'crm-opt-2',
        name: 'Odoo CRM Enterprise',
        description: 'Nền tảng mã nguồn mở tùy biến cao, tích hợp sâu vào hệ thống quản lý kho (WMS) và POS.',
        color: '#8b5cf6',
      },
      {
        id: 'crm-opt-3',
        name: 'Sapo Omni CRM',
        description: 'Giải pháp nội địa tối ưu hóa sẵn cho thị trường bán lẻ VN, đồng bộ trực tiếp các sàn TMĐT và cổng vận chuyển.',
        color: '#0284c7',
      },
    ],
    criteria: [
      {
        id: 'crm-c1',
        name: 'Chi phí đầu tư & Vận hành (TCO)',
        weight: 25,
        description: 'Bao gồm phí bản quyền định kỳ, phí thiết lập ban đầu và chi phí đào tạo nhân sự.',
      },
      {
        id: 'crm-c2',
        name: 'Khả năng tích hợp bán lẻ đa kênh',
        weight: 25,
        description: 'Kết nối 2 chiều với máy tính tiền POS, sàn TMĐT Việt Nam và cổng SMS/Zalo ZNS.',
      },
      {
        id: 'crm-c3',
        name: 'Tính trực quan & Dễ sử dụng',
        weight: 20,
        description: 'Thời gian nhân viên cửa hàng và telesales làm quen, hạn chế tối đa thao tác nhập liệu thủ công.',
      },
      {
        id: 'crm-c4',
        name: 'Tốc độ triển khai & Vận hành',
        weight: 15,
        description: 'Thời gian từ khi ký hợp đồng đến khi go-live trơn tru trên toàn bộ 12 cửa hàng.',
      },
      {
        id: 'crm-c5',
        name: 'Độ tin cậy & Hỗ trợ kỹ thuật tại VN',
        weight: 15,
        description: 'Hỗ trợ kỹ thuật 24/7 trực tiếp, xử lý sự cố trong vòng 2 giờ khi gặp lỗi thanh toán/tích điểm.',
      },
    ],
    scores: {
      'crm-opt-1': { 'crm-c1': 3, 'crm-c2': 4, 'crm-c3': 5, 'crm-c4': 4, 'crm-c5': 3 },
      'crm-opt-2': { 'crm-c1': 4, 'crm-c2': 5, 'crm-c3': 3, 'crm-c4': 3, 'crm-c5': 4 },
      'crm-opt-3': { 'crm-c1': 5, 'crm-c2': 5, 'crm-c3': 4, 'crm-c4': 5, 'crm-c5': 5 },
    },
    status: 'completed',
    createdAt: '2026-03-01T08:00:00.000Z',
    updatedAt: '2026-03-01T10:30:00.000Z',
    isSample: true,
    analysisRationale: {
      recommendedOptionName: 'Sapo Omni CRM',
      whyRecommended:
        'Sapo Omni CRM đạt tổng điểm WSM cao nhất (4.75/5.0). Giải pháp này phù hợp hoàn hảo với quy mô bán lẻ vừa và nhỏ tại Việt Nam nhờ khả năng kết nối sẵn sàng với các sàn TMĐT nội địa (Shopee, TikTok, Lazada) và chi phí vận hành cực kỳ hợp lý, giúp doanh nghiệp tiết kiệm 40% chi phí so với các giải pháp quốc tế.',
      keyStrengths: [
        'Tích hợp native sẵn các kênh bán lẻ đa kênh tại Việt Nam không cần lập trình thêm middleware.',
        'Chi phí đầu tư và bản quyền hàng tháng tối ưu cho mô hình chuỗi 12 cửa hàng.',
        'Đội ngũ hỗ trợ kỹ thuật tại chỗ, xử lý sự cố trực tiếp qua Zalo và hotline tiếng Việt.',
      ],
      tradeOffs:
        'Các tính năng tự động hóa phễu tiếp thị chuyên sâu (Lead nurturing workflow) không mạnh mẽ và tùy biến cao như HubSpot CRM.',
      implementationAdvice:
        'Nên bắt đầu thí điểm tại 2 cửa hàng trọng điểm trong 2 tuần đầu trước khi nhân rộng đồng loạt cho 10 cửa hàng còn lại.',
    },
  },
  {
    id: 'sample-raw-material-supplier',
    name: 'Đánh giá & Lựa chọn nhà cung cấp nguyên vật liệu sản xuất',
    businessName: 'Công ty Cổ phần Bao bì & Nhựa Công nghiệp',
    domain: 'Quản lý sản xuất',
    category: 'Vận hành',
    problemDescription:
      'Nhà máy cần chọn đối tác cung ứng hạt nhựa PP nguyên sinh quy mô 500 tấn/quý. Yêu cầu đảm bảo chất lượng đồng đều, thời gian giao hàng đúng cam kết để không gián đoạn dây chuyền tự động, đồng thời có chính sách công nợ thanh toán linh hoạt.',
    options: [
      {
        id: 'supp-opt-1',
        name: 'Nhà cung cấp Á Châu (Nội địa)',
        description: 'Kho bãi sẵn tại Bình Dương, giao hàng trong 24h, công nợ 30 ngày nhưng giá cao hơn thị trường 3%.',
        color: '#2563eb',
      },
      {
        id: 'supp-opt-2',
        name: 'Tập đoàn Hóa chất PetroGlobal (Nhập khẩu)',
        description: 'Hàng nhập khẩu Hàn Quốc chuẩn CO/CQ cao cấp, giá cạnh tranh theo khối lượng lớn, thời gian giao 15-20 ngày.',
        color: '#059669',
      },
      {
        id: 'supp-opt-3',
        name: 'Công ty TNHH Hóa Chất Đông Phương',
        description: 'Nhà phân phối tầm trung, chính sách giá rẻ nhất, hỗ trợ thanh toán 45 ngày nhưng tỷ lệ giao trễ 8%.',
        color: '#dc2626',
      },
    ],
    criteria: [
      {
        id: 'supp-c1',
        name: 'Chất lượng nguyên liệu & Chứng chỉ CO/CQ',
        weight: 35,
        description: 'Tỷ lệ hạt đạt chuẩn độ bền kéo, độ trong suốt và chứng nhận an toàn thực phẩm.',
      },
      {
        id: 'supp-c2',
        name: 'Độ tin cậy & Đúng hạn giao hàng',
        weight: 25,
        description: 'Tỷ lệ giao hàng đúng hạn cam kết để không làm ngừng dây chuyền ép khuôn.',
      },
      {
        id: 'supp-c3',
        name: 'Đơn giá & Chiết khấu sản lượng',
        weight: 20,
        description: 'Đơn giá theo tấn và chính sách thưởng chiết khấu khi đạt mốc 2.000 tấn/năm.',
      },
      {
        id: 'supp-c4',
        name: 'Chính sách công nợ & Thời hạn thanh toán',
        weight: 20,
        description: 'Kỳ hạn thanh toán (30 ngày hay 45 ngày) và hạn mức tín dụng thương mại.',
      },
    ],
    scores: {
      'supp-opt-1': { 'supp-c1': 4, 'supp-c2': 5, 'supp-c3': 3, 'supp-c4': 4 },
      'supp-opt-2': { 'supp-c1': 5, 'supp-c2': 4, 'supp-c3': 4, 'supp-c4': 3 },
      'supp-opt-3': { 'supp-c1': 3, 'supp-c2': 2, 'supp-c3': 5, 'supp-c4': 5 },
    },
    status: 'completed',
    createdAt: '2026-03-02T09:00:00.000Z',
    updatedAt: '2026-03-02T11:00:00.000Z',
    isSample: true,
    analysisRationale: {
      recommendedOptionName: 'Tập đoàn Hóa chất PetroGlobal (Nhập khẩu)',
      whyRecommended:
        'PetroGlobal đạt điểm WSM cao nhất (4.15/5.0). Đối với ngành ép nhựa công nghiệp, chất lượng nguyên liệu đạt chuẩn quốc tế (trọng số 35%) là yếu tố sống còn để giảm tỷ lệ phế phẩm đúc ép xuống dưới 0.5%.',
      keyStrengths: [
        'Chất lượng hạt nhựa đạt chuẩn ISO & FDA, hạt đồng đều giúp ổn định nhiệt độ ép khuôn.',
        'Mức giá cạnh tranh khi nhập theo lô lớn cho toàn quý.',
      ],
      tradeOffs:
        'Thời gian giao hàng đường biển cần 15-20 ngày, do đó nhà máy phải duy trì mức tồn kho đệm (safety stock) tối thiểu 2 tuần sản xuất.',
      implementationAdvice:
        'Ký hợp đồng nguyên tắc năm với PetroGlobal làm nhà cung cấp chính (70% sản lượng) và giữ Nhà cung cấp Á Châu làm phương án dự phòng khẩn cấp (30% sản lượng).',
    },
  },
  {
    id: 'sample-ecommerce-platform',
    name: 'Lựa chọn nền tảng thương mại điện tử cho thương hiệu bán lẻ D2C',
    businessName: 'Thương hiệu Tiêu dùng Xanh GreenLiving',
    domain: 'Lựa chọn phần mềm & giải pháp công nghệ',
    category: 'Công nghệ',
    problemDescription:
      'Thương hiệu chuẩn bị ra mắt website D2C (Direct-to-Consumer) bán hàng trực tiếp đến người tiêu dùng. Dự kiến lưu lượng truy cập 50.000 lượt/ngày trong các đợt flash sale. Cần chọn nền tảng có độ ổn định cao, khả năng mở rộng tốt và chi phí duy trì hợp lý.',
    options: [
      {
        id: 'ecom-opt-1',
        name: 'Shopify Advanced',
        description: 'Nền tảng SaaS toàn cầu số 1, chịu tải cực tốt, hệ sinh thái app phong phú, phí hoa hồng giao dịch 0.5-1%.',
        color: '#10b981',
      },
      {
        id: 'ecom-opt-2',
        name: 'WooCommerce trên Cloud VPS',
        description: 'Mã nguồn mở WordPress, hoàn toàn làm chủ mã nguồn và dữ liệu, chi phí ban đầu thấp nhưng cần tự bảo trì hạ tầng.',
        color: '#6366f1',
      },
      {
        id: 'ecom-opt-3',
        name: 'Adobe Commerce (Magento)',
        description: 'Giải pháp doanh nghiệp lớn, khả năng tùy biến logic bán hàng không giới hạn, chi phí phát triển và vận hành rất đắt đỏ.',
        color: '#f43f5e',
      },
    ],
    criteria: [
      {
        id: 'ecom-c1',
        name: 'Độ ổn định & Khả năng chịu tải flash sale',
        weight: 30,
        description: 'Khả năng giữ uptime 99.99% khi lượng đơn hàng tăng đột biến 10 lần trong 1 giờ.',
      },
      {
        id: 'ecom-c2',
        name: 'Tốc độ triển khai & Ra mắt thị trường (Time-to-market)',
        weight: 25,
        description: 'Thời gian xây dựng giao diện, thanh toán và kiểm thử hoàn chỉnh đưa vào hoạt động.',
      },
      {
        id: 'ecom-c3',
        name: 'Chi phí phát triển & Duy trì kỹ thuật (TCO)',
        weight: 25,
        description: 'Bao gồm phí bản quyền, server, phí thuê kỹ sư vận hành và vá lỗi bảo mật.',
      },
      {
        id: 'ecom-c4',
        name: 'Khả năng tích hợp cổng thanh toán & vận chuyển VN',
        weight: 20,
        description: 'Kết nối VNPay, MoMo, ZaloPay, Giao Hàng Nhanh, Viettel Post.',
      },
    ],
    scores: {
      'ecom-opt-1': { 'ecom-c1': 5, 'ecom-c2': 5, 'ecom-c3': 4, 'ecom-c4': 4 },
      'ecom-opt-2': { 'ecom-c1': 3, 'ecom-c2': 4, 'ecom-c3': 4, 'ecom-c4': 4 },
      'ecom-opt-3': { 'ecom-c1': 5, 'ecom-c2': 2, 'ecom-c3': 2, 'ecom-c4': 3 },
    },
    status: 'completed',
    createdAt: '2026-03-03T07:30:00.000Z',
    updatedAt: '2026-03-03T09:15:00.000Z',
    isSample: true,
    analysisRationale: {
      recommendedOptionName: 'Shopify Advanced',
      whyRecommended:
        'Shopify Advanced đạt điểm áp đảo 4.55/5.0. Doanh nghiệp cần đưa sản phẩm ra thị trường nhanh trong vòng 3 tuần với đội ngũ kỹ thuật mỏng. Hạ tầng serverless được quản lý hoàn toàn của Shopify giúp thương hiệu loại bỏ rủi ro sập web trong ngày flash sale mà không cần tuyển đội ngũ DevOps tốn kém.',
      keyStrengths: [
        'Uptime 99.99% chuẩn đám mây toàn cầu, tự động scale khi có hàng chục nghìn khách mua đồng thời.',
        'Hệ sinh thái app phong phú cho phép cài đặt CRM, Loyalty, Review chỉ trong vài cú click.',
      ],
      tradeOffs:
        'Phí giao dịch theo phần trăm doanh thu và một số hạn chế về tùy biến sâu luồng thanh toán (Checkout extensibility).',
      implementationAdvice:
        'Nên sử dụng cổng thanh toán đối tác chính thức của Shopify tại Việt Nam để tối ưu phí giao dịch gateway.',
    },
  },
  {
    id: 'sample-cloud-provider',
    name: 'So sánh & Lựa chọn giải pháp hạ tầng đám mây (Cloud Provider)',
    businessName: 'Fintech Startup NextPay Solution',
    domain: 'Lựa chọn phần mềm & giải pháp công nghệ',
    category: 'Công nghệ',
    problemDescription:
      'Hệ sinh thái ứng dụng thanh toán tài chính cần chuyển đổi kiến trúc Microservices và Kubernetes lên nền tảng đám mây công cộng (Public Cloud). Tiêu chuẩn đặt ra là tuân thủ bảo mật tài chính PCI-DSS, độ trễ mạng thấp tại Đông Nam Á và chi phí tối ưu.',
    options: [
      {
        id: 'cloud-opt-1',
        name: 'Amazon Web Services (AWS)',
        description: 'Thị phần lớn nhất, hệ sinh thái dịch vụ tài chính đầy đủ nhất, cộng đồng kỹ sư đông đảo, giá tính theo nhu cầu.',
        color: '#f59e0b',
      },
      {
        id: 'cloud-opt-2',
        name: 'Google Cloud Platform (GCP)',
        description: 'Vượt trội về hạ tầng dữ liệu BigQuery, Kubernetes native (GKE) mượt mà nhất, mạng cáp quang toàn cầu độ trễ thấp.',
        color: '#3b82f6',
      },
      {
        id: 'cloud-opt-3',
        name: 'Microsoft Azure',
        description: 'Tối ưu cho doanh nghiệp dùng Active Directory và Microsoft 365, hỗ trợ Hybrid Cloud tốt, chính sách giá doanh nghiệp lớn.',
        color: '#0284c7',
      },
    ],
    criteria: [
      {
        id: 'cloud-c1',
        name: 'Bảo mật, Tuân thủ (PCI-DSS, ISO 27001)',
        weight: 30,
        description: 'Chứng chỉ bảo mật ngành tài chính, khả năng mã hóa KMS và kiểm soát phân quyền IAM.',
      },
      {
        id: 'cloud-c2',
        name: 'Hiệu năng Kubernetes & Độ trễ tại VN/Singapore',
        weight: 25,
        description: 'Thời gian phản hồi API dưới 50ms và độ ổn định của cụm container.',
      },
      {
        id: 'cloud-c3',
        name: 'Chi phí sử dụng & Gói hỗ trợ khởi nghiệp (Credits)',
        weight: 25,
        description: 'Mức giá máy chủ, băng thông ra ngoài (egress fee) và gói hỗ trợ vốn ban đầu.',
      },
      {
        id: 'cloud-c4',
        name: 'Khả năng hỗ trợ giải pháp AI & Phân tích dữ liệu',
        weight: 20,
        description: 'Các công cụ Machine Learning, kho dữ liệu Data Lakehouse phục vụ chống gian lận.',
      },
    ],
    scores: {
      'cloud-opt-1': { 'cloud-c1': 5, 'cloud-c2': 4, 'cloud-c3': 4, 'cloud-c4': 4 },
      'cloud-opt-2': { 'cloud-c1': 4, 'cloud-c2': 5, 'cloud-c3': 5, 'cloud-c4': 5 },
      'cloud-opt-3': { 'cloud-c1': 5, 'cloud-c2': 4, 'cloud-c3': 3, 'cloud-c4': 4 },
    },
    status: 'completed',
    createdAt: '2026-03-04T10:00:00.000Z',
    updatedAt: '2026-03-04T12:00:00.000Z',
    isSample: true,
    analysisRationale: {
      recommendedOptionName: 'Google Cloud Platform (GCP)',
      whyRecommended:
        'Google Cloud Platform đạt điểm WSM cao nhất (4.70/5.0). Đối với startup Fintech định hướng dữ liệu, dịch vụ Google Kubernetes Engine (GKE) cùng BigQuery mang lại lợi thế vượt bậc về tốc độ xử lý dữ liệu giao dịch thời gian thực và chi phí tối ưu nhờ cam kết tài trợ credit khởi nghiệp hấp dẫn.',
      keyStrengths: [
        'Dịch vụ GKE quản trị Kubernetes tốt nhất thị trường, tự động nâng cấp và phục hồi cụm worker nodes.',
        'BigQuery cho phép truy vấn hàng triệu bản ghi giao dịch thanh toán trong vài giây để phát hiện gian lận.',
        'Hạ tầng mạng cáp quang riêng đến trung tâm dữ liệu Singapore cho độ trễ về Việt Nam dưới 30ms.',
      ],
      tradeOffs:
        'Số lượng kỹ sư chuyên sâu chứng chỉ GCP tại thị trường Việt Nam ít hơn so với AWS.',
      implementationAdvice:
        'Tận dụng gói Google for Startups Cloud Program để tiết kiệm 100% chi phí hạ tầng máy chủ trong năm đầu tiên.',
    },
  },
  {
    id: 'sample-wms-automation',
    name: 'Đánh giá các phương án đầu tư công nghệ số hóa kho bãi (WMS)',
    businessName: 'Trung tâm Phân phối Logistics Miền Nam',
    domain: 'Quản lý kho hàng (WMS)',
    category: 'Đầu tư',
    problemDescription:
      'Kho hàng diện tích 15.000 m2 với 12.000 mã SKU hiện quản lý bằng sổ sách và Excel kết hợp giấy in phiếu xuất kho. Tỷ lệ nhầm lẫn đơn hàng là 2.5%, thời gian tìm hàng lâu gây ùn tắc giờ cao điểm. Cần quyết định mức độ đầu tư công nghệ số hóa kho phù hợp.',
    options: [
      {
        id: 'wms-opt-1',
        name: 'Phương án 1: WMS cơ bản + Máy quét mã vạch Barcode PDA',
        description: 'Đầu tư phần mềm WMS SaaS và trang bị 30 máy quét mã vạch cầm tay RF PDA cho nhân viên nhặt hàng.',
        color: '#0891b2',
      },
      {
        id: 'wms-opt-2',
        name: 'Phương án 2: Hệ thống chỉ dẫn nhặt hàng bằng ánh sáng (Pick-to-Light)',
        description: 'Lắp đặt đèn LED chỉ dẫn và màn hình hiển thị số lượng tại từng ô kệ hàng kết hợp băng tải trung chuyển.',
        color: '#8b5cf6',
      },
      {
        id: 'wms-opt-3',
        name: 'Phương án 3: Tự động hóa hoàn toàn bằng Robot AGV tự hành',
        description: 'Hệ thống giá kệ di động do robot AGV đưa đến trạm đóng gói, tự động hóa 90% nhân công.',
        color: '#ea580c',
      },
    ],
    criteria: [
      {
        id: 'wms-c1',
        name: 'Hiệu quả giảm sai sót đơn hàng',
        weight: 30,
        description: 'Mục tiêu đưa tỷ lệ nhặt sai sản phẩm từ 2.5% xuống dưới 0.1%.',
      },
      {
        id: 'wms-c2',
        name: 'Tổng vốn đầu tư ban đầu (CAPEX)',
        weight: 25,
        description: 'Khả năng thu xếp dòng tiền đầu tư thiết bị, bản quyền và chi phí cải tạo mặt bằng kho.',
      },
      {
        id: 'wms-c3',
        name: 'Thời gian hoàn vốn đầu tư (ROI)',
        weight: 25,
        description: 'Thời gian tiết kiệm chi phí nhân công và tổn thất hàng hóa để thu hồi vốn (mục tiêu dưới 18 tháng).',
      },
      {
        id: 'wms-c4',
        name: 'Khả năng mở rộng & Linh hoạt mặt bằng',
        weight: 20,
        description: 'Khả năng điều chỉnh layout kho khi mở rộng diện tích hoặc thay đổi cơ cấu sản phẩm.',
      },
    ],
    scores: {
      'wms-opt-1': { 'wms-c1': 4, 'wms-c2': 5, 'wms-c3': 5, 'wms-c4': 5 },
      'wms-opt-2': { 'wms-c1': 5, 'wms-c2': 3, 'wms-c3': 3, 'wms-c4': 3 },
      'wms-opt-3': { 'wms-c1': 5, 'wms-c2': 1, 'wms-c3': 2, 'wms-c4': 2 },
    },
    status: 'completed',
    createdAt: '2026-03-05T08:00:00.000Z',
    updatedAt: '2026-03-05T10:00:00.000Z',
    isSample: true,
    analysisRationale: {
      recommendedOptionName: 'Phương án 1: WMS cơ bản + Máy quét mã vạch Barcode PDA',
      whyRecommended:
        'Phương án 1 đạt điểm WSM cao nhất (4.70/5.0). Mặc dù Robot AGV và Pick-to-Light rất hiện đại, nhưng vốn đầu tư (CAPEX) lên đến hàng chục tỷ đồng và thời gian hoàn vốn kéo dài hơn 4 năm là rủi ro tài chính quá lớn. Phương án quét Barcode PDA giải quyết triệt để 90% lỗi sai sót chỉ với mức đầu tư vừa phải và thu hồi vốn chỉ trong 7 tháng.',
      keyStrengths: [
        'Vốn đầu tư ban đầu thấp, chỉ bằng 15% so với hệ thống Pick-to-Light và 5% so với Robot AGV.',
        'Thời gian hoàn vốn (ROI) nhanh chóng trong vòng 6 - 8 tháng.',
        'Linh hoạt tối đa: Có thể thay đổi vị trí giá kệ mà không cần tháo dỡ dây điện hay băng tải.',
      ],
      tradeOffs:
        'Tốc độ nhặt hàng vẫn phụ thuộc vào việc nhân viên đi bộ trong kho, chưa tối ưu hóa cơ bắp như hệ thống Goods-to-Person.',
      implementationAdvice:
        'Triển khai trước tại khu vực hàng bán chạy (Fast-moving items) để tạo bước đệm đào tạo thói quen quét mã cho thủ kho.',
    },
  },
  {
    id: 'sample-retail-site-selection',
    name: 'Lựa chọn địa điểm mở chi nhánh / Showroom kinh doanh mới',
    businessName: 'Chuỗi Cửa Hàng Trải Nghiệm Thiết Bị Công Nghệ',
    domain: 'Quản lý bán hàng & POS',
    category: 'Kinh doanh',
    problemDescription:
      'Chuỗi bán lẻ điện máy cần chọn 1 trong 3 địa điểm tại TP.HCM để mở showroom flagship diện tích 250m2. Cần cân đối lưu lượng người đi bộ, chỗ đỗ xe thuận tiện, giá thuê mặt bằng và mật độ cư dân có thu nhập khá trong bán kính 3km.',
    options: [
      {
        id: 'site-opt-1',
        name: 'Vị trí A: Mặt tiền phố thương mại Quận 1',
        description: 'Vị trí đắc địa trung tâm, thương hiệu nhận diện cực cao, giá thuê 160 triệu/tháng, vỉa hè hẹp khó để ô tô.',
        color: '#dc2626',
      },
      {
        id: 'site-opt-2',
        name: 'Vị trí B: Góc ngã tư trục đường chính Quận 7',
        description: 'Khu đô thị mới, mặt tiền rộng 12m, bãi đỗ xe ô tô thoải mái, giá thuê 95 triệu/tháng, lưu lượng khách đông đều.',
        color: '#16a34a',
      },
      {
        id: 'site-opt-3',
        name: 'Vị trí C: Tầng 1 Trung tâm thương mại sầm uất',
        description: 'Khách hàng có sẵn sức mua cao, an ninh và bãi xe chuẩn mực, giá thuê 130 triệu + 5% doanh thu, giờ mở cửa cố định.',
        color: '#2563eb',
      },
    ],
    criteria: [
      {
        id: 'site-c1',
        name: 'Lưu lượng khách hàng mục tiêu & Mật độ cư dân',
        weight: 30,
        description: 'Số lượng người đi bộ và phương tiện qua lại có thu nhập từ 20 triệu/tháng trở lên.',
      },
      {
        id: 'site-c2',
        name: 'Chi phí thuê & Điều khoản hợp đồng',
        weight: 25,
        description: 'Tổng tiền thuê hàng tháng, thời hạn cam kết giữ giá và mức cọc.',
      },
      {
        id: 'site-c3',
        name: 'Tiện ích đỗ xe (Xe máy & Ô tô)',
        weight: 25,
        description: 'Khả năng giữ chân khách hàng ghé trải nghiệm lâu mà không lo ngại chỗ gửi xe.',
      },
      {
        id: 'site-c4',
        name: 'Mức độ nhận diện thương hiệu & Tầm nhìn biển hiệu',
        weight: 20,
        description: 'Góc nhìn không bị cây cối hay cột điện che khuất, thu hút chú ý từ xa.',
      },
    ],
    scores: {
      'site-opt-1': { 'site-c1': 5, 'site-c2': 2, 'site-c3': 2, 'site-c4': 5 },
      'site-opt-2': { 'site-c1': 4, 'site-c2': 4, 'site-c3': 5, 'site-c4': 4 },
      'site-opt-3': { 'site-c1': 4, 'site-c2': 3, 'site-c3': 4, 'site-c4': 3 },
    },
    status: 'completed',
    createdAt: '2026-03-06T09:00:00.000Z',
    updatedAt: '2026-03-06T11:30:00.000Z',
    isSample: true,
    analysisRationale: {
      recommendedOptionName: 'Vị trí B: Góc ngã tư trục đường chính Quận 7',
      whyRecommended:
        'Vị trí B đạt điểm WSM cao nhất (4.25/5.0). Đối với mặt hàng thiết bị công nghệ cao cấp, khách hàng thường có xu hướng trải nghiệm sản phẩm từ 30 đến 45 phút, do đó tiện ích bãi đỗ xe ô tô và vỉa hè rộng rãi của Vị trí B mang lại giá trị chuyển đổi doanh thu thực tế cao hơn so với vị trí trung tâm Quận 1 nhưng bất tiện gửi xe.',
      keyStrengths: [
        'Bãi đỗ xe ô tô và xe máy rộng rãi ngay trước cửa hàng, tạo trải nghiệm mua sắm an tâm.',
        'Giá thuê 95 triệu/tháng giúp điểm hòa vốn (Break-even) chỉ cần đạt 60% so với vị trí Quận 1.',
        'Mặt tiền góc ngã tư cho tầm nhìn 2 mặt tiền cực kỳ nổi bật.',
      ],
      tradeOffs:
        'Lưu lượng khách vãng lai buổi sáng ít hơn so với khu vực Quận 1.',
      implementationAdvice:
        'Ký hợp đồng thuê tối thiểu 5 năm kèm điều khoản cố định giá thuê trong 3 năm đầu để bảo vệ biên lợi nhuận.',
    },
  },
  {
    id: 'sample-marketing-strategy',
    name: 'Đánh giá & Lựa chọn chiến lược Marketing tăng trưởng',
    businessName: 'Doanh nghiệp Dược Mỹ phẩm Thảo dược',
    domain: 'Quản lý bán hàng & POS',
    category: 'Marketing',
    problemDescription:
      'Ngân sách tiếp thị quý 3 là 600 triệu đồng. Mục tiêu là gia tăng doanh thu gấp đôi và xây dựng tài sản thương hiệu bền vững. Cần chọn chiến lược chủ đạo giữa quảng cáo hiệu suất chuyển đổi ngay (Performance Ads), xây dựng nội dung Inbound/SEO dài hạn, hay hợp tác người ảnh hưởng (KOLs/KOCs).',
    options: [
      {
        id: 'mkt-opt-1',
        name: 'Chiến lược 1: Tập trung Quảng cáo số đa kênh (Performance Ads)',
        description: 'Dồn 80% ngân sách vào Facebook Ads, Google Search và TikTok Ads để tạo đơn hàng ngay lập tức.',
        color: '#3b82f6',
      },
      {
        id: 'mkt-opt-2',
        name: 'Chiến lược 2: Xây dựng Inbound Marketing & SEO bền vững',
        description: 'Đầu tư sản xuất bài viết chuyên gia, video chia sẻ kiến thức chăm sóc da, tối ưu công cụ tìm kiếm.',
        color: '#10b981',
      },
      {
        id: 'mkt-opt-3',
        name: 'Chiến lược 3: Tiếp thị qua Người ảnh hưởng & Livestream (KOLs/KOCs)',
        description: 'Hợp tác 20 bác sĩ da liễu và beauty blogger đánh giá sản phẩm thực tế kết hợp livestream bán hàng.',
        color: '#ec4899',
      },
    ],
    criteria: [
      {
        id: 'mkt-c1',
        name: 'Tỷ suất hoàn vốn đầu tư (ROAS / Doanh thu ngắn hạn)',
        weight: 30,
        description: 'Khả năng mang lại dòng tiền và đơn hàng ngay trong vòng 30 ngày.',
      },
      {
        id: 'mkt-c2',
        name: 'Xây dựng uy tín & Niềm tin thương hiệu (Brand Trust)',
        weight: 25,
        description: 'Mức độ tin cậy của khách hàng đối với thành phần thảo dược và chứng nhận y khoa.',
      },
      {
        id: 'mkt-c3',
        name: 'Chi phí sở hữu khách hàng (CAC)',
        weight: 25,
        description: 'Chi phí bình quân để có được 1 khách hàng mới mua đơn hàng đầu tiên.',
      },
      {
        id: 'mkt-c4',
        name: 'Giá trị tích lũy tài sản dài hạn',
        weight: 20,
        description: 'Khả năng tái sử dụng nội dung và thu hút khách hàng tự nhiên (Organic) trong tương lai.',
      },
    ],
    scores: {
      'mkt-opt-1': { 'mkt-c1': 4, 'mkt-c2': 2, 'mkt-c3': 3, 'mkt-c4': 1 },
      'mkt-opt-2': { 'mkt-c1': 2, 'mkt-c2': 4, 'mkt-c3': 4, 'mkt-c4': 5 },
      'mkt-opt-3': { 'mkt-c1': 4, 'mkt-c2': 5, 'mkt-c3': 4, 'mkt-c4': 4 },
    },
    status: 'completed',
    createdAt: '2026-03-07T08:30:00.000Z',
    updatedAt: '2026-03-07T10:45:00.000Z',
    isSample: true,
    analysisRationale: {
      recommendedOptionName: 'Chiến lược 3: Tiếp thị qua Người ảnh hưởng & Livestream (KOLs/KOCs)',
      whyRecommended:
        'Chiến lược 3 đạt điểm số cao nhất (4.25/5.0). Ngành Dược Mỹ phẩm đặc thù phụ thuộc vào uy tín chuyên môn và trải nghiệm người dùng thực tế. Việc kết hợp bác sĩ da liễu và KOCs uy tín vừa kích hoạt doanh thu tức thì qua livestream, vừa xây dựng niềm tin thương hiệu bền vững vượt trội hơn hẳn so với việc chạy quảng cáo Ads đơn thuần.',
      keyStrengths: [
        'Xây dựng niềm tin vững chắc nhờ bảo chứng của đội ngũ bác sĩ và chuyên gia da liễu.',
        'Kết hợp linh hoạt giữa nhận diện thương hiệu (Branding) và chuyển đổi đơn hàng trực tiếp.',
        'Nội dung review chân thực có thể tái sử dụng làm tư liệu quảng cáo (User-generated content).',
      ],
      tradeOffs:
        'Cần quản lý chặt chẽ kịch bản truyền thông để tránh rủi ro phát ngôn quá đà vi phạm quy định quảng cáo mỹ phẩm.',
      implementationAdvice:
        'Lựa chọn các Micro-KOCs có tệp fan trung thành và có kiến thức chuyên môn thật, tránh thuê các ngôi sao giải trí chi phí đắt đỏ nhưng tỷ lệ chuyển đổi đơn thấp.',
    },
  },
  {
    id: 'sample-hrm-software',
    name: 'Lựa chọn phần mềm quản trị nhân sự HRM & Tính lương',
    businessName: 'Tập đoàn Dịch vụ & Thương mại Đa ngành (450 nhân sự)',
    domain: 'Quản lý nhân sự (HRM)',
    category: 'Quản trị',
    problemDescription:
      'Quy mô nhân sự tăng nhanh lên 450 người với nhiều ca kíp phức tạp tại văn phòng và chi nhánh. Bộ phận C&B mất 6 ngày mỗi tháng để chốt công và tính lương bằng bảng tính Excel dễ sai sót. Cần phần mềm HRM tự động hóa chấm công, tính lương KPI, quản lý hồ sơ và đánh giá hiệu suất.',
    options: [
      {
        id: 'hrm-opt-1',
        name: 'Base HRM Platform',
        description: 'Hệ sinh thái SaaS nhân sự hàng đầu Việt Nam, phân hệ chuyên sâu từ tuyển dụng, onboarding đến tính lương.',
        color: '#2563eb',
      },
      {
        id: 'hrm-opt-2',
        name: '1Office All-in-one',
        description: 'Nền tảng tích hợp trọn gói quản trị nhân sự, công việc và truyền thông nội bộ với chi phí trọn gói.',
        color: '#059669',
      },
      {
        id: 'hrm-opt-3',
        name: 'SAP SuccessFactors',
        description: 'Chuẩn mực quốc tế cho tập đoàn đa quốc gia, tính năng quản trị nhân tài toàn diện, chi phí triển khai cực lớn.',
        color: '#d97706',
      },
    ],
    criteria: [
      {
        id: 'hrm-c1',
        name: 'Khả năng xử lý ca kíp phức tạp & Tính lương tự động',
        weight: 35,
        description: 'Tự động tổng hợp dữ liệu máy chấm công, tính thuế TNCN, bảo hiểm và lương KPI không sai sót.',
      },
      {
        id: 'hrm-c2',
        name: 'Trải nghiệm ứng dụng di động cho nhân viên (Mobile App)',
        weight: 25,
        description: 'Nhân viên dễ dàng xin nghỉ phép, xem phiếu lương và check-in chấm công bằng GPS/Wifi trên điện thoại.',
      },
      {
        id: 'hrm-c3',
        name: 'Chi phí bản quyền hàng năm (User License)',
        weight: 20,
        description: 'Mức phí trên đầu người (User/tháng) phù hợp với ngân sách định kỳ của công ty.',
      },
      {
        id: 'hrm-c4',
        name: 'Thời gian chuyển đổi dữ liệu & Đào tạo',
        weight: 20,
        description: 'Đội ngũ triển khai am hiểu luật lao động Việt Nam và hỗ trợ chuyển đổi dữ liệu lịch sử.',
      },
    ],
    scores: {
      'hrm-opt-1': { 'hrm-c1': 5, 'hrm-c2': 5, 'hrm-c3': 4, 'hrm-c4': 4 },
      'hrm-opt-2': { 'hrm-c1': 4, 'hrm-c2': 4, 'hrm-c3': 5, 'hrm-c4': 4 },
      'hrm-opt-3': { 'hrm-c1': 5, 'hrm-c2': 4, 'hrm-c3': 1, 'hrm-c4': 2 },
    },
    status: 'completed',
    createdAt: '2026-03-08T09:00:00.000Z',
    updatedAt: '2026-03-08T11:00:00.000Z',
    isSample: true,
    analysisRationale: {
      recommendedOptionName: 'Base HRM Platform',
      whyRecommended:
        'Base HRM đạt điểm WSM cao nhất (4.60/5.0). Giải pháp này đáp ứng xuất sắc bài toán phân ca kíp linh hoạt và công thức lương phức tạp theo luật lao động Việt Nam (trọng số 35%), đồng thời ứng dụng mobile trực quan giúp 100% nhân viên dễ dàng tự quản lý ngày công và phiếu lương minh bạch.',
      keyStrengths: [
        'Công cụ tính lương Payroll linh hoạt, cho phép cấu hình công thức lương và khấu trừ thuế chuẩn xác.',
        'Mobile app mượt mà hỗ trợ chấm công nhận diện khuôn mặt và định vị GPS tại các chi nhánh.',
        'Hệ thống phân quyền bảo mật dữ liệu lương nhiều cấp rõ ràng.',
      ],
      tradeOffs:
        'Chi phí tính theo từng ứng dụng (App modular) có thể tăng nếu công ty muốn mua thêm toàn bộ các module nâng cao.',
      implementationAdvice:
        'Nên chạy song song bảng tính lương trên Base HRM và bảng tính Excel trong 1 tháng đầu tiên để đối soát độ chính xác tuyệt đối.',
    },
  },
];

// Default sample project for quick starter in Overview
export const SAMPLE_PROJECT: Project = SAMPLE_PROJECTS_LIBRARY[0];

export const INDUSTRY_DOMAINS = [
  'Quản lý sản xuất',
  'Quản lý tài chính – kế toán',
  'Quản lý khách hàng (CRM)',
  'Quản lý nhân sự (HRM)',
  'Quản lý kho hàng (WMS)',
  'Quản lý bán hàng & POS',
  'Lựa chọn phần mềm & giải pháp công nghệ',
  'Quản lý chuỗi cung ứng & Logistics',
  'Đầu tư dự án & Mua sắm trang thiết bị',
  'Lĩnh vực khác',
];
