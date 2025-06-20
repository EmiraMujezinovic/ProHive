import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.png';
import viewProfileIcon from '../assets/icons/viewprofile.png';
import logoutIcon from '../assets/icons/logout.png';
import hamburgerIcon from '../assets/icons/hamburger.png';

// Navigation links for each role
const linksByRole = {
  Client: [
    'Recommended',
    'Services',
    'My Orders',
    'My Projects',
    'Applications',
  ],
  Freelancer: [
    'Recommended',
    'Projects',
    'My Services',
    'Applications',
    'My Orders',
    'Orders',
  ],
};

/**
 * Navbar component styled to match the provided design, using project colors.
 * Shows logo left (logo image + ProHive text), nav links center, profile image right, links by user role.
 * Fetches user profile image from backend, falls back to default if not available.
 */
const Navbar = () => {
  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();
  const navLinks = [
    { name: 'Recommended', to: '/recommended', show: true },
    { name: 'Services', to: '/clientservices', show: role === 'Client' },
    { name: 'My Orders', to: '/clientorders', show: role === 'Client' },
    { name: 'My Projects', to: '/myprojects', show: role === 'Client' },
    { name: 'Applications', to: role === 'Freelancer' ? '/freelancerapplications' : '/applications', show: true },
    { name: 'Projects', to: '/freelancerprojects', show: role === 'Freelancer' },
    { name: 'My Services', to: '/freelancerservices', show: role === 'Freelancer' },
    { name: 'Orders', to: '/freelancerorders', show: role === 'Freelancer' },
  ].filter(link => link.show);
  const [profileImage, setProfileImage] = useState('/defaultprofile.jpg');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!userId) return;
    // Try to fetch the user's profile image path from backend
    console.log(localStorage.getItem("token"))
    fetch(`/api/Users/${userId}/profile-image`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        if (data && data.profileImageUrl) {
          // If the path is relative, prepend backend URL
          const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://localhost:7156';
          const url = data.profileImageUrl.startsWith('/profile-images')
            ? backendUrl + data.profileImageUrl
            : data.profileImageUrl;
          setProfileImage(url);
        } else {
          setProfileImage('/defaultprofile.jpg');
        }
      })
      .catch(() => setProfileImage('/defaultprofile.jpg'));
  }, [userId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleProfileClick = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleViewProfile = () => {
    setDropdownOpen(false);
    navigate('/profile'); // Adjust this route if you have a different profile page
  };

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('#profile-dropdown') && !e.target.closest('#profile-image-btn')) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-primary border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between relative">
          {/* Logo and brand name on the left */}
          <div className="flex items-center md:gap-4 cursor-pointer">
            <Link className="flex items-center gap-2" to={role === 'Client' ? '/clientdashboard' : role === 'Freelancer' ? '/freelancerdashboard' : '/'}
            >
              <img src={logo} alt="ProHive Logo" className="h-13 w-13 object-contain" />
              <div className="text-text text-3xl font-bold tracking-wide select-none" style={{letterSpacing: '0.04em'}}>ProHive</div>
            </Link>
          </div>

          {/* Hamburger for mobile */}
          <button className="md:hidden ml-2 p-2 rounded hover:bg-secondary/20 transition" onClick={() => setMobileMenuOpen((v) => !v)}>
            <img src={hamburgerIcon} alt="Menu" className="w-8 h-8" />
          </button>

          {/* Centered navigation links */}
          <nav aria-label="Global" className={`hidden md:block flex-1`}>
            <ul className="flex items-center gap-12 justify-center">
              {navLinks.map(link => (
                <li key={link.name}>
                  <Link to={link.to}>
                    <span
                      className="text-text border-2 border-primary font-semibold text-lg whitespace-nowrap transition hover:text-background hover:border-b-accent cursor-pointer p-2 rounded-md hover:shadow-2xl hover:shadow-accent"
                    >
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Profile image and dropdown - hidden on mobile */}
          <div className="justify-end items-center relative hidden md:flex">
            <div className="relative">
              <button
                id="profile-image-btn"
                type="button"
                className="overflow-hidden rounded-full border-2 border-secondary shadow-inner cursor-pointer transition hover:shadow-lg hover:border-accent hover:scale-105 w-12 h-12"
                onClick={handleProfileClick}
              >
                <span className="sr-only">Profile</span>
                <img
                  src={profileImage}
                  alt="Profile"
                  className="h-12 w-12 object-cover "
                  onError={e => { e.currentTarget.src = '/defaultprofile.jpg'; }}
                />
              </button>
              {dropdownOpen && (
                <div
                  id="profile-dropdown"
                  className="absolute right-0 top-full mt-2 w-52 bg-white rounded-lg shadow-lg border border-secondary z-50 animate-fadeIn flex flex-col py-2"
                  style={{ minWidth: '12rem', maxWidth: '90vw' }}
                >
                  <button
                    className="flex items-center gap-3 px-4 py-2 hover:bg-secondary/20 text-primary font-semibold transition text-left"
                    onClick={handleViewProfile}
                  >
                    <img src={viewProfileIcon} alt="View profile" className="w-5 h-5" />
                    View profile
                  </button>
                  <button
                    className="flex items-center gap-3 px-4 py-2 hover:bg-secondary/20 text-red-600 font-semibold transition text-left"
                    onClick={handleLogout}
                  >
                    <img src={logoutIcon} alt="Log out" className="w-5 h-5" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-2 bg-white rounded-lg shadow-lg border border-secondary z-50 animate-fadeIn p-4">
            <ul className="flex flex-col gap-4">
              {navLinks.map(link => (
                <li key={link.name}>
                  <Link to={link.to} onClick={() => setMobileMenuOpen(false)}>
                    <span
                      className="text-primary border-2 border-primary font-semibold text-lg whitespace-nowrap transition hover:text-background hover:border-b-accent cursor-pointer p-2 rounded-md hover:shadow-2xl hover:shadow-accent block text-center"
                    >
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
              <li>
                <button
                  className="flex items-center gap-3 px-4 py-2 hover:bg-secondary/20 text-primary font-semibold transition text-left w-full justify-center"
                  onClick={handleViewProfile}
                >
                  <img src={viewProfileIcon} alt="View profile" className="w-5 h-5" />
                  View profile
                </button>
              </li>
              <li>
                <button
                  className="flex items-center gap-3 px-4 py-2 hover:bg-secondary/20 text-red-600 font-semibold transition text-left w-full justify-center"
                  onClick={handleLogout}
                >
                  <img src={logoutIcon} alt="Log out" className="w-5 h-5" />
                  Log out
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
