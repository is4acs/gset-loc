import { db } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { formatEurosFromCents } from '@/lib/format';
import { toggleEquipmentActiveAction } from '@/lib/admin/equipment-actions';

export const metadata = { title: 'Admin · Flotte' };

export default async function AdminFleetPage() {
  const equipments = await db.equipment.findMany({
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    include: {
      category: true,
      _count: { select: { units: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Flotte</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {equipments.length} équipements ({equipments.filter((e) => e.isActive).length} actifs).
        </p>
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Équipement</th>
                <th className="px-4 py-3 text-left">Catégorie</th>
                <th className="px-4 py-3 text-right">Tarif/jour</th>
                <th className="px-4 py-3 text-right">Caution</th>
                <th className="px-4 py-3 text-right">Unités</th>
                <th className="px-4 py-3 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {equipments.map((e) => (
                <tr key={e.id} className={e.isActive ? '' : 'opacity-60'}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{e.name}</p>
                    <p className="text-muted-foreground text-xs">{e.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-muted text-foreground rounded-full px-2 py-0.5 text-xs">
                      {e.category.name}
                    </span>
                    {e.requiresOperator && (
                      <span className="bg-accent/10 text-accent ml-1 rounded-full px-2 py-0.5 text-xs">
                        Opérateur
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatEurosFromCents(e.dayRate, { hideCentsWhenZero: true })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {e.requiresOperator
                      ? '—'
                      : formatEurosFromCents(e.baseDeposit, { hideCentsWhenZero: true })}
                  </td>
                  <td className="px-4 py-3 text-right">{e._count.units}</td>
                  <td className="px-4 py-3 text-right">
                    <form
                      action={async () => {
                        'use server';
                        await toggleEquipmentActiveAction(e.slug);
                      }}
                    >
                      <button
                        type="submit"
                        className={`inline-flex h-7 items-center rounded-full border px-3 text-xs font-medium transition-colors ${
                          e.isActive
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        {e.isActive ? '● Actif' : '○ Inactif'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
