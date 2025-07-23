import { useState } from 'react';

export default function InterativoPage() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ textAlign: 'center', marginTop: 40 }}>
      <h1>Página Interativa</h1>
      <p>Você clicou {count} vezes</p>
      <button onClick={() => setCount(count + 1)}>Clique aqui</button>
    </div>
  );
} 