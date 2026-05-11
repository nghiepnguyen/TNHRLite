import React from 'react';
import LegalLayout from '../../layouts/LegalLayout';

const PrivacyPolicy = () => {
  return (
    <LegalLayout 
      title="Chính sách bảo mật" 
      description="Chính sách bảo mật của HR Lite. Chúng tôi cam kết bảo vệ dữ liệu tuyển dụng và thông tin cá nhân của bạn với tiêu chuẩn bảo mật cao nhất."
    >
      <div className="space-y-12 py-10">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface">1. Thu thập thông tin</h2>
          <p className="text-on-surface-variant leading-relaxed opacity-80">
            HR Lite thu thập các thông tin cần thiết để cung cấp dịch vụ quản lý tuyển dụng hiệu quả. Các loại dữ liệu bao gồm:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-on-surface-variant opacity-80">
            <li><strong>Thông tin tài khoản:</strong> Tên, email, và mật khẩu khi bạn đăng ký.</li>
            <li><strong>Thông tin tuyển dụng:</strong> Dữ liệu về các vị trí tuyển dụng, yêu cầu công việc.</li>
            <li><strong>Thông tin ứng viên:</strong> CV, tên, thông tin liên lạc và các đánh giá liên quan đến ứng viên mà bạn tải lên hệ thống.</li>
            <li><strong>Dữ liệu sử dụng:</strong> Thông tin về cách bạn tương tác với ứng dụng để chúng tôi cải thiện hiệu suất.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface">2. Mục đích sử dụng thông tin</h2>
          <p className="text-on-surface-variant leading-relaxed opacity-80">
            Chúng tôi sử dụng thông tin của bạn cho các mục đích cụ thể sau:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-on-surface-variant opacity-80">
            <li>Cung cấp, duy trì và cải thiện các tính năng của HR Lite.</li>
            <li>Xử lý và phân tích hồ sơ ứng viên bằng công nghệ AI để đối soát với yêu cầu công việc.</li>
            <li>Gửi các thông báo quan trọng về thay đổi dịch vụ hoặc bảo mật.</li>
            <li>Hỗ trợ khách hàng và giải quyết các vấn đề kỹ thuật.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface">3. Bảo mật và Lưu trữ Dữ liệu</h2>
          <p className="text-on-surface-variant leading-relaxed opacity-80">
            Bảo mật dữ liệu là ưu tiên hàng đầu của chúng tôi:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-on-surface-variant opacity-80">
            <li><strong>Mã hóa:</strong> Dữ liệu nhạy cảm được mã hóa khi truyền tải và khi lưu trữ.</li>
            <li><strong>Cơ sở hạ tầng:</strong> Chúng tôi sử dụng Google Firebase - nền tảng đám mây đạt tiêu chuẩn bảo mật quốc tế.</li>
            <li><strong>Kiểm soát quyền truy cập:</strong> Chỉ những người dùng được bạn cấp quyền mới có thể xem dữ liệu trong Workspace của bạn.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface">4. Quyền của người dùng</h2>
          <p className="text-on-surface-variant leading-relaxed opacity-80">
            Bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa dữ liệu cá nhân của mình bất cứ lúc nào thông qua phần cài đặt tài khoản hoặc bằng cách liên hệ với chúng tôi.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface">5. Liên hệ</h2>
          <p className="text-on-surface-variant leading-relaxed opacity-80">
            Mọi thắc mắc về Chính sách bảo mật, vui lòng gửi về: <br />
            <strong>Email:</strong> admin@thanhnghiep.top <br />
            <strong>Website:</strong> hr-lite.com
          </p>
        </section>
      </div>
    </LegalLayout>
  );
};

export default PrivacyPolicy;
