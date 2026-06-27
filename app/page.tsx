'use client';
import { useState, useEffect } from 'react';
import { categories } from './constants';
import { useTheaterCore } from './useTheaterCore';

export default function TheaterGramCore() {
  const core = useTheaterCore('fa');
  const lang = core.currentLang;
  const isRtl = lang === 'fa';

  // Theme
  const theme = {
    bg: core.isDarkMode ? '#0a0a0a' : '#f5f5f7',
    text: core.isDarkMode ? '#f5f5f7' : '#1a1a1a',
    cardBg: core.isDarkMode ? '#1c1c1e' : '#ffffff',
    cardBgHover: core.isDarkMode ? '#2c2c2e' : '#f0f0f2',
    border: core.isDarkMode ? '#2c2c2e' : '#e5e5e7',
    inputBg: core.isDarkMode ? '#2c2c2e' : '#f2f2f7',
    accent: '#8b5cf6',
    accentHover: '#7c3aed',
    accentLight: core.isDarkMode ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.08)',
    danger: '#ef4444',
    success: '#22c55e',
    shadow: core.isDarkMode ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.06)',
    radius: '16px',
  };

  // ====== Auth Screen (Improved) ======
  if (!core.isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.bg,
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          background: theme.cardBg,
          borderRadius: theme.radius,
          padding: '40px 32px',
          boxShadow: theme.shadow,
          border: `1px solid ${theme.border}`,
          direction: isRtl ? 'rtl' : 'ltr',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎭</div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: theme.text,
              letterSpacing: '-0.5px',
              margin: 0,
            }}>
              تئاترگرام
            </h1>
            <p style={{
              color: theme.text,
              opacity: 0.5,
              fontSize: '14px',
              marginTop: '4px',
            }}>
              {core.authMode === 'login' ? 'به جمع هنرمندان بپیوندید' : 'عضویت در تئاترگرام'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={core.handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {core.authMode === 'register' && (
              <input
                type="text"
                placeholder="نام و نام خانوادگی"
                value={core.authName}
                onChange={(e) => core.setAuthName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: theme.inputBg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '12px',
                  color: theme.text,
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => e.target.style.borderColor = theme.accent}
                onBlur={(e) => e.target.style.borderColor = theme.border}
              />
            )}
            <input
              type="text"
              placeholder="نام کاربری"
              value={core.authUsername}
              onChange={(e) => core.setAuthUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: theme.inputBg,
                border: `1px solid ${theme.border}`,
                borderRadius: '12px',
                color: theme.text,
                fontSize: '15px',
                outline: 'none',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => e.target.style.borderColor = theme.accent}
              onBlur={(e) => e.target.style.borderColor = theme.border}
            />
            <input
              type="password"
              placeholder="رمز عبور"
              value={core.authPassword}
              onChange={(e) => core.setAuthPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: theme.inputBg,
                border: `1px solid ${theme.border}`,
                borderRadius: '12px',
                color: theme.text,
                fontSize: '15px',
                outline: 'none',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => e.target.style.borderColor = theme.accent}
              onBlur={(e) => e.target.style.borderColor = theme.border}
            />
            
            {core.authError && (
              <div style={{
                padding: '10px 14px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '10px',
                color: theme.danger,
                fontSize: '13px',
                textAlign: 'center',
              }}>
                {core.authError}
              </div>
            )}

            <button
              type="submit"
              disabled={core.loading}
              style={{
                width: '100%',
                padding: '14px',
                background: core.loading ? theme.accent + '80' : theme.accent,
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: core.loading ? 'default' : 'pointer',
                transition: 'all 0.2s',
                marginTop: '4px',
              }}
              onMouseEnter={(e) => {
                if (!core.loading) e.currentTarget.style.background = theme.accentHover;
              }}
              onMouseLeave={(e) => {
                if (!core.loading) e.currentTarget.style.background = theme.accent;
              }}
            >
              {core.loading ? '...' : (core.authMode === 'login' ? 'ورود' : 'ثبت‌نام')}
            </button>
          </form>

          {/* Toggle Auth Mode */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              onClick={() => {
                core.setAuthMode(core.authMode === 'login' ? 'register' : 'login');
                core.setAuthError('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: theme.accent,
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                padding: '4px 8px',
              }}
            >
              {core.authMode === 'login' ? 'ایجاد حساب کاربری' : 'ورود به حساب'}
            </button>
          </div>

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            marginTop: '20px',
            fontSize: '12px',
            color: theme.text,
            opacity: 0.3,
          }}>
            ورود به معنای پذیرش قوانین است
          </div>
        </div>
      </div>
    );
  }

  // ====== Main App ======
  return (
    <div style={{
      background: theme.bg,
      color: theme.text,
      minHeight: '100vh',
      paddingBottom: '80px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      direction: isRtl ? 'rtl' : 'ltr',
    }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        background: theme.bg,
        borderBottom: `1px solid ${theme.border}`,
        padding: '14px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
        backdropFilter: 'blur(12px)',
      }}>
        <button
          onClick={() => core.setIsMenuOpen(true)}
          style={{
            background: 'none',
            border: 'none',
            color: theme.text,
            fontSize: '22px',
            cursor: 'pointer',
            padding: '4px 8px',
          }}
        >
          ☰
        </button>
        <h1 style={{
          fontSize: '18px',
          fontWeight: '700',
          margin: 0,
          letterSpacing: '-0.5px',
          background: `linear-gradient(135deg, ${theme.accent}, #a78bfa)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {lang === 'fa' ? 'تئاترگرام' : 'TheaterGram'}
        </h1>
        <div style={{ width: '36px' }} />
      </header>

      {/* Menu Overlay */}
      {core.isMenuOpen && (
        <div
          onClick={() => core.setIsMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 105,
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* Side Menu */}
      <div style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        width: '280px',
        background: theme.cardBg,
        padding: '24px 20px',
        zIndex: 110,
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        right: isRtl ? 0 : 'auto',
        left: !isRtl ? 0 : 'auto',
        transform: isRtl
          ? (core.isMenuOpen ? 'translateX(0)' : 'translateX(100%)')
          : (core.isMenuOpen ? 'translateX(0)' : 'translateX(-100%)'),
        borderLeft: isRtl ? `1px solid ${theme.border}` : 'none',
        borderRight: !isRtl ? `1px solid ${theme.border}` : 'none',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px',
        }}>
          <span style={{ fontSize: '12px', fontWeight: '600', opacity: 0.4, letterSpacing: '1px' }}>
            {lang === 'fa' ? 'منو' : 'MENU'}
          </span>
          <button
            onClick={() => core.setIsMenuOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: theme.text,
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => {
              core.setIsDarkMode(!core.isDarkMode);
              core.setIsMenuOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: theme.inputBg,
              border: 'none',
              borderRadius: '12px',
              color: theme.text,
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              width: '100%',
            }}
          >
            <span>{core.isDarkMode ? '☀️' : '🌙'}</span>
            {core.isDarkMode ? (lang === 'fa' ? 'حالت روشن' : 'Light Mode') : (lang === 'fa' ? 'حالت شب' : 'Dark Mode')}
          </button>

          <button
            onClick={() => {
              core.setCurrentLang(lang === 'fa' ? 'en' : 'fa');
              core.setIsMenuOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: theme.inputBg,
              border: 'none',
              borderRadius: '12px',
              color: theme.text,
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              width: '100%',
            }}
          >
            <span>🌐</span>
            {lang === 'fa' ? 'English' : 'فارسی'}
          </button>

          <div style={{
            marginTop: '8px',
            padding: '16px',
            background: theme.inputBg,
            borderRadius: '12px',
            fontSize: '13px',
            lineHeight: '1.6',
            opacity: 0.8,
          }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: theme.accent }}>
              {lang === 'fa' ? 'ℹ️ درباره برنامه' : 'ℹ️ About'}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>
              {lang === 'fa'
                ? 'پلتفرم تخصصی اشتراک‌گذاری اتودها و تمرین‌های تئاتر'
                : 'Theater etudes & rehearsal sharing platform'}
            </div>
          </div>

          <button
            onClick={core.handleLogout}
            style={{
              width: '100%',
              padding: '12px',
              background: theme.danger,
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginTop: '12px',
            }}
          >
            {lang === 'fa' ? 'خروج' : 'Logout'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '16px' }}>
        {/* ... (بقیه کد با همان منطق قبلی، ولی با استایل‌های بهبود یافته) ... */}
      </div>
    </div>
  );
}