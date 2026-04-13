import React from 'react';
import LegalLayout from '../../layouts/LegalLayout';

const PrivacyPolicy = () => {
  return (
    <LegalLayout title="Chính sách bảo mật">
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">1. Thu thập thông tin</h2>
        <p>
          HR Lite thu thập các thông tin cần thiết để cung cấp dịch vụ quản lý tuyển dụng, bao gồm nhưng không giới hạn ở:
          Họ tên, địa chỉ email, số điện thoại của nhà tuyển dụng và thông tin trong hồ sơ ứng viên (CV) được tải lên hệ thống.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">2. Mục đích sử dụng</h2>
        <p>
          Chúng tôi sử dụng thông tin của bạn để:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Quản lý và tổ chức quy trình tuyển dụng của bạn.</li>
          <li>Sử dụng trí tuệ nhân tạo (AI) để phân tích và đối soát ứng viên với yêu cầu công việc.</li>
          <li>Gửi các thông báo quan trọng liên quan đến tài khoản và dịch vụ.</li>
          <li>Cải thiện trải nghiệm người dùng và chất lượng dịch vụ.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">3. Bảo mật dữ liệu</h2>
        <p>
          Chúng tôi cam kết bảo vệ dữ liệu của bạn bằng các biện pháp an ninh tiêu chuẩn ngành. 
          HR Lite sử dụng nền tảng Firebase của Google để lưu trữ dữ liệu, đảm bảo tính an toàn, bảo mật và khả năng truy cập nhanh chóng.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">4. Chia sẻ thông tin</h2>
        <p>
          Chúng tôi không bán, cho thuê hoặc chia sẻ thông tin cá nhân của bạn với bên thứ ba cho mục đích tiếp thị. 
          Thông tin chỉ được chia sẻ khi có sự đồng ý của bạn hoặc khi được yêu cầu bởi pháp luật.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">5. Liên hệ</h2>
        <p>
          Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật này, vui lòng liên hệ với chúng tôi qua email: admin@thanhnghiep.top
        </p>
      </section>
    </LegalLayout>
  );
};

export default PrivacyPolicy;
