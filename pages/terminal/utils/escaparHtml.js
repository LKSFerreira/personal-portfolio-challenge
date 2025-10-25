/**
 * Escapa caracteres HTML perigosos para prevenir XSS
 * @param {string} texto - Texto a ser escapado
 * @returns {string} Texto com caracteres HTML escapados
 */
export function escaparHtml(texto) {
  const mapa = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return texto.replace(/[&<>"']/g, (char) => mapa[char]);
}
