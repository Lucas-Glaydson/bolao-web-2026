'use client'

import { GroupStandings } from '@/components/groups/group-standings'
import { GenerateKnockoutButton } from '@/components/admin/generate-knockout-button'

export default function StandingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Classificação dos Grupos</h1>
        <p className="text-slate-400">Tabelas atualizadas da fase de grupos em tempo real</p>
      </div>

      {/* Botão Admin - Gerar Oitavas */}
      <GenerateKnockoutButton />

      <GroupStandings />
    </div>
  )
}
