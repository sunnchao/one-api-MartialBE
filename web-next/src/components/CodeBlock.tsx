import React from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'text' }) => {
  return (
    <pre
      style={{
        backgroundColor: '#f5f5f5',
        padding: '12px',
        borderRadius: '4px',
        overflowX: 'auto',
        fontFamily: 'monospace',
        fontSize: '12px',
        margin: 0
      }}
    >
      <code>{code}</code>
    </pre>
  );
};

export default CodeBlock;
