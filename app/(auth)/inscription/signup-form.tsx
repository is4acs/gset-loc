'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupInput } from '@/lib/validation/auth';
import { signupAction } from '@/lib/auth/actions/signup';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function SignupForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { customerType: 'INDIVIDUAL' },
  });

  const customerType = useWatch({ control, name: 'customerType' });

  async function onSubmit(data: SignupInput) {
    setServerError(null);
    const result = await signupAction(data);
    if (result.success) {
      setEmailSent(true);
    } else {
      setServerError(result.error);
    }
  }

  if (emailSent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vérifiez votre boîte mail</CardTitle>
          <CardDescription>
            Un lien de confirmation vient de vous être envoyé. Cliquez dessus pour activer votre
            compte.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          <p>Pas reçu d&apos;email ? Vérifiez vos spams.</p>
          <p className="mt-2">
            <Link href="/connexion" className="text-primary underline">
              Retour à la connexion
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Créer un compte</CardTitle>
        <CardDescription>Inscrivez-vous pour réserver du matériel.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <fieldset>
            <legend className="mb-2 text-sm font-medium">Vous êtes</legend>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`cursor-pointer rounded-md border px-3 py-2 text-center text-sm transition-colors ${
                  customerType === 'INDIVIDUAL'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'hover:border-foreground/30'
                }`}
              >
                <input
                  type="radio"
                  value="INDIVIDUAL"
                  {...register('customerType')}
                  className="sr-only"
                />
                Particulier
              </label>
              <label
                className={`cursor-pointer rounded-md border px-3 py-2 text-center text-sm transition-colors ${
                  customerType === 'PRO'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'hover:border-foreground/30'
                }`}
              >
                <input type="radio" value="PRO" {...register('customerType')} className="sr-only" />
                Professionnel
              </label>
            </div>
          </fieldset>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">Prénom</Label>
              <Input id="firstName" autoComplete="given-name" {...register('firstName')} />
              {errors.firstName && (
                <p className="text-destructive text-xs">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Nom</Label>
              <Input id="lastName" autoComplete="family-name" {...register('lastName')} />
              {errors.lastName && (
                <p className="text-destructive text-xs">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
            {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
            />
            {errors.password ? (
              <p className="text-destructive text-xs">{errors.password.message}</p>
            ) : (
              <p className="text-muted-foreground text-xs">
                10 caractères minimum, dont une majuscule, une minuscule et un chiffre.
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Création…' : "S'inscrire"}
          </Button>
        </form>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          Déjà un compte ?{' '}
          <Link href="/connexion" className="text-primary underline">
            Connexion
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
