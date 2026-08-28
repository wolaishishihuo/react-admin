import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { IframePage } from '@/components/IframePage';

describe('IframePage', () => {
  it('没有 url 时不渲染', () => {
    const { container } = render(<IframePage title='文档' />);
    expect(container.querySelector('iframe')).toBeNull();
  });

  it('没有合法 url 时不渲染', () => {
    const { container } = render(<IframePage title='文档' url='javascript:alert(1)' />);
    expect(container.querySelector('iframe')).toBeNull();
    expect(screen.queryByTitle('文档')).toBeNull();
  });

  it('合法 http(s) 渲染 iframe，并带 sandbox', () => {
    render(<IframePage title='文档' url='https://example.com/docs' />);
    const frame = screen.getByTitle('文档');
    expect(frame.tagName).toBe('IFRAME');
    expect(frame).toHaveAttribute('src', 'https://example.com/docs');
    expect(frame).toHaveAttribute('sandbox', 'allow-forms allow-popups allow-popups-to-escape-sandbox allow-scripts');
  });
});
