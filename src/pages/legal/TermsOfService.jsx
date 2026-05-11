import React from 'react';
import LegalLayout from '../../layouts/LegalLayout';

const TermsOfService = () => {
  return (
    <LegalLayout 
      title="Điều khoản dịch vụ" 
      description="Điều khoản sử dụng dịch vụ HR Lite. Quy định về quyền sở hữu dữ liệu, trách nhiệm người dùng và các điều kiện sử dụng nền tảng."
    >
      <div className="space-y-12 py-10">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface">1. Chấp nhận điều khoản</h2>
          <p className="text-on-surface-variant leading-relaxed opacity-80">
            Bằng việc sử dụng HR Lite, bạn đồng ý tuân theo các Điều khoản dịch vụ này. Nếu bạn đại diện cho một tổ chức, bạn khẳng định mình có quyền ràng buộc tổ chức đó với các điều khoản này.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface">2. Tài khoản và Bảo mật</h2>
          <p className="text-on-surface-variant leading-relaxed opacity-80">
            Bạn phải cung cấp thông tin chính xác khi đăng ký tài khoản. Bạn chịu trách nhiệm hoàn toàn về việc bảo mật mật khẩu và tất cả các hoạt động diễn ra trong tài khoản của mình. Thông báo ngay cho chúng tôi nếu có bất kỳ hành vi truy cập trái phép nào.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface">3. Quyền sở hữu nội dung</h2>
          <ul className="list-disc pl-6 space-y-2 text-on-surface-variant opacity-80">
            <li><strong>Nội dung của bạn:</strong> Bạn giữ mọi quyền sở hữu đối với dữ liệu tuyển dụng và thông tin ứng viên mà bạn tải lên. HR Lite không xác nhận quyền sở hữu đối với nội dung này.</li>
            <li><strong>Dịch vụ của chúng tôi:</strong> Toàn bộ giao diện, mã nguồn, và thuật toán AI của HR Lite là tài sản trí tuệ của chúng tôi và được bảo vệ bởi pháp luật.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface">4. Giới hạn trách nhiệm</h2>
          <p className="text-on-surface-variant leading-relaxed opacity-80">
            Dịch vụ được cung cấp "như hiện tại". HR Lite không chịu trách nhiệm về bất kỳ thiệt hại trực tiếp hoặc gián tiếp nào phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ, bao gồm nhưng không giới hạn ở việc mất dữ liệu hoặc gián đoạn kinh doanh.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface">5. Chấm dứt dịch vụ</h2>
          <p className="text-on-surface-variant leading-relaxed opacity-80">
            Chúng tôi có quyền tạm ngừng hoặc chấm dứt quyền truy cập của bạn vào dịch vụ nếu bạn vi phạm bất kỳ điều khoản nào hoặc tham gia vào các hành vi gây hại cho hệ thống.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface">6. Thay đổi điều khoản</h2>
          <p className="text-on-surface-variant leading-relaxed opacity-80">
            Các điều khoản này có thể được cập nhật theo thời gian. Chúng tôi sẽ thông báo cho bạn về các thay đổi quan trọng bằng cách đăng thông báo trên trang web hoặc gửi email.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
};

export default TermsOfService;
