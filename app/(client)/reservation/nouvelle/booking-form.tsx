'use client';

import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingDraftSchema, type BookingDraft } from '@/lib/validation/booking';
import { startBookingAction } from '@/lib/booking/actions/start-booking';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { priceBooking } from '@/lib/booking/pricing';
import type { TrustLevel } from '@/lib/pricing';
import { formatEurosFromCents } from '@/lib/format';

interface Props {
  equipmentSlug: string;
  requiresOperator: boolean;
  hourlyRate: number;
  halfDayRate: number;
  dayRate: number;
  baseDeposit: number;
  trustLevel: TrustLevel;
}

const SLOT_OPTIONS = [
  { value: 'HOUR_1', label: '1 heure' },
  { value: 'HOUR_2', label: '2 heures' },
  { value: 'HALF_DAY', label: 'Demi-journée (4h)' },
  { value: 'DAY', label: 'Journée (8h)' },
  { value: 'MULTI_DAY', label: 'Plusieurs jours' },
] as const;

function defaultStartAt(): string {
  // Default = tomorrow at 8:00, datetime-local format (no TZ)
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(8, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function BookingForm({
  equipmentSlug,
  requiresOperator,
  hourlyRate,
  halfDayRate,
  dayRate,
  baseDeposit,
  trustLevel,
}: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BookingDraft>({
    resolver: zodResolver(bookingDraftSchema),
    defaultValues: {
      equipmentSlug,
      slotType: 'HOUR_2',
      startAt: defaultStartAt(),
      days: 2,
      interventionAddress: '',
    },
  });

  const slotType = useWatch({ control, name: 'slotType' });
  const days = useWatch({ control, name: 'days' });

  const pricing = useMemo(
    () =>
      priceBooking({
        slotType,
        days,
        hourlyRate,
        halfDayRate,
        dayRate,
        baseDeposit,
        requiresOperator,
        trustLevel,
      }),
    [slotType, days, hourlyRate, halfDayRate, dayRate, baseDeposit, requiresOperator, trustLevel],
  );

  async function onSubmit(data: BookingDraft) {
    setServerError(null);
    setPending(true);
    const result = await startBookingAction({
      ...data,
      // Convert datetime-local to ISO with the user's timezone
      startAt: new Date(data.startAt).toISOString(),
      days: data.slotType === 'MULTI_DAY' ? data.days : undefined,
      interventionAddress: requiresOperator ? data.interventionAddress : '',
    });

    if (result.ok) {
      window.location.assign(result.checkoutUrl);
      return;
    }
    setPending(false);
    setServerError(result.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <input type="hidden" {...register('equipmentSlug')} />

      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Durée</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {SLOT_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`cursor-pointer rounded-md border px-3 py-2 text-center text-xs transition-colors ${
                slotType === opt.value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'hover:border-foreground/30'
              }`}
            >
              <input type="radio" value={opt.value} {...register('slotType')} className="sr-only" />
              {opt.label}
            </label>
          ))}
        </div>
        {errors.slotType && (
          <p className="text-destructive mt-1 text-xs">{errors.slotType.message}</p>
        )}
      </fieldset>

      <div className="space-y-1.5">
        <Label htmlFor="startAt">Début</Label>
        <Input id="startAt" type="datetime-local" {...register('startAt')} />
        {errors.startAt && <p className="text-destructive text-xs">{errors.startAt.message}</p>}
      </div>

      {slotType === 'MULTI_DAY' && (
        <div className="space-y-1.5">
          <Label htmlFor="days">Nombre de jours</Label>
          <Input
            id="days"
            type="number"
            min={2}
            max={30}
            {...register('days', { valueAsNumber: true })}
          />
          {errors.days && <p className="text-destructive text-xs">{errors.days.message}</p>}
        </div>
      )}

      {requiresOperator && (
        <div className="space-y-1.5">
          <Label htmlFor="interventionAddress">Adresse d’intervention</Label>
          <Input
            id="interventionAddress"
            placeholder="Adresse complète à Cayenne / Kourou / etc."
            {...register('interventionAddress')}
          />
          {errors.interventionAddress && (
            <p className="text-destructive text-xs">{errors.interventionAddress.message}</p>
          )}
        </div>
      )}

      {/* Pricing summary */}
      <div className="bg-muted/40 rounded-md border p-4 text-sm">
        <p className="text-muted-foreground text-xs uppercase">Récapitulatif</p>
        <dl className="mt-2 space-y-1.5">
          <Line label="Location HT" amount={pricing.rentalAmount} />
          <Line label="TVA Guyane (8,5 %)" amount={pricing.vatAmount} />
          <div className="border-border mt-2 border-t pt-2">
            <Line label="Total à payer" amount={pricing.totalAmount} bold />
          </div>
          {pricing.depositAmount > 0 && (
            <p className="text-muted-foreground mt-2 text-xs">
              + empreinte CB :{' '}
              <strong>
                {formatEurosFromCents(pricing.depositAmount, { hideCentsWhenZero: true })}
              </strong>{' '}
              (non débitée si retour OK).
            </p>
          )}
          {requiresOperator && (
            <p className="text-muted-foreground mt-2 text-xs">
              Opérateur GSET inclus dans le tarif. Aucune caution.
            </p>
          )}
        </dl>
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Préparation du paiement…' : 'Continuer vers le paiement'}
      </Button>

      <p className="text-muted-foreground text-center text-xs">
        Paiement sécurisé via Stripe. Aucun débit n’est effectué tant que le paiement n’est pas
        confirmé.
      </p>
    </form>
  );
}

function Line({ label, amount, bold }: { label: string; amount: number; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className={bold ? 'font-semibold' : 'text-muted-foreground'}>{label}</dt>
      <dd className={bold ? 'font-semibold' : ''}>
        {formatEurosFromCents(amount, { hideCentsWhenZero: true })}
      </dd>
    </div>
  );
}
