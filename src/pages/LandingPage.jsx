import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useScrollReveal } from '../hooks/useScrollReveal';

const LandingPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Initialize scroll animations
  useScrollReveal();

  // FAQ local state
  const [openFaq, setOpenFaq] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleCTA = () => {
    navigate('/login');
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div
      className="text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden"
      style={{ backgroundColor: 'rgb(250, 249, 246)' }}
    >
      {/* TopAppBar */}
      <header className="bg-[#FAF9F6]/85 dark:bg-[#1F1F1F]/85 backdrop-blur-md fixed top-0 w-full z-50 border-b border-[#1F1F1F]/5">
        <nav className="flex justify-between items-center w-full px-6 md:px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-12">
            <span
              className="text-xl font-extrabold tracking-tighter text-[#1F1F1F] dark:text-[#FAF9F6] font-headline cursor-pointer flex items-center gap-2"
              onClick={() => navigate('/')}
            >
              <div className="w-8 h-8 editorial-gradient rounded-lg flex items-center justify-center text-white">
                <span className="material-symbols-outlined !text-[18px]">shield</span>
              </div>
              HR Lite
            </span>
            <div className="hidden md:flex gap-8">
              <a className="font-semibold text-sm tracking-tight text-[#1F1F1F]/70 dark:text-[#FAF9F6]/70 hover:text-primary transition-colors duration-200" href="#features">Tính năng</a>
              <a className="font-semibold text-sm tracking-tight text-[#1F1F1F]/70 dark:text-[#FAF9F6]/70 hover:text-primary transition-colors duration-200" href="#workflow">Quy trình</a>
              <a className="font-semibold text-sm tracking-tight text-[#1F1F1F]/70 dark:text-[#FAF9F6]/70 hover:text-primary transition-colors duration-200" href="#analytics">Phân tích</a>
              <a className="font-semibold text-sm tracking-tight text-[#1F1F1F]/70 dark:text-[#FAF9F6]/70 hover:text-primary transition-colors duration-200" href="#faq">Hỏi đáp</a>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-6">
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:block editorial-gradient text-white px-5 py-2.5 rounded-lg font-headline font-bold text-sm hover:opacity-90 active:scale-95 transition-all"
            >
              Bắt đầu ngay
            </button>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-[#1F1F1F] flex items-center justify-center"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="material-symbols-outlined text-2xl">
                {isMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-surface-container-high shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col p-6 gap-4">
              <a className="font-bold text-lg p-2" href="#features" onClick={() => setIsMenuOpen(false)}>Tính năng</a>
              <a className="font-bold text-lg p-2" href="#workflow" onClick={() => setIsMenuOpen(false)}>Quy trình</a>
              <a className="font-bold text-lg p-2" href="#analytics" onClick={() => setIsMenuOpen(false)}>Phân tích</a>
              <a className="font-bold text-lg p-2" href="#faq" onClick={() => setIsMenuOpen(false)}>Hỏi đáp</a>
              <hr className="my-2 border-surface-container-high" />
              <button
                onClick={() => navigate('/login')}
                className="editorial-gradient text-white px-5 py-4 rounded-xl font-headline font-bold text-center"
              >
                Bắt đầu ngay
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="pt-32">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 md:px-8 mb-24 md:mb-32">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="space-y-6 md:space-y-8 text-center md:text-left reveal reveal-left">
              <span
                className="inline-block uppercase tracking-[0.1em] font-bold text-[10px] md:text-xs px-3 py-1 rounded-full reveal reveal-up reveal-delay-200"
                style={{ color: 'rgb(79, 70, 229)', backgroundColor: 'rgb(224, 231, 255)' }}
              >
                HR Lite dành cho Nhà tuyển dụng độc lập
              </span>
              <h1 className="font-headline font-extrabold text-4xl sm:text-5xl lg:text-6xl text-on-surface leading-[1.1] tracking-tight">
                Thoát khỏi Excel và dữ liệu rời rạc trong tuyển dụng
              </h1>
              <p className="text-on-surface-variant text-base md:text-lg max-w-md mx-auto md:mx-0 font-light leading-relaxed reveal reveal-up reveal-delay-300">
                Thay thế các bảng tính rườm rà bằng một dashboard tinh gọn, được thiết kế riêng cho recruiter độc lập và đội ngũ nhỏ.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start reveal reveal-up reveal-delay-400">
                <button
                  onClick={handleCTA}
                  className="editorial-gradient text-white px-10 py-5 rounded-xl font-headline font-bold text-lg hover:opacity-90 transition-opacity w-full sm:w-auto shadow-xl shadow-primary/20"
                >
                  Bắt đầu ngay
                </button>
              </div>
            </div>
            <div className="relative mt-12 md:mt-0 reveal reveal-right reveal-delay-300">
              <div className="bg-surface-container-low rounded-2xl p-4 shadow-3xl shadow-on-surface/5 border border-white/50">
                {/* Realistic Dashboard Preview */}
                <div className="bg-white rounded-lg overflow-hidden border border-surface-container-high shadow-sm">
                  <div className="p-4 border-b border-surface-container-high flex justify-between items-center" style={{ backgroundColor: 'rgb(248, 250, 252)' }}>
                    <span className="font-headline font-bold text-sm">Danh sách công việc</span>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase">đang tuyển</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase">tạm dừng</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs reveal reveal-up reveal-delay-400">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold">PD</div>
                        <div>
                          <div className="font-bold">Product Designer</div>
                          <div className="text-on-surface-variant">Phụ trách: Minh Nguyễn</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">Hạn: 20/12</div>
                        <div className="text-primary font-bold">Đang tuyển</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs opacity-60 reveal reveal-up reveal-delay-500">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-tertiary/10 flex items-center justify-center text-tertiary font-bold">FE</div>
                        <div>
                          <div className="font-bold">Frontend Engineer</div>
                          <div className="text-on-surface-variant">Phụ trách: Lan Anh</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">Hạn: 15/12</div>
                        <div className="text-amber-600 font-bold">Tạm dừng</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating Stats - Hidden on Small Mobile, Repositioned on Desktop */}
              <div className="hidden sm:block absolute -top-8 -right-4 bg-white p-5 rounded-xl shadow-xl border border-surface-container-high space-y-1 transform transition-transform hover:scale-105 reveal reveal-up reveal-delay-500">
                <span className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Việc đang tuyển</span>
                <span className="block text-3xl font-headline font-black text-primary">12</span>
              </div>
              <div className="hidden sm:block absolute -bottom-10 -left-6 bg-white p-5 rounded-xl shadow-xl border border-surface-container-high space-y-1 transform transition-transform hover:scale-105 reveal reveal-up reveal-delay-600">
                <span className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Điểm tương thích</span>
                <span className="block text-3xl font-headline font-black" style={{ color: 'rgb(124, 58, 237)' }}>92%</span>
              </div>
              <div className="hidden lg:flex absolute top-1/2 -right-16 transform -translate-y-1/2 flex-col gap-4 reveal reveal-right reveal-delay-700">
                <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-surface-container-high">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 rounded-full" style={{ backgroundColor: 'rgb(79, 70, 229)' }}></div>
                    <div>
                      <span className="block text-[10px] font-bold text-on-surface uppercase pr-4">Ứng viên</span>
                      <span className="block text-xl font-headline font-black">84</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-surface-container-high">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 rounded-full" style={{ backgroundColor: 'rgb(124, 58, 237)' }}></div>
                    <div>
                      <span className="block text-[10px] font-bold text-on-surface uppercase pr-4">Tiến độ</span>
                      <span className="block text-xl font-headline font-black">45%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24" style={{ backgroundColor: 'rgb(248, 250, 252)' }}>
          <div className="max-w-7xl mx-auto px-8">
            <div className="mb-16 reveal reveal-up">
              <h2 className="font-headline font-extrabold text-3xl mb-4 max-w-lg">Quản lý dữ liệu tuyển dụng tập trung, thay vì dùng nhiều file rời rạc và bảng tính thiếu ổn định.</h2>
            </div>
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 md:col-span-7 bg-white p-10 rounded-2xl flex flex-col justify-between min-h-[300px] shadow-sm transition-shadow hover:shadow-md reveal reveal-left">
                <span className="material-symbols-outlined text-tertiary text-4xl mb-6">scatter_plot</span>
                <div>
                  <h3 className="font-headline font-bold text-3xl mb-4 text-on-surface tracking-tight">Công việc rải rác khắp các tab</h3>
                  <p className="text-on-surface-variant leading-relaxed text-lg">Đừng tốn thời gian tìm kiếm trong trang bookmark và các luồng email. Lưu trữ tất cả vị trí tuyển dụng và yêu cầu khách hàng trong một hệ thống duy nhất.</p>
                </div>
              </div>
              <div
                className="col-span-12 md:col-span-5 p-10 rounded-2xl flex flex-col justify-between hover:bg-surface-container-highest transition-colors reveal reveal-right"
                style={{ backgroundColor: 'rgb(226, 232, 240)' }}
              >
                <span className="material-symbols-outlined text-tertiary text-4xl mb-6">person_search</span>
                <div>
                  <h3 className="font-headline font-bold text-3xl mb-4 text-on-surface tracking-tight">Khó theo dõi ứng viên</h3>
                  <p className="text-on-surface-variant leading-relaxed text-lg">Đừng để ứng viên tiềm năng bị trôi mất trong email. Quản lý toàn bộ quy trình tuyển dụng tại một nơi.</p>
                </div>
              </div>
              <div
                className="col-span-12 md:col-span-4 p-10 rounded-2xl shadow-sm reveal reveal-up"
                style={{ backgroundColor: 'rgb(224, 231, 255)' }}
              >
                <span className="material-symbols-outlined text-primary text-4xl mb-6 font-bold">speed</span>
                <h3 className="font-headline font-bold text-xl mb-3 text-on-primary-container tracking-tight">Sàng lọc chậm chạp</h3>
                <p className="text-on-primary-container text-sm leading-relaxed">Lọc thủ công mất hàng giờ. Hệ thống tính điểm của chúng tôi thực hiện trong vài giây.</p>
              </div>
              <div className="col-span-12 md:col-span-4 bg-white p-10 rounded-2xl shadow-sm border border-surface-container-high hover:border-tertiary/20 transition-colors reveal reveal-up reveal-delay-100">
                <span className="material-symbols-outlined text-tertiary text-4xl mb-6">visibility_off</span>
                <h3 className="font-headline font-bold text-xl mb-3 text-on-surface tracking-tight">Mất kiểm soát quy trình tuyển dụng</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">Theo dõi trạng thái của mọi ứng viên ngay trên một bảng điều khiển duy nhất.</p>
              </div>
              <div
                className="col-span-12 md:col-span-4 text-white p-10 rounded-2xl shadow-xl shadow-primary/10 transition-transform hover:scale-[1.02] reveal reveal-up reveal-delay-200"
                style={{ backgroundColor: 'rgb(79, 70, 229)' }}
              >
                <span className="material-symbols-outlined text-white text-4xl mb-6">analytics</span>
                <h3 className="font-headline font-bold text-xl mb-3 tracking-tight">Không có dữ liệu để ra quyết định.</h3>
                <p className="text-white text-sm leading-relaxed font-medium">Đo lường hiệu quả và cải thiện tỷ lệ tuyển dụng bằng dữ liệu thực tế.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Overview */}
        <section className="py-24 md:py-32 max-w-7xl mx-auto px-6 md:px-8 overflow-hidden" id="workflow">
          <div className="text-center mb-16 md:mb-20 reveal reveal-up">
            <h2 className="font-headline font-extrabold text-3xl md:text-4xl mb-4">Quy trình Dashboard</h2>
            <p className="text-on-surface-variant max-w-xl mx-auto text-sm md:text-base px-4">Sự chuyển đổi liền mạch từ tìm kiếm đến tuyển dụng thành công.</p>
          </div>
          <div className="relative flex flex-col md:flex-row justify-between items-center gap-12 md:gap-8 px-4 md:px-12">
            {/* Connection Lines */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-surface-container-highest -z-10 hidden md:block"></div>
            <div className="absolute left-1/2 top-0 w-0.5 h-full bg-surface-container-highest -z-10 md:hidden"></div>

            <div className="flex flex-col items-center group bg-white p-2 md:p-0 rounded-full md:bg-transparent flex-shrink-0 reveal reveal-up">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-md flex items-center justify-center border-4 border-surface group-hover:border-primary transition-all duration-300 flex-shrink-0">
                <span className="material-symbols-outlined text-primary !text-2xl md:!text-3xl">add_circle</span>
              </div>
              <span className="mt-4 font-headline font-bold text-[10px] md:text-sm uppercase tracking-widest text-center">Tạo việc</span>
            </div>
            
            <div className="flex flex-col items-center group bg-white p-2 md:p-0 rounded-full md:bg-transparent flex-shrink-0 reveal reveal-up reveal-delay-100">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-md flex items-center justify-center border-4 border-surface group-hover:border-primary transition-all duration-300 flex-shrink-0">
                <span className="material-symbols-outlined text-primary !text-2xl md:!text-3xl">group_add</span>
              </div>
              <span className="mt-4 font-headline font-bold text-[10px] md:text-sm uppercase tracking-widest text-center">Thêm ứng viên</span>
            </div>

            <div className="flex flex-col items-center group bg-white p-4 md:p-0 rounded-full md:bg-transparent relative flex-shrink-0 reveal reveal-up reveal-delay-200">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full editorial-gradient shadow-xl flex items-center justify-center border-8 border-surface md:scale-110 mb-2 md:mb-0 flex-shrink-0 z-10 transition-transform duration-300 group-hover:scale-105">
                <span className="material-symbols-outlined text-white !text-4xl md:!text-5xl">hub</span>
              </div>
              <span className="mt-4 font-headline font-extrabold text-primary text-[10px] md:text-sm uppercase tracking-widest text-center">Đối soát</span>
            </div>

            <div className="flex flex-col items-center group bg-white p-2 md:p-0 rounded-full md:bg-transparent flex-shrink-0 reveal reveal-up reveal-delay-300">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-md flex items-center justify-center border-4 border-surface group-hover:border-primary transition-all duration-300 flex-shrink-0">
                <span className="material-symbols-outlined text-primary !text-2xl md:!text-3xl">view_kanban</span>
              </div>
              <span className="mt-4 font-headline font-bold text-[10px] md:text-sm uppercase tracking-widest text-center">Quy trình</span>
            </div>

            <div className="flex flex-col items-center group bg-white p-2 md:p-0 rounded-full md:bg-transparent flex-shrink-0 reveal reveal-up reveal-delay-400">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-md flex items-center justify-center border-4 border-surface group-hover:border-primary transition-all duration-300 flex-shrink-0">
                <span className="material-symbols-outlined text-primary !text-2xl md:!text-3xl">monitoring</span>
              </div>
              <span className="mt-4 font-headline font-bold text-[10px] md:text-sm uppercase tracking-widest text-center">Phân tích</span>
            </div>
          </div>
        </section>

        {/* Feature Spotlights */}
        <section className="space-y-32 py-20" id="features">
          {/* 1. Job List */}
          <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-20 items-center">
            <div className="order-2 md:order-1">
              <div className="rounded-lg p-8 border border-white/50 shadow-sm" style={{ backgroundColor: 'rgb(248, 250, 252)' }}>
                <div className="bg-white rounded-lg p-6 space-y-4 shadow-md">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-headline font-bold">Danh mục Tuyển dụng</h4>
                    <button className="text-primary text-sm font-bold">+ Thêm mới</button>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-surface-container-low rounded flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">UI/UX Designer</span>
                        <span className="text-[10px] text-on-surface-variant">Hạn: 30/11 • Người tạo: Alex D.</span>
                      </div>
                      <span className="text-[10px] px-2 py-1 bg-green-100 text-green-700 rounded-full font-bold uppercase">đang tuyển</span>
                    </div>
                    <div className="p-3 border border-surface-container-high rounded flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">Backend Dev (Go)</span>
                        <span className="text-[10px] text-on-surface-variant">Hạn: 15/12 • Người tạo: Ngân UK.</span>
                      </div>
                      <span className="text-[10px] px-2 py-1 bg-indigo-100 text-primary rounded-full font-bold uppercase">hoàn thành</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 space-y-6 reveal reveal-right">
              <span className="text-tertiary font-headline font-bold uppercase tracking-widest text-xs reveal reveal-up reveal-delay-100">Cấu trúc</span>
              <h2 className="font-headline font-extrabold text-4xl">Trung tâm điều hành tuyển dụng</h2>
              <p className="text-on-surface-variant leading-relaxed reveal reveal-up reveal-delay-200">Tổ chức các vị trí theo khách hàng, mức độ ưu tiên hoặc trạng thái. Giao diện hiện đại giúp bạn nắm bắt nhanh thông tin và thao tác ngay khi cần.</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
                <li className="flex items-center gap-3 text-on-surface">
                  <span className="material-symbols-outlined text-primary !text-[18px] flex-shrink-0">check_circle</span>
                  <span className="text-sm">Gán thẻ tùy chỉnh cho các loại vai trò đặc thù</span>
                </li>
                <li className="flex items-center gap-3 text-on-surface">
                  <span className="material-symbols-outlined text-primary !text-[18px] flex-shrink-0">check_circle</span>
                  <span className="text-sm">Chia sẻ trực tiếp qua cổng thông tin khách hàng</span>
                </li>
                <li className="flex items-center gap-3 text-on-surface">
                  <span className="material-symbols-outlined text-primary !text-[18px] flex-shrink-0">check_circle</span>
                  <span className="text-sm">Tạo mô tả công việc chỉ với một cú nhấp chuột</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 2. Candidate Cards */}
          <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-20 items-center reveal reveal-up">
            <div className="space-y-6 reveal reveal-left">
              <span className="text-primary font-headline font-bold uppercase tracking-widest text-xs reveal reveal-up reveal-delay-100">Hồ sơ</span>
              <h2 className="font-headline font-extrabold text-4xl">Hồ sơ ứng viên, được tái định nghĩa</h2>
              <p className="text-on-surface-variant leading-relaxed reveal reveal-up reveal-delay-200">Không còn phải lục tìm trong file PDF. Hệ thống tự động trích xuất và hiển thị những thông tin quan trọng theo cách rõ ràng, dễ đọc.</p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-on-surface">
                  <span className="material-symbols-outlined text-primary !text-[18px] flex-shrink-0">check_circle</span>
                  <span className="text-sm">Tự động phân tích CV thông minh</span>
                </li>
                <li className="flex items-center gap-3 text-on-surface">
                  <span className="material-symbols-outlined text-primary !text-[18px] flex-shrink-0">check_circle</span>
                  <span className="text-sm">Tích hợp tra cứu hồ sơ mạng xã hội</span>
                </li>
                <li className="flex items-center gap-3 text-on-surface">
                  <span className="material-symbols-outlined text-primary !text-[18px] flex-shrink-0">check_circle</span>
                  <span className="text-sm">Ghi chú phỏng vấn với định dạng linh hoạt, dễ trình bày.</span>
                </li>
              </ul>
            </div>
            <div>
              <div className="rounded-lg p-8 border border-white/50 shadow-sm relative" style={{ backgroundColor: 'rgb(226, 232, 240)' }}>
                <div className="bg-white rounded-lg shadow-lg p-6 border border-surface-container-high">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant">person</span>
                    </div>
                    <div>
                      <h5 className="font-headline font-bold text-xl">Nguyễn Hoàng Nam</h5>
                      <p className="text-sm text-on-surface-variant">Senior Product Designer</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs mb-6">
                    <div>
                      <span className="block opacity-50 uppercase font-bold mb-1">Kinh nghiệm</span>
                      <span className="font-bold">6 năm kinh nghiệm</span>
                    </div>
                    <div>
                      <span className="block opacity-50 uppercase font-bold mb-1">Nguồn</span>
                      <span className="font-bold">LinkedIn</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-surface-container rounded text-[10px] font-bold">Figma</span>
                      <span className="px-2 py-1 bg-surface-container rounded text-[10px] font-bold">Prototyping</span>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded text-[10px] font-bold">Hồ sơ tốt</span>
                    </div>
                    <div className="p-3 bg-surface-container-low rounded border-l-4 border-primary italic text-xs">
                      "Kỹ năng tư duy sản phẩm rất tốt, xử lý vấn đề linh hoạt."
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg border border-surface-container-high">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-sm font-bold">Đề xuất cao</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Match Score */}
          <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-20 items-center reveal reveal-up">
            <div className="order-2 md:order-1 reveal reveal-left">
              <div
                className="rounded-lg p-12 border border-primary/10 flex flex-col items-center justify-center min-h-[400px]"
                style={{ backgroundColor: 'rgba(79, 70, 229, 0.05)' }}
              >
                <div className="text-center mb-8">
                  <div className="relative inline-block">
                    <svg className="w-48 h-48 transform -rotate-90">
                      <circle cx="96" cy="96" fill="transparent" r="88" stroke="rgb(226, 232, 240)" strokeWidth="12"></circle>
                      <circle className="text-primary" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeDasharray="552.92" strokeDashoffset="44.23" strokeWidth="12"></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-headline font-extrabold">92%</span>
                      <span className="text-xs uppercase tracking-widest font-bold opacity-50">Điểm tương thích</span>
                    </div>
                  </div>
                </div>
                <div className="w-full max-w-xs bg-white rounded-lg p-6 shadow-sm border border-surface-container-high space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span>Kỹ năng</span>
                    <span className="font-bold text-primary">95%</span>
                  </div>
                  <div className="w-full rounded-full h-1.5" style={{ backgroundColor: 'rgb(241, 245, 249)' }}>
                    <div className="h-1.5 rounded-full" style={{ width: '95%', backgroundColor: 'rgb(79, 70, 229)' }}></div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Kinh nghiệm</span>
                    <span className="font-bold text-primary">88%</span>
                  </div>
                  <div className="w-full rounded-full h-1.5" style={{ backgroundColor: 'rgb(241, 245, 249)' }}>
                    <div className="h-1.5 rounded-full" style={{ width: '88%', backgroundColor: 'rgb(79, 70, 229)' }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 space-y-6 reveal reveal-right">
              <span className="text-tertiary font-headline font-bold uppercase tracking-widest text-xs reveal reveal-up reveal-delay-100">Trí tuệ</span>
              <h2 className="font-headline font-extrabold text-4xl">Tính điểm Phù hợp bằng Thuật toán</h2>
              <p className="text-on-surface-variant leading-relaxed reveal reveal-up reveal-delay-200">Xem ngay ứng viên nào phù hợp nhất với yêu cầu công việc của bạn dựa trên kỹ năng, kinh nghiệm và kỳ vọng về ngân sách.</p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-on-surface">
                  <span className="material-symbols-outlined text-primary !text-[18px] flex-shrink-0">check_circle</span>
                  <span className="text-sm">Nhận diện lỗ hổng kỹ năng</span>
                </li>
                <li className="flex items-center gap-3 text-on-surface">
                  <span className="material-symbols-outlined text-primary !text-[18px] flex-shrink-0">check_circle</span>
                  <span className="text-sm">Theo dõi và đối chiếu kỳ vọng lương thưởng của ứng viên.</span>
                </li>
                <li className="flex items-center gap-3 text-on-surface">
                  <span className="material-symbols-outlined text-primary !text-[18px] flex-shrink-0">check_circle</span>
                  <span className="text-sm">Đề xuất câu hỏi đánh giá mức độ phù hợp văn hóa.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 4. Kanban Pipeline */}
          <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-20 items-center reveal reveal-up">
            <div className="space-y-6 reveal reveal-left">
              <span className="text-primary font-headline font-bold uppercase tracking-widest text-xs">Hiệu quả</span>
              <h2 className="font-headline font-extrabold text-4xl">Theo dõi Quy trình Trực quan</h2>
              <p className="text-on-surface-variant leading-relaxed">Bảng Kanban mượt mà, không còn cảm giác gò bó như bảng tính. Kéo thả dễ dàng và theo dõi tiến trình một cách trực quan.</p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-on-surface">
                  <span className="material-symbols-outlined text-primary !text-[18px] flex-shrink-0">check_circle</span>
                  <span className="text-sm">Kéo thả ứng viên giữa các giai đoạn dễ dàng</span>
                </li>
                <li className="flex items-center gap-3 text-on-surface">
                  <span className="material-symbols-outlined text-primary !text-[18px] flex-shrink-0">check_circle</span>
                  <span className="text-sm">Tự động nhắc lịch theo dõi</span>
                </li>
                <li className="flex items-center gap-3 text-on-surface">
                  <span className="material-symbols-outlined text-primary !text-[18px] flex-shrink-0">check_circle</span>
                  <span className="text-sm">Phân tích thời gian ở từng giai đoạn</span>
                </li>
              </ul>
            </div>
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold uppercase opacity-40">Sàng lọc</div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-surface-container-high">
                    <div className="font-bold text-sm">Elena R.</div>
                    <div className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tight">Full-stack Dev</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-surface-container-high">
                    <div className="font-bold text-sm">Marcus W.</div>
                    <div className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tight">UI Designer</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="text-[10px] font-bold uppercase text-primary">Phỏng vấn</div>
                  <div className="editorial-gradient text-white p-4 rounded-lg shadow-md">
                    <div className="font-bold text-sm">Sarah K.</div>
                    <div className="text-[10px] text-white/70 uppercase font-black">Product Lead</div>
                  </div>
                  <div className="text-[10px] font-bold uppercase opacity-20">Đề nghị</div>
                  <div className="bg-surface-container-low/50 border-2 border-dashed border-surface-container-high p-4 rounded-lg h-24 flex items-center justify-center">
                    <span className="material-symbols-outlined opacity-20">add</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Analytics Widgets */}
          <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-20 items-center reveal reveal-up" id="analytics">
            <div className="order-2 md:order-1 reveal reveal-left">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-surface-container-high h-44 flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase opacity-40">Tỷ lệ chuyển đổi</span>
                  <span className="text-4xl font-headline font-extrabold text-primary">24%</span>
                  <span className="text-[10px] text-green-600 font-bold">+2.1% so với tháng trước</span>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-surface-container-high h-44 flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase opacity-40">Tuyển dụng TB</span>
                  <span className="text-4xl font-headline font-extrabold text-tertiary">18 ngày</span>
                  <span className="text-[10px] opacity-40 italic">Thời gian tuyển dụng trung bình</span>
                </div>
                <div className="col-span-2 bg-white p-6 rounded-lg shadow-sm border border-surface-container-high h-48">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase opacity-40">Khối lượng công việc theo tháng</span>
                    <span className="text-[10px] font-bold text-primary">Nguồn tốt nhất: LinkedIn</span>
                  </div>
                  <div className="flex items-end justify-between h-24 mt-4 gap-2">
                    <div className="w-full rounded-t-sm" style={{ height: '40%', backgroundColor: 'rgb(226, 232, 240)' }}></div>
                    <div className="w-full rounded-t-sm" style={{ height: '60%', backgroundColor: 'rgb(226, 232, 240)' }}></div>
                    <div className="w-full rounded-t-sm" style={{ height: '90%', backgroundColor: 'rgb(79, 70, 229)' }}></div>
                    <div className="w-full rounded-t-sm" style={{ height: '50%', backgroundColor: 'rgb(226, 232, 240)' }}></div>
                    <div className="w-full rounded-t-sm" style={{ height: '70%', backgroundColor: 'rgb(226, 232, 240)' }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <span className="text-tertiary font-headline font-bold uppercase tracking-widest text-xs">Sự minh bạch</span>
              <h2 className="font-headline font-extrabold text-4xl">Dữ liệu giúp bạn ra quyết định tốt hơn</h2>
              <p className="text-on-surface-variant leading-relaxed">Hiểu rõ toàn bộ phễu tuyển dụng trong một cái nhìn. Dễ dàng theo dõi tỷ lệ chuyển đổi, thời gian tuyển dụng và chất lượng nguồn ứng viên.</p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-on-surface">
                  <span className="material-symbols-outlined text-primary !text-[18px] flex-shrink-0">check_circle</span>
                  <span className="text-sm">Theo dõi xu hướng tuyển dụng theo thời gian</span>
                </li>
                <li className="flex items-center gap-3 text-on-surface">
                  <span className="material-symbols-outlined text-primary !text-[18px] flex-shrink-0">check_circle</span>
                  <span className="text-sm">Báo cáo mức độ hài lòng của khách hàng</span>
                </li>
                <li className="flex items-center gap-3 text-on-surface">
                  <span className="material-symbols-outlined text-primary !text-[18px] flex-shrink-0">check_circle</span>
                  <span className="text-sm">Phát hiện điểm rò rỉ trong phễu tuyển dụng</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-32 reveal reveal-up" style={{ backgroundColor: 'rgba(226, 232, 240, 0.5)' }}>
          <div className="max-w-7xl mx-auto px-8">
            <h2 className="font-headline font-extrabold text-4xl mb-16 text-center reveal reveal-up">Thiết lập trong vài phút, không phải vài ngày.</h2>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="space-y-6 reveal reveal-up reveal-delay-100">
                <div className="text-6xl font-headline font-extrabold" style={{ color: 'rgb(203, 213, 225)' }}>01</div>
                <h3 className="font-headline font-bold text-xl">Tạo công việc đầu tiên</h3>
                <p className="text-on-surface-variant">Nhập yêu cầu từ PDF hoặc link. HR Lite tự động xây dựng cấu trúc tuyển dụng sẵn sàng để bắt đầu.</p>
              </div>
              <div className="space-y-6 reveal reveal-up reveal-delay-200">
                <div className="text-6xl font-headline font-extrabold" style={{ color: 'rgb(203, 213, 225)' }}>02</div>
                <h3 className="font-headline font-bold text-xl">Thêm ứng viên &amp; ghi chú</h3>
                <p className="text-on-surface-variant">Tải lên CV hàng loạt hoặc thêm thủ công. Ghi chú phỏng vấn được lưu ngay cạnh từng ứng viên.</p>
              </div>
              <div className="space-y-6 reveal reveal-up reveal-delay-300">
                <div className="text-6xl font-headline font-extrabold" style={{ color: 'rgb(203, 213, 225)' }}>03</div>
                <h3 className="font-headline font-bold text-xl">Theo dõi quy trình</h3>
                <p className="text-on-surface-variant">Trực quan hóa toàn bộ hành trình từ sàng lọc đến tuyển chọn với bảng Kanban và phân tích thông minh.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-32 max-w-7xl mx-auto px-8 reveal reveal-up">
          <h2 className="font-headline font-extrabold text-3xl mb-12 text-on-surface reveal reveal-up">HR Lite dành cho ai?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg border border-surface-container-low shadow-sm reveal reveal-up reveal-delay-100">
              <h3 className="font-headline font-bold text-xl mb-4 text-primary">HR Tự do</h3>
              <p className="text-on-surface-variant mb-6 leading-relaxed">Xử lý nhiều khách hàng cùng lúc mà không lo mất dấu ứng viên hay chi tiết dự án.</p>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Quy trình theo dự án</span>
            </div>
            <div className="bg-white p-8 rounded-lg border border-surface-container-low shadow-sm reveal reveal-up reveal-delay-200">
              <h3 className="font-headline font-bold text-xl mb-4 text-primary">Nhà tuyển dụng độc lập</h3>
              <p className="text-on-surface-variant mb-6 leading-relaxed">Một CRM tinh gọn tập trung vào nguồn tài năng và tốc độ tuyển chọn của bạn.</p>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Tập trung Talent CRM</span>
            </div>
            <div className="bg-white p-8 rounded-lg border border-surface-container-low shadow-sm reveal reveal-up reveal-delay-300">
              <h3 className="font-headline font-bold text-xl mb-4 text-primary">Đội ngũ Tuyển dụng nhỏ</h3>
              <p className="text-on-surface-variant mb-6 leading-relaxed">Cộng tác với những người sáng lập hoặc quản lý mà không bị choáng bởi các hệ thống ATS cồng kềnh.</p>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Cộng tác đội ngũ</span>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section
          className="py-24 md:py-32 text-white overflow-hidden relative"
          style={{ backgroundColor: 'rgb(79, 70, 229)' }}
        >
          <div className="absolute top-0 right-0 w-1/3 h-full editorial-gradient opacity-50 transform skew-x-12 translate-x-20"></div>
          <div className="max-w-4xl mx-auto px-6 md:px-8 text-center relative z-10 reveal reveal-up">
            <h2 className="font-headline font-extrabold text-3xl md:text-5xl mb-6 md:mb-8 leading-tight">Sẵn sàng để nâng tầm hoạt động tuyển dụng của bạn?</h2>
            <p className="text-white/80 text-lg md:text-xl mb-10 md:mb-12 font-light reveal reveal-up reveal-delay-200">Trải nghiệm HR Lite ngay hôm nay — trở thành người đầu tiên khám phá Dashboard.</p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 reveal reveal-up reveal-delay-300">
              <button
                onClick={handleCTA}
                className="bg-white text-primary px-10 py-5 rounded-xl font-headline font-extrabold text-lg hover:bg-surface-container-low transition-colors w-full md:w-auto shadow-2xl active:scale-95"
              >
                Bắt đầu ngay
              </button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-32 max-w-3xl mx-auto px-8" id="faq">
          <h2 className="font-headline font-extrabold text-3xl mb-16 text-center text-on-surface">Các câu hỏi thường gặp</h2>
          <div className="space-y-4">
            <FaqItem
              id={0}
              question="HR Lite khác gì so với một hệ thống ATS truyền thống?"
              answer="Các hệ thống ATS truyền thống được xây dựng cho các tập đoàn lớn với hàng ngàn ứng viên. HR Lite được xây dựng cho cá nhân—nhấn mạnh vào tốc độ, sự rõ ràng mang tính biên tập và sự dễ dùng, thay vì các tính năng cồng kềnh của doanh nghiệp."
              openFaq={openFaq}
              toggleFaq={toggleFaq}
            />
            <FaqItem
              id={1}
              question="Dữ liệu của tôi có được bảo mật không?"
              answer="Có. Chúng tôi sử dụng mã hóa tiêu chuẩn ngành và tuân thủ các quy định GDPR nghiêm ngặt để đảm bảo dữ liệu cá nhân của ứng viên luôn được bảo vệ."
              openFaq={openFaq}
              toggleFaq={toggleFaq}
            />
            <FaqItem
              id={2}
              question="Tôi có thể nhập bảng tính hiện có của mình không?"
              answer="Chắc chắn rồi. Chúng tôi cung cấp công cụ nhập thông minh giúp khớp các cột Excel hoặc CSV của bạn với các trường dữ liệu có cấu trúc của chúng tôi chỉ trong vài giây."
              openFaq={openFaq}
              toggleFaq={toggleFaq}
            />
            <FaqItem
              id={3}
              question="Có gói dành cho đội nhóm không?"
              answer="Gói dành cho đội nhóm hiện đang được phát triển. Trong thời gian tới, bạn sẽ có thể mời thành viên, chia sẻ quy trình tuyển dụng và cộng tác ghi chú dễ dàng trong cùng một workspace."
              openFaq={openFaq}
              toggleFaq={toggleFaq}
            />
            <FaqItem
              id={4}
              question="Triết lý Dashboard là gì?"
              answer="Chúng tôi tin rằng tuyển dụng là một công việc mang tính thủ công và cần sự tinh tế. Vì vậy, công cụ bạn dùng cũng nên được thiết kế kỹ lưỡng — để xứng đáng với những tài năng mà bạn đang tìm kiếm."
              openFaq={openFaq}
              toggleFaq={toggleFaq}
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#F4F3F1] dark:bg-[#1A1C1A] w-full py-12 px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto">
          <div className="space-y-4 text-center md:text-left">
            <span className="text-xl font-bold text-[#1F1F1F] dark:text-[#FAF9F6] font-headline">HR Lite</span>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#1F1F1F]/50 dark:text-[#FAF9F6]/50">© 2024 HR Lite. Tuyển dụng, đơn giản hơn.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a className="text-[10px] uppercase tracking-widest text-[#1F1F1F]/50 dark:text-[#FAF9F6]/50 hover:text-primary underline underline-offset-4 transition-all duration-300" href="#">Chính sách bảo mật</a>
            <a className="text-[10px] uppercase tracking-widest text-[#1F1F1F]/50 dark:text-[#FAF9F6]/50 hover:text-primary underline underline-offset-4 transition-all duration-300" href="#">Điều khoản dịch vụ</a>
            <a className="text-[10px] uppercase tracking-widest text-[#1F1F1F]/50 dark:text-[#FAF9F6]/50 hover:text-primary underline underline-offset-4 transition-all duration-300" href="#">Chính sách Cookie</a>
            <a className="text-[10px] uppercase tracking-widest text-[#1F1F1F]/50 dark:text-[#FAF9F6]/50 hover:text-primary underline underline-offset-4 transition-all duration-300" href="#">Liên hệ hỗ trợ</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FaqItem = ({ id, question, answer, openFaq, toggleFaq }) => {
  const isOpen = openFaq === id;
  return (
    <div className="group bg-white rounded-lg border border-surface-container-low shadow-sm">
      <button
        onClick={() => toggleFaq(id)}
        className="flex justify-between items-center w-full p-6 cursor-pointer list-none focus:outline-none"
      >
        <span className="font-headline font-bold text-lg text-on-surface text-left leading-tight">{question}</span>
        <span className={`material-symbols-outlined transform transition-transform duration-300 font-bold ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
      </button>
      <div className={`px-6 overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'pb-6 max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="text-on-surface-variant text-sm leading-relaxed font-light">{answer}</p>
      </div>
    </div>
  );
};

export default LandingPage;
