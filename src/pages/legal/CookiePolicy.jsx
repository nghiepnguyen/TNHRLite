import React from 'react';
import LegalLayout from '../../layouts/LegalLayout';

const CookiePolicy = () => {
  return (
    <LegalLayout title="Chính sách Cookie">
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">1. Cookie là gì?</h2>
        <p>
          Cookie là các tệp văn bản nhỏ được lưu trữ trên thiết bị của bạn khi bạn truy cập một trang web. 
          Chúng giúp trang web ghi nhớ thông tin về hoạt động và tùy sở thích của bạn trong một khoảng thời gian.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">2. Cách chúng tôi sử dụng Cookie</h2>
        <p>
          HR Lite sử dụng cookie cho các mục đích sau:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Xác thực:</strong> Để nhận diện bạn khi bạn đăng nhập và duy trì phiên làm việc của bạn.</li>
          <li><strong>Bảo mật:</strong> Để hỗ trợ các tính năng bảo mật và giúp chúng tôi phát hiện các hoạt động độc hại.</li>
          <li><strong>Tùy chọn:</strong> Để ghi nhớ các cài đặt cá nhân của bạn trên giao diện người dùng.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">3. Các loại Cookie chúng tôi sử dụng</h2>
        <p>
          Chúng tôi chủ yếu sử dụng <strong>Cookie thiết yếu</strong>. Đây là những cookie cần thiết để trang web hoạt động bình thường 
          và không thể tắt được trong hệ thống của chúng tôi. Chúng thường chỉ được thiết lập để phản hồi các hành động do bạn thực hiện 
          như thiết lập tùy chọn bảo mật hoặc đăng nhập.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">4. Quản lý Cookie</h2>
        <p>
          Hầu hết các trình duyệt cho phép bạn kiểm soát cookie thông qua phần cài đặt. Tuy nhiên, nếu bạn hạn chế khả năng của trang web 
          trong việc thiết lập cookie, bạn có thể không sử dụng được đầy đủ các tính năng của HR Lite.
        </p>
      </section>
    </LegalLayout>
  );
};

export default CookiePolicy;
