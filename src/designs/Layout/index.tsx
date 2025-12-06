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
    <header className="absolute top-0 left-0 right-0 z-50 py-4">
      {children}
    </header>
  );
}

type LayoutBodyProps = {
  children: ReactNode;
};

export function LayoutBody({ children }: LayoutBodyProps) {
  return <div className="flex h-screen">{children}</div>;
}

type LayoutMainProps = {
  children: ReactNode;
};

export function LayoutMain({ children }: LayoutMainProps) {
  return <main className="flex-1">{children}</main>;
}
