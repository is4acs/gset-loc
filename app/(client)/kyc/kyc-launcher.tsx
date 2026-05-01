'use client';

import Link from 'next/link';
import { useState } from 'react';
import { startKycAction } from '@/lib/auth/actions/start-kyc';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { CustomerType, KYCStatus } from '@prisma/client';

interface Props {
  currentStatus: KYCStatus;
  customerType: CustomerType;
  companyName: string | null;
  siret: string | null;
}

export function KycLauncher({ currentStatus, customerType, companyName, siret }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const proInfoMissing = customerType === 'PRO' && (!companyName || !siret);

  async function start() {
    setError(null);
    setPending(true);
    const result = await startKycAction();
    if (result.success) {
      window.location.href = result.url;
      return;
    }
    setPending(false);
    setError(result.error);
  }

  if (proInfoMissing) {
    return (
      <Alert>
        <AlertDescription>
          Pour les pros, complétez d&apos;abord votre raison sociale et votre SIRET dans le{' '}
          <Link href="/profil" className="underline">
            profil
          </Link>
          .
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button onClick={start} disabled={pending} className="w-full sm:w-auto">
        {pending
          ? 'Préparation…'
          : currentStatus === 'PENDING'
            ? 'Reprendre la vérification'
            : 'Démarrer la vérification'}
      </Button>
    </div>
  );
}
