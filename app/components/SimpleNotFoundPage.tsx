import { useNavigate } from "react-router";

/**
 * Simple 404 Not Found Page - Works without Polaris AppProvider
 * Used for routes outside /app/* that don't have Polaris context
 */
export function SimpleNotFoundPage() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        .not-found-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f6f6f7;
          color: #202223;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 2rem;
        }
        .not-found-content {
          max-width: 600px;
          width: 100%;
          text-align: center;
        }
        .error-number {
          font-size: 120px;
          font-weight: 700;
          line-height: 1;
          color: #008060;
          opacity: 0.1;
          margin-bottom: 1rem;
        }
        .not-found-container h1 {
          font-size: 32px;
          font-weight: 700;
          color: #202223;
          margin-bottom: 0.5rem;
        }
        .subtitle {
          font-size: 16px;
          color: #6b7280;
          margin-bottom: 2rem;
        }
        .info-box {
          max-width: 500px;
          margin: 0 auto 2rem;
          padding: 1.5rem;
          background-color: white;
          border-radius: 8px;
          border: 1px solid #e1e3e5;
        }
        .info-box p {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }
        .button-group {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }
        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-block;
        }
        .btn-primary {
          background-color: #008060;
          color: white;
        }
        .btn-primary:hover {
          background-color: #006e52;
        }
        .btn-secondary {
          background-color: white;
          color: #202223;
          border: 1px solid #e1e3e5;
        }
        .btn-secondary:hover {
          background-color: #f6f6f7;
        }
        .quick-links {
          margin-top: 2rem;
        }
        .quick-links-label {
          font-size: 12px;
          color: #9ca3af;
          margin-bottom: 0.5rem;
        }
        .quick-links-list {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .quick-link {
          color: #008060;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
        }
        .quick-link:hover {
          text-decoration: underline;
        }
      `}</style>
      <div className="not-found-container">
        <div className="not-found-content">
          {/* 404 Number */}
          <div className="error-number">404</div>

          {/* Main Message */}
          <h1>Page Not Found</h1>
          <p className="subtitle">
            The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Helpful Message */}
          <div className="info-box">
            <p>
              You may have typed the address incorrectly, or the page may have been removed.
              Try going back to the home page or use the navigation menu.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="button-group">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/app")}
            >
              Go to Home
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.history.back();
                }
              }}
            >
              Go Back
            </button>
          </div>

          {/* Quick Links */}
          <div className="quick-links">
            <p className="quick-links-label">Quick links:</p>
            <div className="quick-links-list">
              <a href="/app/dashboard" className="quick-link">Dashboard</a>
              <a href="/app/filter-audience" className="quick-link">Filter Audience</a>
              <a href="/app/my-saved-lists" className="quick-link">My Saved Lists</a>
              <a href="/app/settings" className="quick-link">Settings</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
