import { Component, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Grill from './Grill';

interface Props { children: ReactNode }
interface State { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('[Asadete] Unhandled error:', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-[#fcf8f7] flex flex-col items-center justify-center font-body text-[#1f1a17] p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-white border border-[#e8ded8] shadow-md flex items-center justify-center mb-6">
          <Grill className="text-[#b83a0a]" size={36} />
        </div>
        <h1 className="text-2xl font-heading font-extrabold mb-2">Se quemó el asado</h1>
        <p className="text-[#7a706b] text-sm mb-8">Algo salió mal. Volvé al inicio e intentá de nuevo.</p>
        <Link
          to="/"
          onClick={() => this.setState({ hasError: false })}
          className="py-4 px-8 bg-[#b83a0a] text-white rounded-[1.25rem] font-heading font-bold text-sm shadow-[0_8px_30px_rgba(184,58,10,0.3)] hover:bg-[#8a2905] transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }
}
