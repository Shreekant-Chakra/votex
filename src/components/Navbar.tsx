import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { Button } from './ui/button';
import { Vote, User, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export default function Navbar() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Vote className="w-6 h-6" />
          <span>Votex</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {user.role === 'admin' && (
                <Button render={<Link to="/admin" />} nativeButton={false} variant="ghost" className="gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </Button>
              )}
              <Button render={<Link to="/" />} nativeButton={false} variant="ghost" className="gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Button>
              <Link to="/profile">
                <Avatar className="w-8 h-8 cursor-pointer border hover:opacity-80 transition-opacity">
                  <AvatarImage src={user.profileImage} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
              <Button variant="outline" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button render={<Link to="/login" />} nativeButton={false} variant="ghost">Login</Button>
              <Button render={<Link to="/register" />} nativeButton={false}>Register</Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
