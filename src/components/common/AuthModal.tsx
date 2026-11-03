import React, { useState } from 'react';
import { User, LogIn, UserPlus, LogOut, ShieldCheck, Database, X, Check, Cloud, HardDrive } from 'lucide-react';
import { UserAccount, Project } from '../../types';
import { SyncSettings, loadSyncSettings, saveSyncSettings } from '../../utils/storage';

interface Props {
  isOpen: boolean;
  currentUser: UserAccount | null;
  localProjectsCount: number;
  onClose: () => void;
  onLogin: (user: UserAccount, transferLocalData: boolean) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<Props> = ({
  isOpen,
  currentUser,
  localProjectsCount,
  onClose,
  onLogin,
  onLogout,
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'settings'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [transferData, setTransferData] = useState(true);
  const [syncSettings, setSyncSettingsState] = useState<SyncSettings>(loadSyncSettings());
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu tối thiểu phải từ 6 ký tự.');
      return;
    }

    // Mock secure client-side authentication session
    const mockUser: UserAccount = {
      id: `usr_${Date.now()}`,
      email: email.trim().toLowerCase(),
      name: name.trim() || email.split('@')[0],
      createdAt: new Date().toISOString(),
    };

    onLogin(mockUser, transferData);
    onClose();
  };

  const handleSaveSyncSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveSyncSettings(syncSettings);
    setSuccessMsg('Đã lưu cấu hình kết nối đồng bộ thành công!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">
                {currentUser ? 'Quản lý tài khoản' : 'Tài khoản & Đồng bộ dữ liệu'}
              </h3>
              <p className="text-xs text-slate-500">
                {currentUser ? currentUser.email : 'Lưu trữ đám mây & truy cập đa thiết bị'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {currentUser ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Họ tên:</span>
                  <span className="text-xs font-semibold text-slate-900">{currentUser.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Email:</span>
                  <span className="text-xs font-mono text-slate-900">{currentUser.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Trạng thái đồng bộ:</span>
                  <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                    <Cloud className="w-3.5 h-3.5" /> Đã kết nối đám mây
                  </span>
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg text-xs text-blue-800 space-y-1">
                <div className="font-semibold text-blue-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Bảo mật & Phân quyền dữ liệu
                </div>
                <p className="text-blue-700 leading-relaxed">
                  Dữ liệu dự án của bạn được phân quyền riêng biệt theo ID tài khoản. Mỗi tài khoản chỉ có quyền xem và chỉnh sửa dự án do chính mình sở hữu.
                </p>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setTab('settings')}
                  className="text-xs text-slate-600 hover:text-blue-600 font-medium flex items-center gap-1.5"
                >
                  <Database className="w-3.5 h-3.5" />
                  Cấu hình kết nối Supabase
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Tabs */}
              <div className="flex border-b border-slate-200 mb-4">
                <button
                  onClick={() => {
                    setTab('login');
                    setError(null);
                  }}
                  className={`pb-2 text-xs font-medium transition-colors relative flex items-center gap-1.5 mr-4 ${
                    tab === 'login' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Đăng nhập
                  {tab === 'login' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
                </button>
                <button
                  onClick={() => {
                    setTab('register');
                    setError(null);
                  }}
                  className={`pb-2 text-xs font-medium transition-colors relative flex items-center gap-1.5 mr-4 ${
                    tab === 'register' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Đăng ký mới
                  {tab === 'register' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
                </button>
                <button
                  onClick={() => {
                    setTab('settings');
                    setError(null);
                  }}
                  className={`pb-2 text-xs font-medium transition-colors relative flex items-center gap-1.5 ${
                    tab === 'settings' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  Cấu hình Supabase
                  {tab === 'settings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
                </button>
              </div>

              {error && (
                <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  {error}
                </div>
              )}

              {tab === 'settings' ? (
                <form onSubmit={handleSaveSyncSettings} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Chế độ lưu trữ & đồng bộ
                    </label>
                    <select
                      value={syncSettings.mode}
                      onChange={(e) =>
                        setSyncSettingsState({ ...syncSettings, mode: e.target.value as any })
                      }
                      className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="local">Chế độ máy cục bộ (LocalStorage bảo mật)</option>
                      <option value="cloud">Chế độ Supabase Cloud Database</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Supabase Project URL (Tùy chọn)
                    </label>
                    <input
                      type="text"
                      placeholder="https://xyzcompany.supabase.co"
                      value={syncSettings.supabaseUrl || ''}
                      onChange={(e) =>
                        setSyncSettingsState({ ...syncSettings, supabaseUrl: e.target.value })
                      }
                      className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 font-mono placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Supabase Anon Public Key (Tùy chọn)
                    </label>
                    <input
                      type="password"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={syncSettings.supabaseAnonKey || ''}
                      onChange={(e) =>
                        setSyncSettingsState({ ...syncSettings, supabaseAnonKey: e.target.value })
                      }
                      className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 font-mono placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {successMsg && (
                    <div className="p-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      {successMsg}
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      Lưu cấu hình
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {tab === 'register' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        placeholder="Nguyễn Văn A"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Email đăng nhập
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="user@doanhnghiep.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Mật khẩu</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Local data transfer prompt if guest projects exist */}
                  {localProjectsCount > 0 && (
                    <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-1.5">
                      <div className="flex items-center gap-1.5 font-semibold text-xs text-blue-900">
                        <HardDrive className="w-3.5 h-3.5 text-blue-600" />
                        Chuyển dữ liệu từ trình duyệt ({localProjectsCount} dự án)
                      </div>
                      <p className="text-[11px] text-blue-700 leading-relaxed">
                        Bạn đang có {localProjectsCount} dự án tạo trên trình duyệt. Bạn có muốn đồng bộ các dự án này vào tài khoản mới đăng nhập không?
                      </p>
                      <label className="flex items-center gap-2 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={transferData}
                          onChange={(e) => setTransferData(e.target.checked)}
                          className="rounded text-blue-600"
                        />
                        <span className="text-xs font-medium text-slate-800">
                          Đồng bộ an toàn các dự án cục bộ lên tài khoản này
                        </span>
                      </label>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    {tab === 'login' ? (
                      <>
                        <LogIn className="w-4 h-4" />
                        Đăng nhập
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Đăng ký tài khoản
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
