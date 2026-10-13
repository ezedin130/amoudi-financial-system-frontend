import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AmoudiMark } from '../AmoudiMark';
import { AmoudiLogo } from '../AmoudiLogo';

describe('Branding Components', () => {
  it('renders AmoudiMark on light background with default dimensions', () => {
    render(<AmoudiMark size={40} />);
    const img = screen.getByRole('img', { name: /amoudi brand mark/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src');
    expect(img.getAttribute('src')).toContain('amoudi-logo');
  });

  it('renders AmoudiMark on dark background with badge container', () => {
    render(<AmoudiMark size={34} onDark={true} />);
    const img = screen.getByRole('img', { name: /amoudi brand mark/i });
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('src')).toContain('amoudi-logo');
    expect(img.parentElement).toHaveClass('bg-[#F7F7F7]');
  });

  it('renders AmoudiLogo with title, subtitle, and optional tagline', () => {
    render(<AmoudiLogo size="md" showTagline={true} />);
    expect(screen.getByRole('img', { name: /amoudi brand mark/i })).toBeInTheDocument();
    expect(screen.getByText('AMOUDI')).toBeInTheDocument();
    expect(screen.getByText('Finance Management')).toBeInTheDocument();
    expect(screen.getByText('Travel made for every one!')).toBeInTheDocument();
  });
});
