import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../../components/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renderiza en modo fullScreen por defecto', () => {
    render(<LoadingSpinner />);

    // Debe mostrar el texto "Cargando..."
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('renderiza en modo fullScreen=true con contenedor de pantalla completa', () => {
    const { container } = render(<LoadingSpinner fullScreen={true} />);

    // El div externo debe tener la clase min-h-screen
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('min-h-screen');
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('renderiza en modo fullScreen=false sin min-h-screen', () => {
    const { container } = render(<LoadingSpinner fullScreen={false} />);

    const wrapper = container.firstChild as HTMLElement;
    // No debe tener la clase min-h-screen
    expect(wrapper).not.toHaveClass('min-h-screen');
    // No debe mostrar el texto
    expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
  });

  it('el spinner tiene la clase animate-spin', () => {
    const { container } = render(<LoadingSpinner />);

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
});
