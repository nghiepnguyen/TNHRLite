import React, { useState } from 'react';
import LegalLayout from '../../layouts/LegalLayout';

const ContactSupport = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('sending');
    // Simulate sending
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <LegalLayout title="Liên hệ hỗ trợ">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-on-surface">Thông tin liên hệ</h2>
            <p>Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Vui lòng liên hệ qua các kênh sau:</p>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase opacity-50">Email</div>
                  <div className="font-medium">admin@thanhnghiep.top</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase opacity-50">Thời gian làm việc</div>
                  <div className="font-medium">Thứ 2 - Thứ 6: 08:30 - 18:00</div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-on-surface">Tại sao lại cần hỗ trợ?</h2>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Bạn gặp lỗi kỹ thuật khi sử dụng Dashboard.</li>
              <li>Bạn cần hướng dẫn thêm về cách sử dụng AI đối soát CV.</li>
              <li>Bạn muốn đề xuất tính năng mới cho HR Lite.</li>
              <li>Bạn có yêu cầu về dữ liệu hoặc bảo mật.</li>
            </ul>
          </section>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-surface-container-high">
          <h2 className="text-xl font-bold text-on-surface mb-6">Gửi tin nhắn cho chúng tôi</h2>
          {status === 'success' ? (
            <div className="bg-green-50 text-green-700 p-6 rounded-xl border border-green-100 text-center space-y-4">
              <span className="material-symbols-outlined !text-4xl">check_circle</span>
              <p className="font-bold">Cảm ơn bạn!</p>
              <p className="text-sm">Chúng tôi đã nhận được tin nhắn và sẽ phản hồi sớm nhất có thể.</p>
              <button 
                onClick={() => setStatus(null)}
                className="text-primary font-bold text-sm underline"
              >
                Gửi tin nhắn khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase opacity-50 mb-1">Họ tên</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-surface-container-high focus:outline-none focus:border-primary transition-colors bg-surface-container-lowest"
                  placeholder="Họ tên của bạn"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase opacity-50 mb-1">Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-surface-container-high focus:outline-none focus:border-primary transition-colors bg-surface-container-lowest"
                  placeholder="email@vidu.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase opacity-50 mb-1">Chủ đề</label>
                <input 
                  type="text" 
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-surface-container-high focus:outline-none focus:border-primary transition-colors bg-surface-container-lowest"
                  placeholder="Chủ đề bạn cần hỗ trợ"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase opacity-50 mb-1">Nội dung</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl border border-surface-container-high focus:outline-none focus:border-primary transition-colors bg-surface-container-lowest resize-none"
                  placeholder="Chi tiết câu hỏi hoặc vấn đề của bạn..."
                ></textarea>
              </div>
              <button 
                type="submit"
                disabled={status === 'sending'}
                className="w-full editorial-gradient text-white py-4 rounded-xl font-headline font-bold hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-50"
              >
                {status === 'sending' ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </button>
            </form>
          )}
        </div>
      </div>
    </LegalLayout>
  );
};

export default ContactSupport;
