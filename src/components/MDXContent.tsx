import { MDXRemote } from 'next-mdx-remote/rsc';
import { CodeBlock } from '@/content/CodeBlock';

const components = {
  pre: (props: any) => <CodeBlock code={props.children?.props?.children ?? ''} lang={props.children?.props?.className?.replace('language-','')} />,
  code: (props: any) => <code className="rounded bg-surface-variant px-1.5 py-0.5 text-[0.9em]" {...props} />,
};

export function MDXContent({ source }: { source: string }) {
  return <MDXRemote source={source} components={components} />;
}
