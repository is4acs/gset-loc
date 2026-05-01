'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { requestPasswordResetSchema, type RequestPasswordResetInput } from '@/lib/validation/auth';
import { requestPasswordResetAction } from '@/lib/auth/actions/request-password-reset';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export function ResetForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestPasswordResetInput>({
    resolver: zodResolver(requestPasswordResetSchema),
  });

  async function onSubmit(data: RequestPasswordResetInput) {
    await requestPasswordResetAction(data);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email envoyé</CardTitle>
          <CardDescription>
            Si cette adresse correspond à un compte, vous recevrez un lien pour réinitialiser votre
            mot de passe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/connexion" className="text-primary text-sm underline">
            Retour à la connexion
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mot de passe oublié</CardTitle>
        <CardDescription>
          Indiquez votre email, on vous enverra un lien de réinitialisation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" autoFocus {...register('email')} />
            {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Envoi…' : 'Envoyer le lien'}
          </Button>
        </form>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          <Link href="/connexion" className="hover:text-primary underline">
            Retour à la connexion
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
