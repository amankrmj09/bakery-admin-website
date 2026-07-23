import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginAdmin, clearError } from '../store/slices/authSlice';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Store, KeyRound, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Login() {
  const [credentials, setCredentials] = useState({ usernameOrEmail: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(loginAdmin(credentials));
    if (loginAdmin.fulfilled.match(resultAction)) {
      toast.success('Successfully logged in');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden px-4">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[60%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-500/20 blur-[120px]" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="shadow-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-indigo-500" />
          <CardHeader className="space-y-2 text-center pb-8 pt-8">
            <div className="flex justify-center mb-4">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="h-16 w-16 bg-primary/20 rounded-2xl flex items-center justify-center ring-1 ring-primary/30 shadow-[0_0_30px_rgba(var(--color-primary),0.15)] backdrop-blur-md"
              >
                <Store className="h-8 w-8 text-primary-light" />
              </motion.div>
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-white font-outfit">Admin Portal</CardTitle>
            <CardDescription className="text-zinc-400 text-sm font-medium">
              Secure access to bakery management
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-primary rounded-xl" 
                placeholder="admin@bakery.com"
                name="usernameOrEmail"
                value={credentials.usernameOrEmail}
                onChange={handleChange}
                required
              />
              <Input 
                label="Password"
                type="password"
                icon={KeyRound}
                className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-primary rounded-xl" 
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
    </div>
  );
}
