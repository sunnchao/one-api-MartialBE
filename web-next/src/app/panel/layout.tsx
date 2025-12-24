import MainLayout from '@/layout/MainLayout';

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
