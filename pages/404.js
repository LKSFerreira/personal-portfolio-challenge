// pages/404.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function PaginaNaoEncontrada() {
  const roteador = useRouter();

  useEffect(() => {
    // Redireciona automaticamente para /terminal após 2 segundos
    const temporizador = setTimeout(() => {
      roteador.push('/404');
    }, 2000);

    // Cleanup do temporizador
    return () => clearTimeout(temporizador);
  }, [roteador]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: '"Fira Code", monospace',
      color: '#00ff00',
      backgroundColor: '#1a1a1a',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '4em', margin: '0' }}>404</h1>
      <h2 style={{ fontSize: '1.5em', marginBottom: '20px' }}>Página não encontrada</h2>
      <p style={{ fontSize: '1em', marginBottom: '30px' }}>
        Redirecionando para o terminal em 2 segundos...
      </p>
      <a 
        href="/" 
        style={{ 
          color: '#00ff00', 
          textDecoration: 'underline',
          fontSize: '1.1em'
        }}
      >
        Clique aqui se não redirecionar automaticamente
      </a>
    </div>
  );
}
