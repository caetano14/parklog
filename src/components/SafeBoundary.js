import { Component } from 'react';

// Apanha erros de renderização de um componente (por exemplo, um módulo nativo em falta
// na build) e mostra `fallback`, em vez de deixar o erro rebentar com o ecrã inteiro.
export default class SafeBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.warn('Componente falhou:', error?.message ?? error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
