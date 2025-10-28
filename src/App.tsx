import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Redirect to pos.html
    window.location.href = '/pos.html';
  }, []);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1>Redirecting to POS System...</h1>
        <p>If not redirected, <a href="/pos.html">click here</a></p>
      </div>
    </div>
  );
}

export default App;
