import React from 'react';
import { Navigate, Outlet, RouteObject, useRoutes } from 'react-router-dom';
import MainLayout from '@/layout/MainLayout';
import NotFound from '@/app/not-found';

type PageModule = { default?: React.ComponentType<any> };

function filePathToRoutePath(file: string) {
  // file like: ./app/panel/invoice/detail/[date]/page.tsx
  let p = file
    .replace(/^\.\/app\//, '/')
    .replace(/\/page\.tsx$/, '')
    .replace(/\/page\.ts$/, '');

  if (p === '/page' || p === '/') return '/';
  if (p.endsWith('/')) p = p.slice(0, -1);
  if (p === '') return '/';

  // Next-style dynamic segment: [id] => :id
  p = p.replace(/\[\.\.\.(.+?)\]/g, ':$1');
  p = p.replace(/\[(.+?)\]/g, ':$1');
  return p;
}

function PanelShell() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

export default function App() {
  const modules = import.meta.glob('./app/**/page.tsx', { eager: true }) as Record<string, PageModule>;

  const panelChildren: RouteObject[] = [];
  const rootRoutes: RouteObject[] = [];
  let panelIndexElement: React.ReactNode | null = null;

  for (const [file, mod] of Object.entries(modules)) {
    const Component = mod.default;
    if (!Component) continue;

    const fullPath = filePathToRoutePath(file);
    if (fullPath === '/panel') continue;

    if (fullPath.startsWith('/panel/')) {
      if (fullPath === '/panel/dashboard') {
        panelIndexElement = <Component />;
      }
      panelChildren.push({
        path: fullPath.replace(/^\/panel\//, ''),
        element: <Component />,
      });
    } else {
      rootRoutes.push({
        path: fullPath,
        element: <Component />,
      });
    }
  }

  const routes: RouteObject[] = [
    ...rootRoutes,
    {
      path: '/panel',
      element: <PanelShell />,
      children: [{ index: true, element: panelIndexElement ?? <Navigate to="dashboard" replace /> }, ...panelChildren],
    },
    { path: '*', element: <NotFound /> },
  ];

  return useRoutes(routes);
}
