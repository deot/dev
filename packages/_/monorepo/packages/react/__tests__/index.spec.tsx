import { App } from '@demo/helper-react';
import { render, fireEvent, screen } from '@testing-library/react';

// @vitest-environment jsdom
describe('index.ts', () => {
	it('any', () => {
		expect(typeof App).toBe('function');
		render(<App />);

		fireEvent.click(screen.queryByText('Hello World')!);
	});
});
