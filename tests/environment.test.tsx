import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('jsdom + Testing Library', () => {
  it('renders markup and supports jest-dom matchers', () => {
    render(<p>hooks admin</p>);
    expect(screen.getByText('hooks admin')).toBeInTheDocument();
  });
});
