import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof global === 'undefined') {
                var global = globalThis;
              }
              if (typeof process === 'undefined') {
                var process = { env: {} };
              }
              if (typeof __dirname === 'undefined') {
                var __dirname = '/';
              }
              if (typeof __filename === 'undefined') {
                var __filename = '/index.js';
              }
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 