import { useState, useEffect, type ReactNode } from 'react';
import { type ViewportInfo } from '../hooks/useViewport';

interface ResponsiveLayoutProps {
  children?: ReactNode;
  sidebarContent: ReactNode;
  mainContent: ReactNode;
  headerContent?: ReactNode;
}

/**
 * Responsive layout component that adapts to different screen sizes
 * Provides mobile-first design with touch-friendly interfaces
 */
export function ResponsiveLayout({ 
  sidebarContent, 
  mainContent, 
  headerContent 
}: ResponsiveLayoutProps) {
  const [viewport, setViewport] = useState<ViewportInfo>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
    isMobile: false,
    isTablet: false,
    isDesktop: true
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Update viewport info on resize
  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setViewport({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  // Close sidebar when switching to desktop
  useEffect(() => {
    if (viewport.isDesktop) {
      setSidebarOpen(false);
    }
  }, [viewport.isDesktop]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Mobile layout
  if (viewport.isMobile) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Mobile header */}
        <div style={{
          padding: '10px 15px',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '60px',
          backgroundColor: '#f5f5f5'
        }}>
          <button
            onClick={toggleSidebar}
            style={{
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              minHeight: '44px', // Touch-friendly size
              minWidth: '44px'
            }}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          {headerContent && (
            <div style={{ flex: 1, marginLeft: '15px' }}>
              {headerContent}
            </div>
          )}
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <>
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 998
              }}
              onClick={toggleSidebar}
            />
            <div style={{
              position: 'fixed',
              top: '60px',
              left: 0,
              width: '280px',
              height: 'calc(100vh - 60px)',
              backgroundColor: 'white',
              zIndex: 999,
              overflowY: 'auto',
              padding: '15px',
              boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)'
            }}>
              {sidebarContent}
            </div>
          </>
        )}

        {/* Mobile main content */}
        <div style={{
          flex: 1,
          padding: '15px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {mainContent}
        </div>
      </div>
    );
  }

  // Tablet layout
  if (viewport.isTablet) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {headerContent && (
          <div style={{
            padding: '15px 20px',
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: '#f5f5f5'
          }}>
            {headerContent}
          </div>
        )}
        
        <div style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden'
        }}>
          {/* Tablet sidebar */}
          <div style={{
            width: '320px',
            borderRight: '1px solid #e0e0e0',
            overflowY: 'auto',
            padding: '20px',
            backgroundColor: '#fafafa'
          }}>
            {sidebarContent}
          </div>

          {/* Tablet main content */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {mainContent}
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout (default)
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      overflow: 'hidden'
    }}>
      {/* Desktop sidebar */}
      <div style={{
        width: '400px',
        borderRight: '1px solid #e0e0e0',
        overflowY: 'auto',
        padding: '20px',
        backgroundColor: '#fafafa'
      }}>
        {sidebarContent}
      </div>

      {/* Desktop main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {headerContent && (
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #e0e0e0'
          }}>
            {headerContent}
          </div>
        )}
        
        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {mainContent}
        </div>
      </div>
    </div>
  );
}


