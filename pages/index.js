// pages/index.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona automaticamente para /terminal
    router.push('/404');
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'monospace',
      color: '#00ff00',
      backgroundColor: '#1a1a1a'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1>Redirecionando para o terminal...</h1>
        <p>Se não redirecionar automaticamente, <a href="/terminal" style={{ color: '#00ff00' }}>clique aqui</a></p>
      </div>
    </div>
  );
}
