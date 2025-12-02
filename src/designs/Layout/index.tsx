import type { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-hidden">
      {children}
    </div>
  );
}

type LayoutHeaderProps = {
  children: ReactNode;
};

export function LayoutHeader({ children }: LayoutHeaderProps) {
  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      {children}
    </header>
  );
}

type LayoutBodyProps = {
  children: ReactNode;
};

export function LayoutBody({ children }: LayoutBodyProps) {
  return <div className="flex h-[calc(100vh-73px)]">{children}</div>;
}

type LayoutMainProps = {
  children: ReactNode;
};

export function LayoutMain({ children }: LayoutMainProps) {
  return <main className="flex-1">{children}</main>;
}
