import React from 'react';
import RoleNotDeveloped from '../../components/common/RoleNotDeveloped';

export default function CustomerPortal() {
  return (
    <div style={{ padding: '24px', background: 'var(--surface, #faf9f9)', minHeight: '100vh' }}>
      <RoleNotDeveloped roleName="Customer Portal User" routePath="/portal" />
    </div>
  );
}
