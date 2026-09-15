'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardBody,
  Input,
  Checkbox,
  Spinner
} from '@heroui/react';
import { Server, User, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { toast } from '@/store/toast';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const router = useRouter();
  const { setAuth, isAuthenticated, checkSession, loading: sessionLoading } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    // 用服务端 Session 判断是否已登录（刷新后仍保持登录）
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [mounted, isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.warning('请输入用户名');
      return;
    }

    if (!password.trim()) {
      toast.warning('请输入密码');
      return;
    }

    setLoading(true);

    try {
      // 后端校验账号密码，成功后由后端写入 Session（sessionid HttpOnly Cookie）
      const response = await api.login(username, password, rememberMe);

      if (response.success && response.data) {
        setAuth(response.data.user);
        toast.success('登录成功，欢迎回来！');
        router.push('/dashboard');
      } else {
        toast.error(response.message || '登录失败');
      }
    } catch (error) {
      toast.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 会话未确认前显示加载态；已登录时等待重定向，避免闪现登录表单
  if (!mounted || sessionLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* 左侧装饰区域 */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
        {/* 装饰元素 */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Server className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold">OPS Admin</h1>
          </div>
          
          <h2 className="text-4xl font-bold leading-tight mb-6">
            企业级<br />运维管理平台
          </h2>
          
          <p className="text-lg text-white/80 mb-8 max-w-md">
            一站式服务器监控、告警管理、任务调度解决方案，助力企业高效运维
          </p>
          
          <div className="grid grid-cols-3 gap-6 max-w-md">
            <div className="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="text-3xl font-bold">99.9%</div>
              <div className="text-sm text-white/70 mt-1">服务可用</div>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm text-white/70 mt-1">全天监控</div>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="text-3xl font-bold">&lt;1s</div>
              <div className="text-sm text-white/70 mt-1">响应速度</div>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧登录区域 */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full max-w-md">
          {/* 移动端 Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="p-2 gradient-primary rounded-xl">
              <Server className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">OPS Admin</h1>
          </div>

          <Card className="shadow-2xl shadow-primary-500/5 border border-white/60 backdrop-blur-sm bg-white/80">
            <CardBody className="p-8 sm:p-10">
              <div className="text-center mb-8">
                <div className="inline-flex p-3.5 bg-gradient-to-br from-primary-50 to-primary-100/60 rounded-2xl mb-4 shadow-sm shadow-primary-200/40">
                  <Shield className="w-7 h-7 text-primary-500" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">欢迎登录</h2>
                <p className="text-gray-400 mt-2 text-sm">请输入您的账号信息以继续</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <Input
                  type="text"
                  placeholder="请输入用户名"
                  value={username}
                  onValueChange={setUsername}
                  startContent={<User className="text-primary-300 w-4.5 h-4.5 flex-shrink-0" />}
                  variant="flat"
                  size="lg"
                  classNames={{
                    inputWrapper: [
                      'bg-gray-50/80',
                      'border border-gray-100',
                      'hover:bg-primary-50/30 hover:border-primary-200',
                      'focus-within:bg-white focus-within:border-primary-300',
                      'focus-within:shadow-md focus-within:shadow-primary-100/40',
                      'transition-all duration-300 ease-out',
                      'group-data-[focus=true]:bg-white',
                      'group-data-[focus=true]:border-primary-300',
                      'group-data-[focus=true]:shadow-md',
                      'group-data-[focus=true]:shadow-primary-100/40',
                    ].join(' '),
                    input: 'text-gray-700 placeholder:text-gray-300',
                  }}
                />

                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="请输入密码"
                  value={password}
                  onValueChange={setPassword}
                  startContent={<Lock className="text-primary-300 w-4.5 h-4.5 flex-shrink-0" />}
                  endContent={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-300 hover:text-primary-400 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                  variant="flat"
                  size="lg"
                  classNames={{
                    inputWrapper: [
                      'bg-gray-50/80',
                      'border border-gray-100',
                      'hover:bg-primary-50/30 hover:border-primary-200',
                      'focus-within:bg-white focus-within:border-primary-300',
                      'focus-within:shadow-md focus-within:shadow-primary-100/40',
                      'transition-all duration-300 ease-out',
                      'group-data-[focus=true]:bg-white',
                      'group-data-[focus=true]:border-primary-300',
                      'group-data-[focus=true]:shadow-md',
                      'group-data-[focus=true]:shadow-primary-100/40',
                    ].join(' '),
                    input: 'text-gray-700 placeholder:text-gray-300',
                  }}
                />

                <div className="flex items-center justify-between pt-1">
                  <Checkbox
                    size="sm"
                    isSelected={rememberMe}
                    onValueChange={setRememberMe}
                    classNames={{ label: 'text-sm text-gray-500' }}
                  >
                    记住我
                  </Checkbox>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-primary-500 to-primary-400 hover:from-primary-600 hover:to-primary-500 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 active:scale-[0.98]"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>登录中...</span>
                      </>
                    ) : '登 录'}
                  </button>
                </div>
              </form>
            </CardBody>
          </Card>

          <p className="text-center text-sm text-gray-400 mt-6">
            © 2024 OPS Admin. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
