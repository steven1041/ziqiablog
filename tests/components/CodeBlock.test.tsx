import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CodeBlock } from '@/content/CodeBlock';

describe('CodeBlock', () => {
  it('renders highlighted code with copy button', async () => {
    render(await CodeBlock({ code: 'const x = 1;', lang: 'ts' }));
    await waitFor(() => expect(screen.getByLabelText('Copy code')).toBeInTheDocument());
    expect(document.querySelector('pre')).toBeTruthy();
  });
});
