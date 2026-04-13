import React from 'react';
import LegalLayout from '../../layouts/LegalLayout';

const TermsOfService = () => {
  return (
    <LegalLayout title="Điều khoản dịch vụ">
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">1. Chấp nhận điều khoản</h2>
        <p>
          Bằng cách truy cập và sử dụng dịch vụ HR Lite, bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và điều kiện này. 
          Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, bạn không được phép sử dụng dịch vụ.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">2. Tài khoản người dùng</h2>
        <p>
          Bạn có trách nhiệm bảo mật thông tin tài khoản và mật khẩu của mình. 
          Bạn đồng ý chịu trách nhiệm cho tất cả các hoạt động diễn ra dưới tài khoản của bạn. 
          HR Lite có quyền từ chối dịch vụ, chấm dứt tài khoản hoặc xóa nội dung nếu phát hiện vi phạm.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">3. Sử dụng hợp pháp</h2>
        <p>
          Bạn đồng ý chỉ sử dụng dịch vụ cho các mục đích hợp pháp và theo đúng quy định của pháp luật về tuyển dụng và bảo vệ dữ liệu cá nhân. 
          Nghiêm cấm việc tải lên các nội dung độc hại, lừa đảo hoặc vi phạm bản quyền.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">4. Sở hữu trí tuệ</h2>
        <p>
          Mọi nội dung, tính năng và chức năng của HR Lite (bao gồm nhưng không giới hạn ở văn bản, đồ họa, logo, mã nguồn) đều thuộc sở hữu của HR Lite 
          và được bảo vệ bởi luật sở hữu trí tuệ.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">5. Giới hạn trách nhiệm</h2>
        <p>
          HR Lite cung cấp dịch vụ "như hiện tại". Chúng tôi không đảm bảo rằng dịch vụ sẽ không bị gián đoạn hoặc không có lỗi. 
          Trong mọi trường hợp, chúng tôi không chịu trách nhiệm cho bất kỳ thiệt hại trực tiếp, gián tiếp hoặc ngẫu nhiên nào phát sinh từ việc sử dụng dịch vụ.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">6. Thay đổi điều khoản</h2>
        <p>
          Chúng tôi có quyền cập nhật các điều khoản này bất cứ lúc nào. Việc bạn tiếp tục sử dụng dịch vụ sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.
        </p>
      </section>
    </LegalLayout>
  );
};

export default TermsOfService;
