'use client'

import { create } from 'zustand'
import { STORAGE_KEYS } from '@/lib/constants'

interface OnboardingState {
  isOpen: boolean
  hasCompletedOnboarding: boolean
  currentStep: number
  
  openOnboarding: () => void
  closeOnboarding: () => void
  completeOnboarding: () => void
  setCurrentStep: (step: number) => void
  checkOnboardingStatus: () => void
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  isOpen: false,
  hasCompletedOnboarding: false,
  currentStep: 0,

  openOnboarding: () => set({ isOpen: true, currentStep: 0 }),

  closeOnboarding: () => set({ isOpen: false }),

  completeOnboarding: () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true')
    }
    set({
      hasCompletedOnboarding: true,
      isOpen: false,
    })
  },

  setCurrentStep: (step) => set({ currentStep: step }),

  checkOnboardingStatus: () => {
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED)
      const hasCompleted = completed === 'true'
      
      set({
        hasCompletedOnboarding: hasCompleted,
        isOpen: !hasCompleted,
      })
    }
  },
}))
