'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { matchService } from '@/lib/api/matches'
import { useAuthStore } from '@/lib/store/auth'
import toast from 'react-hot-toast'

export function GenerateKnockoutButton() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ synced: number; message: string } | null>(null)

  if (!user || user.role !== 'admin') return null

  const handleSync = async () => {
    setIsLoading(true)
    try {
      const response = await matchService.syncMatches()
      const synced = response?.synced ?? 0
      const message = response?.message ?? 'Sincronização concluída'

      setResult({ synced, message })
      toast.success(`✅ ${synced} jogo(s) atualizados da API`)

      setTimeout(() => {
        router.refresh()
        router.push('/bracket')
      }, 1500)
    } catch (error: any) {
      const errorMessage = error?.message || error?.error || 'Erro ao buscar partidas'
      toast.error(errorMessage)
      console.warn('Sync error:', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Download className="w-6 h-6 text-blue-400" />
          <div>
            <h3 className="font-bold text-lg">Buscar Partidas da API</h3>
            <p className="text-sm text-slate-400">
              Sincroniza todas as partidas (incluindo 16 avos) diretamente da fonte oficial de dados
            </p>
          </div>
        </div>

        {result && (
          <div className="p-4 rounded-lg bg-slate-800/50 space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-slate-300">{result.message}</span>
            </div>
            <p className="text-xs text-slate-400">Jogos sincronizados: {result.synced}</p>
          </div>
        )}

        <Button
          variant="primary"
          className="w-full"
          onClick={handleSync}
          isLoading={isLoading}
          leftIcon={!isLoading && <Download className="w-5 h-5" />}
        >
          {isLoading ? 'Buscando...' : 'Buscar Partidas da API'}
        </Button>

        <p className="text-xs text-slate-500 text-center">
          Esta ação só é visível para administradores
        </p>
      </div>
    </Card>
  )
}

export function GenerateKnockoutButton() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<{
    generated: number
    updated: number
    message: string
  } | null>(null)

  // Só mostra para admins
  if (!user || user.role !== 'admin') {
    return null
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const response = await groupService.generateKnockout()
      const generated = response?.generated ?? 0
      const updated = response?.updated ?? 0
      const message = response?.message ?? 'Operação concluída'

      setResult({ generated, updated, message })

      if (generated > 0 || updated > 0) {
        toast.success(`16 avos gerados! ${generated} novos, ${updated} atualizados`)
      } else {
        toast.success('Confrontos já estão atualizados')
      }

      // Recarrega a página para buscar os jogos atualizados da API
      setTimeout(() => {
        router.refresh()
        router.push('/bracket')
      }, 1500)
    } catch (error: any) {
      const errorMessage = error?.message || error?.error || 'Erro ao gerar fase eliminatória'
      toast.error(errorMessage)
      console.warn('Error generating knockout:', errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-yellow-500" />
          <div>
            <h3 className="font-bold text-lg">Gerar / Simular 16 Avos de Final</h3>
            <p className="text-sm text-slate-400">
              Monta os confrontos com base na classificação atual dos grupos — funciona mesmo antes dos grupos serem concluídos (simulação)
            </p>
          </div>
        </div>

        {result && (
          <div className="p-4 rounded-lg bg-slate-800/50 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-slate-300">{result.message}</span>
            </div>
            <div className="flex gap-4 text-xs text-slate-400">
              <span>Criados: {result.generated}</span>
              <span>Atualizados: {result.updated}</span>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-900/20 border border-yellow-800/50">
          <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
          <div className="text-xs text-yellow-400">
            <p className="font-semibold mb-1">⚠️ Atenção:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Usa os líderes atuais de cada grupo (mesmo sem encerrar)</li>
              <li>Times placeholder serão substituídos pelos classificados atuais</li>
              <li>Palpites existentes serão mantidos</li>
              <li>Execute novamente para atualizar se a classificação mudar</li>
            </ul>
          </div>
        </div>

        <Button
          variant="primary"
          className="w-full"
          onClick={handleGenerate}
          isLoading={isGenerating}
          leftIcon={!isGenerating && <Zap className="w-5 h-5" />}
        >
          {isGenerating ? 'Simulando...' : 'Simular / Gerar 16 Avos'}
        </Button>

        <p className="text-xs text-slate-500 text-center">
          Esta ação só é visível para administradores
        </p>
      </div>
    </Card>
  )
}
