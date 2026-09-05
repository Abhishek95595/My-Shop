'use client';

import React from 'react';
import Link from 'next/link';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ reset }: GlobalErrorProps) {

  return (
    <html lang="en">
      <head>
        <title>Khushi Ornament House | Temporary Service Issue</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              body {
                margin: 0;
                padding: 0;
                background-color: #FAF8F5;
                color: #261B17;
                font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
              }
              *, *::before, *::after {
                box-sizing: border-box;
              }
              .global-error-card {
                background-color: #FCFAF7;
                border: 1px solid #DCD0B5;
                border-radius: 24px;
                padding: 32px 24px;
                max-width: 440px;
                width: 90%;
                margin: 20px auto;
                text-align: center;
                box-shadow: 0 8px 24px rgba(38, 27, 23, 0.08);
              }
              .global-error-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                background-color: #F3EBD3;
                border: 1px solid #E8DFC8;
                color: #4A0E1C;
                font-size: 11px;
                font-weight: 700;
                padding: 4px 12px;
                border-radius: 9999px;
                margin-bottom: 16px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
              }
              .global-error-title {
                font-family: 'Playfair Display', Georgia, serif;
                font-size: 24px;
                font-weight: 700;
                color: #24040C;
                margin: 0 0 12px;
                line-height: 1.3;
              }
              .global-error-desc {
                font-size: 14px;
                color: #453E3A;
                line-height: 1.6;
                margin: 0 0 24px;
              }
              .global-error-actions {
                display: flex;
                flex-direction: column;
                gap: 12px;
              }
              @media (min-width: 480px) {
                .global-error-actions {
                  flex-direction: row;
                  justify-content: center;
                }
              }
              .btn-global-retry {
                background-color: #4A0E1C;
                color: #FAF8F5;
                border: none;
                padding: 12px 22px;
                border-radius: 12px;
                font-size: 13px;
                font-weight: 700;
                cursor: pointer;
                transition: background-color 0.2s ease;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                text-decoration: none;
              }
              .btn-global-retry:hover {
                background-color: #380914;
              }
              .btn-global-home {
                background-color: #FAF8F5;
                color: #380914;
                border: 1px solid #DCD0B5;
                padding: 12px 22px;
                border-radius: 12px;
                font-size: 13px;
                font-weight: 600;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                transition: background-color 0.2s ease;
              }
              .btn-global-home:hover {
                background-color: #F3EBD3;
              }
            `,
          }}
        />
      </head>
      <body>
        <div className="global-error-card">
          <div className="global-error-badge">
            <span>Notice</span>
          </div>
          <h1 className="global-error-title">
            Khushi Ornament House Couldn&apos;t Load
          </h1>
          <p className="global-error-desc">
            An unexpected problem prevented the site from loading correctly.
          </p>
          <div className="global-error-actions">
            <button
              type="button"
              onClick={() => reset()}
              className="btn-global-retry"
            >
              Try Again
            </button>
            <Link href="/" className="btn-global-home">
              Return Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
