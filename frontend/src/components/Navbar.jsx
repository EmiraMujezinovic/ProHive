import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/images/logo.png';

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
  const navLinks = [
    { name: 'Recommended', to: '/recommended', show: true },
    { name: 'Services', to: '/clientservices', show: role === 'Client' },
    { name: 'My Orders', to: '/clientorders', show: role === 'Client' },
    { name: 'My Projects', to: '/myprojects', show: role === 'Client' },
    { name: 'Applications', to: '/applications', show: true },
    { name: 'Projects', to: '/projects', show: role === 'Freelancer' },
    { name: 'My Services', to: '/freelancerservices', show: role === 'Freelancer' },
    { name: 'Orders', to: '/freelancerorders', show: role === 'Freelancer' },
  ].filter(link => link.show);
  const [profileImage, setProfileImage] = useState('/defaultprofile.jpg');

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

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-primary border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and brand name on the left */}
          <div className="flex items-center md:gap-4 cursor-pointer">
            <Link className="flex items-center gap-2" to={role === 'Client' ? '/clientdashboard' : role === 'Freelancer' ? '/freelancerdashboard' : '/'}
            >
              <img src={logo} alt="ProHive Logo" className="h-13 w-13 object-contain" />
              <div className="text-text text-3xl font-bold tracking-wide select-none" style={{letterSpacing: '0.04em'}}>ProHive</div>
            </Link>
          </div>

          {/* Centered navigation links */}
          <nav aria-label="Global" className="hidden md:block flex-1">
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

          {/* Profile image on the right */}
          <div className="flex justify-end items-center">
            <button
              type="button"
              className="overflow-hidden rounded-full border-2 border-secondary shadow-inner cursor-pointer transition hover:shadow-lg hover:border-accent hover:scale-105"
            >
              <span className="sr-only">Profile</span>
              <img
                src={profileImage}
                alt="Profile"
                className="h-12 w-12 object-cover "
                onError={e => { e.currentTarget.src = '/defaultprofile.jpg'; }}
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
