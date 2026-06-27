import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin Control Plane — Smartbuilder',
    description: 'Founder & CEO Dashboard — Internal platform management and analytics.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen" style={{ background: '#05050a' }}>
            {children}
        </div>
    );
}
