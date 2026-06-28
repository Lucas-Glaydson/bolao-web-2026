'use client'

import { useState } from 'react'
import { RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { matchService } from '@/lib/api/matches'
import { useAuthStore } from '@/lib/store/auth'
import toast from 'react-hot-toast'

interface SyncMatchesButtonProps {
  /** Após sincronizar, chama este callback (ex: recarregar lista de jogos) */
  onSynced?: () => void
  /** Modo compacto: apenas ícone + texto, sem o Card */
  compact?: boolean
}

export function SyncMatchesButton({ onSynced, compact = false }: SyncMatchesButtonProps) {
  const { user } = useAuthStore()
  const [isSyncing, setIsSyncing] = useState(false)
  const [result, setResult] = useState<{ synced: number; message: string } | null>(null)

  if (!user || user.role !== 'admin') return null

  const handleSync = async () => {
    setIsSyncing(true)
    setResult(null)
    try {
      const res = await matchService.syncMatches()
      const synced = res?.synced ?? 0
      const message = res?.message ?? 'Sincronização concluída'
      setResult({ synced, message })
      toast.success(`✅ ${synced} jogo(s) atualizado(s)`)
      onSynced?.()
    } catch (error: any) {
      const msg = error?.message || error?.error || 'Erro ao sincronizar'
      toast.error(msg)
      console.warn('Sync error:', msg)
    } finally {
      setIsSyncing(false)
    }
  }

  if (compact) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleSync}
        isLoading={isSyncing}
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
        {isSyncing ? 'Sincronizando...' : 'Sincronizar Placares'}
      </Button>
    )
  }

  return (
    <Card>
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 text-blue-400" />
          <div>
            <h3 className="font-bold text-lg">Sincronizar Placares</h3>
            <p className="text-sm text-slate-400">
              Busca os resultados mais recentes da API externa e atualiza os placares dos jogos
            </p>
          </div>
        </div>

        {result && (
          <div className="p-4 rounded-lg bg-slate-800/50 space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-slate-300">{result.message}</span>
            </div>
            <p className="text-xs text-slate-400">Jogos atualizados: {result.synced}</p>
          </div>
        )}

        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-900/20 border border-blue-800/50">
          <AlertTriangle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-300">
            Sincroniza automaticamente os placares oficiais com a fonte de dados externa. Execute após cada rodada de jogos.
          </p>
        </div>

        <Button
          variant="primary"
          className="w-full"
          onClick={handleSync}
          isLoading={isSyncing}
          leftIcon={!isSyncing && <RefreshCw className="w-5 h-5" />}
        >
          {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
        </Button>
      </div>
    </Card>
  )
}
