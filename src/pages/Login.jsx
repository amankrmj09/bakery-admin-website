import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginAdmin, verifyAdminLogin, resendLoginOtp, clearError, clearOtpState } from '../store/slices/authSlice';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Store, KeyRound, User, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function Login() {
  const [credentials, setCredentials] = useState({ usernameOrEmail: '', password: '' });
  const [step, setStep] = useState('LOGIN');
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isOtpPending } = useSelector((state) => state.auth);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    if (error) dispatch(clearError());
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
    if (error) dispatch(clearError());
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(loginAdmin(credentials));
    if (loginAdmin.fulfilled.match(resultAction)) {
      if (resultAction.payload.requiresOtp) {
        toast.success('Please check your email for the OTP');
        setStep('OTP');
        setCooldown(30);
      } else {
        toast.success('Successfully logged in');
        navigate('/');
      }
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      toast.error('Please enter a valid OTP');
      return;
    }
    const payload = {
      usernameOrEmail: credentials.usernameOrEmail,
      otp
    };
    const resultAction = await dispatch(verifyAdminLogin(payload));
    if (verifyAdminLogin.fulfilled.match(resultAction)) {
      toast.success('Successfully logged in');
      navigate('/');
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      await dispatch(resendLoginOtp(credentials.usernameOrEmail)).unwrap();
      toast.success('A new OTP has been sent to your email!');
      setCooldown(30);
    } catch (err) {
      toast.error(err || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const handleCancelOtp = () => {
    dispatch(clearOtpState());
    setStep('LOGIN');
    setOtp('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      {/* Dynamic Background Elements can be removed or kept minimal, but App.jsx already has AuraBackground */}

      <AnimatePresence mode="wait">
        {step === 'LOGIN' ? (
          <motion.div 
            key="login-step"
            initial={{ opacity: 0, x: -30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-md relative z-10"
          >
            <Card className="shadow-2xl border border-[var(--border-color)] bg-[var(--bg-panel)]/80 backdrop-blur-xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-indigo-500" />
              <CardHeader className="space-y-2 text-center pb-8 pt-8">
                <div className="flex justify-center mb-4">
                  <motion.div 
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center ring-1 ring-primary/30 shadow-[0_0_30px_rgba(var(--color-primary),0.15)] backdrop-blur-md"
                  >
                    <Store className="h-8 w-8 text-[var(--color-primary)]" />
                  </motion.div>
                </div>
                <CardTitle className="text-3xl font-bold tracking-tight text-[var(--text-main)] font-outfit">Admin Portal</CardTitle>
                <CardDescription className="text-[var(--text-muted)] text-sm font-medium">
                  Secure access to bakery management
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm font-medium flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                      {error}
                    </motion.div>
                  )}
                  <Input 
                    label="Username or Email"
                    icon={User}
                    className="bg-[var(--bg-panel-hover)] border-[var(--border-color)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-primary rounded-xl" 
                    placeholder="Enter username or email"
                    name="usernameOrEmail"
                    value={credentials.usernameOrEmail}
                    onChange={handleChange}
                    required
                  />
                  <Input 
                    label="Password"
                    type="password"
                    icon={KeyRound}
                    className="bg-[var(--bg-panel-hover)] border-[var(--border-color)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-primary rounded-xl" 
                    placeholder="••••••••"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                  />
                  <Button 
                    type="submit" 
                    className="w-full h-12 rounded-xl bg-primary hover:bg-[var(--color-primary-hover)] text-white font-semibold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]" 
                    isLoading={loading}
                  >
                    Sign In
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div 
            key="otp-step"
            initial={{ opacity: 0, x: 30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-md relative z-10"
          >
            <Card className="shadow-2xl border border-[var(--border-color)] bg-[var(--bg-panel)]/80 backdrop-blur-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-indigo-500" />
              
              <button 
                onClick={handleCancelOtp} 
                className="absolute top-6 left-6 p-2 rounded-full hover:bg-[var(--bg-panel-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                type="button"
                aria-label="Go Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <CardHeader className="space-y-2 text-center pb-8 pt-10">
                <div className="flex justify-center mb-4">
                  <motion.div 
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center ring-1 ring-primary/30 shadow-[0_0_30px_rgba(var(--color-primary),0.15)] backdrop-blur-md"
                  >
                    <KeyRound className="h-8 w-8 text-[var(--color-primary)]" />
                  </motion.div>
                </div>
                <CardTitle className="text-3xl font-bold tracking-tight text-[var(--text-main)] font-outfit">Verify Login</CardTitle>
                <CardDescription className="text-[var(--text-muted)] text-sm font-medium">
                  We've sent a one-time password to <br />
                  <span className="font-bold text-[var(--text-main)]">{credentials.usernameOrEmail}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm font-medium flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                      {error}
                    </motion.div>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-[var(--text-muted)] uppercase text-center block mb-4">Enter OTP Code</label>
                    <input
                      name="otp"
                      type="text"
                      required
                      value={otp}
                      onChange={handleOtpChange}
                      className="w-full h-14 text-center text-2xl tracking-[0.5em] rounded-xl bg-[var(--bg-panel-hover)] border border-[var(--border-color)] hover:border-primary/50 focus:border-primary text-[var(--text-main)] focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                      placeholder="------"
                      maxLength={6}
                      autoComplete="one-time-code"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 mt-6 rounded-xl bg-primary hover:bg-[var(--color-primary-hover)] text-white font-semibold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]" 
                    isLoading={loading}
                    disabled={loading}
                  >
                    Verify & Continue
                  </Button>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-[var(--text-muted)]">
                      Didn't receive the code?{' '}
                      <button
                        type="button"
                        disabled={cooldown > 0 || resending}
                        onClick={handleResendOtp}
                        className="font-bold text-primary hover:text-[var(--color-primary-hover)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed transition-colors"
                      >
                        {resending ? 'Resending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                      </button>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
