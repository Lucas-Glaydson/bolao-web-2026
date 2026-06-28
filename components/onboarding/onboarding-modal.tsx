'use client'

import { useState, useCallback } from 'react'
import { Trophy, Target, Award, Users, Lock, Clock } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { useOnboardingStore } from '@/lib/store/onboarding'

const steps = [
  {
    icon: Trophy,
    title: 'Como funciona o Mata-mata?',
    description:
      'O sistema de eliminação direta começa nas 16 avos de final (ou oitavas, dependendo do torneio). Cada partida é decisiva: quem perde, está fora! Você pode fazer palpites em todas as fases do torneio.',
  },
  {
    icon: Target,
    title: 'Pontuação por Fase',
    description:
      '16 Avos, Oitavas e Quartas: 1 ponto cada | Semifinal e Final: 2 pontos cada. As fases finais valem mais!',
  },
  {
    icon: Award,
    title: 'Acertar o Placar Exato',
    description:
      'Se você acertar o placar EXATO da partida, ganha DOBRO de pontos! Por exemplo: acertar 2x1 nas quartas vale 2 pontos (1x2).',
  },
  {
    icon: Users,
    title: 'Palpites Públicos',
    description:
      'Todos os palpites são públicos após o prazo! Você pode ver o que os outros participantes estão apostando e comparar estratégias.',
  },
  {
    icon: Lock,
    title: 'Desbloqueio de Fases',
    description:
      'Fases seguintes só são liberadas após o término da fase anterior. Isso mantém o suspense e a estratégia a cada rodada!',
  },
  {
    icon: Clock,
    title: 'Prazo de 1 Hora',
    description:
      'Você pode fazer palpites até 1 hora antes do início de cada partida. Depois disso, os palpites ficam bloqueados para aquele jogo.',
  },
]

export function OnboardingModal() {
  const { isOpen, closeOnboarding, completeOnboarding } = useOnboardingStore()
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding()
      closeOnboarding()
      setCurrentStep(0)
    }
  }, [currentStep, completeOnboarding, closeOnboarding])

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const handleSkip = useCallback(() => {
    completeOnboarding()
    closeOnboarding()
    setCurrentStep(0)
  }, [completeOnboarding, closeOnboarding])

  const currentStepData = steps[currentStep]
  const Icon = currentStepData.icon

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleSkip}
      size="md"
      closeOnBackdropClick={false}
    >
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-600/20 flex items-center justify-center">
            <Icon className="w-8 h-8 text-green-500" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-50">
              {currentStepData.title}
            </h3>
            <p className="text-slate-300 leading-relaxed">
              {currentStepData.description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${index === currentStep
                ? 'w-8 bg-green-600'
                : 'w-2 bg-slate-700'
                }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="flex-1"
          >
            Pular
          </Button>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="secondary"
                onClick={handleBack}
              >
                Voltar
              </Button>
            )}

            <Button
              variant="primary"
              onClick={handleNext}
            >
              {currentStep === steps.length - 1 ? 'Começar' : 'Próximo'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
