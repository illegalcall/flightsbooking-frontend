import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Mock<T = unknown> {
      mockResolvedValue: (value: T) => this;
      mockRejectedValue: (value: Error) => this;
    }
  }
}

// Augment expect object with jest-dom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveTextContent(text: string | RegExp): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeVisible(): R;
      toBeChecked(): R;
    }
  }
} 