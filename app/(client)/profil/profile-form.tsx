'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileInput } from '@/lib/validation/profile';
import { updateProfileAction } from '@/lib/auth/actions/update-profile';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ProfileForm({ defaultValues }: { defaultValues: ProfileInput }) {
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  const customerType = useWatch({ control, name: 'customerType' });

  async function onSubmit(data: ProfileInput) {
    setFeedback(null);
    const result = await updateProfileAction(data);
    if (result.success) {
      setFeedback({ ok: true, msg: 'Profil mis à jour.' });
    } else {
      setFeedback({ ok: false, msg: result.error });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {feedback && (
        <Alert variant={feedback.ok ? 'default' : 'destructive'}>
          <AlertDescription>{feedback.msg}</AlertDescription>
        </Alert>
      )}

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
          {errors.lastName && <p className="text-destructive text-xs">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Téléphone (optionnel)</Label>
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+594 6 94 12 34 56"
          {...register('phone')}
        />
        {errors.phone && <p className="text-destructive text-xs">{errors.phone.message}</p>}
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Type de compte</legend>
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

      {customerType === 'PRO' && (
        <div className="space-y-3 rounded-md border border-dashed p-4">
          <div className="space-y-1.5">
            <Label htmlFor="companyName">Raison sociale</Label>
            <Input id="companyName" {...register('companyName')} />
            {errors.companyName && (
              <p className="text-destructive text-xs">{errors.companyName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="siret">SIRET</Label>
            <Input
              id="siret"
              inputMode="numeric"
              placeholder="14 chiffres"
              {...register('siret')}
            />
            {errors.siret && <p className="text-destructive text-xs">{errors.siret.message}</p>}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={!isDirty || isSubmitting}>
          {isSubmitting ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
}
