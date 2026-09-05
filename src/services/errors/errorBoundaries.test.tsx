import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ErrorBoundary from '../../app/error';
import GlobalError from '../../app/global-error';

describe('App Router Error Boundaries Suite', () => {
  const SENSITIVE_MESSAGE = 'Firebase permission-denied /Users/example/.env.local SECRET_TEST_VALUE';
  const SENSITIVE_STACK = 'Error: sensitive stack trace at Object.executeSecretOperation (/app/secret.ts:42:15)';
  const SENSITIVE_DIGEST = 'secret-digest-xyz-987';

  function createSensitiveError(): Error & { digest?: string } {
    const err = new Error(SENSITIVE_MESSAGE) as Error & { digest?: string };
    err.stack = SENSITIVE_STACK;
    err.digest = SENSITIVE_DIGEST;
    return err;
  }

  describe('1. src/app/error.tsx (Application Error Boundary)', () => {
    it('1: renders generic customer-safe heading', () => {
      const reset = vi.fn();
      const markup = renderToStaticMarkup(<ErrorBoundary error={createSensitiveError()} reset={reset} />);
      expect(markup).toContain('Something Went Wrong');
    });

    it('2: renders generic recovery description without technical jargon', () => {
      const reset = vi.fn();
      const markup = renderToStaticMarkup(<ErrorBoundary error={createSensitiveError()} reset={reset} />);
      expect(markup).toContain("We couldn&#x27;t load this part of Khushi Ornament House right now");
      expect(markup).toContain('Please try again');
    });

    it('3: provides Try Again action button', () => {
      const reset = vi.fn();
      const markup = renderToStaticMarkup(<ErrorBoundary error={createSensitiveError()} reset={reset} />);
      expect(markup).toContain('Try Again');
      expect(markup).toContain('<button');
    });

    it('4: provides Return to Catalogue navigation escape link', () => {
      const reset = vi.fn();
      const markup = renderToStaticMarkup(<ErrorBoundary error={createSensitiveError()} reset={reset} />);
      expect(markup).toContain('Return to Catalogue');
      expect(markup).toContain('href="/catalogue"');
    });

    it('5: strictly excludes raw error.message from customer markup', () => {
      const reset = vi.fn();
      const markup = renderToStaticMarkup(<ErrorBoundary error={createSensitiveError()} reset={reset} />);
      expect(markup).not.toContain(SENSITIVE_MESSAGE);
      expect(markup).not.toContain('permission-denied');
      expect(markup).not.toContain('SECRET_TEST_VALUE');
    });

    it('6: strictly excludes error.stack from customer markup', () => {
      const reset = vi.fn();
      const markup = renderToStaticMarkup(<ErrorBoundary error={createSensitiveError()} reset={reset} />);
      expect(markup).not.toContain(SENSITIVE_STACK);
      expect(markup).not.toContain('executeSecretOperation');
      expect(markup).not.toContain('/app/secret.ts');
    });

    it('7: strictly excludes error.digest from customer markup', () => {
      const reset = vi.fn();
      const markup = renderToStaticMarkup(<ErrorBoundary error={createSensitiveError()} reset={reset} />);
      expect(markup).not.toContain(SENSITIVE_DIGEST);
    });

    it('8: does not invoke reset callback during initial render', () => {
      const reset = vi.fn();
      renderToStaticMarkup(<ErrorBoundary error={createSensitiveError()} reset={reset} />);
      expect(reset).toHaveBeenCalledTimes(0);
    });

    it('9: wires reset callback to the Try Again button click handler', () => {
      const reset = vi.fn();
      const element = ErrorBoundary({ error: createSensitiveError(), reset });

      // Search element tree for the button with onClick handler
      function findButton(node: any): any {
        if (!node || typeof node !== 'object') return null;
        if (node.type === 'button' && typeof node.props?.onClick === 'function') {
          return node;
        }
        if (Array.isArray(node.props?.children)) {
          for (const child of node.props.children) {
            const found = findButton(child);
            if (found) return found;
          }
        } else if (node.props?.children) {
          return findButton(node.props.children);
        }
        return null;
      }

      const button = findButton(element);
      expect(button).not.toBeNull();
      expect(reset).toHaveBeenCalledTimes(0);

      // Invoke onClick explicitly
      button.props.onClick();
      expect(reset).toHaveBeenCalledTimes(1);
    });

    it('10: rendering does not throw even with an empty or abnormal error object', () => {
      const reset = vi.fn();
      expect(() => {
        renderToStaticMarkup(<ErrorBoundary error={new Error()} reset={reset} />);
      }).not.toThrow();
    });
  });

  describe('2. src/app/global-error.tsx (Root Global Error Boundary)', () => {
    it('11: renders root <html> document tag', () => {
      const reset = vi.fn();
      const markup = renderToStaticMarkup(<GlobalError error={createSensitiveError()} reset={reset} />);
      expect(markup).toContain('<html');
      expect(markup).toContain('lang="en"');
    });

    it('12: renders root <body> document tag', () => {
      const reset = vi.fn();
      const markup = renderToStaticMarkup(<GlobalError error={createSensitiveError()} reset={reset} />);
      expect(markup).toContain('<body');
      expect(markup).toContain('</body>');
      expect(markup).toContain('</html>');
    });

    it('13: renders generic top-level failure heading', () => {
      const reset = vi.fn();
      const markup = renderToStaticMarkup(<GlobalError error={createSensitiveError()} reset={reset} />);
      expect(markup).toContain("Khushi Ornament House Couldn&#x27;t Load");
    });

    it('14: provides Try Again retry action', () => {
      const reset = vi.fn();
      const markup = renderToStaticMarkup(<GlobalError error={createSensitiveError()} reset={reset} />);
      expect(markup).toContain('Try Again');
      expect(markup).toContain('<button');
    });

    it('15: provides Return Home navigation escape to root', () => {
      const reset = vi.fn();
      const markup = renderToStaticMarkup(<GlobalError error={createSensitiveError()} reset={reset} />);
      expect(markup).toContain('Return Home');
      expect(markup).toContain('href="/"');
    });

    it('16: strictly excludes error.message from root markup', () => {
      const reset = vi.fn();
      const markup = renderToStaticMarkup(<GlobalError error={createSensitiveError()} reset={reset} />);
      expect(markup).not.toContain(SENSITIVE_MESSAGE);
      expect(markup).not.toContain('SECRET_TEST_VALUE');
    });

    it('17: strictly excludes error.digest from root markup', () => {
      const reset = vi.fn();
      const markup = renderToStaticMarkup(<GlobalError error={createSensitiveError()} reset={reset} />);
      expect(markup).not.toContain(SENSITIVE_DIGEST);
    });

    it('18: does not invoke reset during initial render', () => {
      const reset = vi.fn();
      renderToStaticMarkup(<GlobalError error={createSensitiveError()} reset={reset} />);
      expect(reset).toHaveBeenCalledTimes(0);
    });

    it('19: wires reset callback to the global Try Again button click handler', () => {
      const reset = vi.fn();
      const element = GlobalError({ error: createSensitiveError(), reset });

      function findButton(node: any): any {
        if (!node || typeof node !== 'object') return null;
        if (node.type === 'button' && typeof node.props?.onClick === 'function') {
          return node;
        }
        if (Array.isArray(node.props?.children)) {
          for (const child of node.props.children) {
            const found = findButton(child);
            if (found) return found;
          }
        } else if (node.props?.children) {
          return findButton(node.props.children);
        }
        return null;
      }

      const button = findButton(element);
      expect(button).not.toBeNull();
      expect(reset).toHaveBeenCalledTimes(0);

      button.props.onClick();
      expect(reset).toHaveBeenCalledTimes(1);
    });

    it('20: includes self-sufficient resilient styling for CSS failure scenarios', () => {
      const reset = vi.fn();
      const markup = renderToStaticMarkup(<GlobalError error={createSensitiveError()} reset={reset} />);
      expect(markup).toContain('<style');
      expect(markup).toContain('#FAF8F5'); // cream-100
      expect(markup).toContain('#4A0E1C'); // maroon-800
    });
  });
});
