import { render, screen } from '@testing-library/react'
import { ProgressBar } from '../ProgressBar'

describe('ProgressBar', () => {
  it('displays current step and total steps', () => {
    render(<ProgressBar currentStep={3} totalSteps={6} />)
    
    expect(screen.getByText('Step 3 of 6')).toBeInTheDocument()
  })

  it('calculates progress percentage correctly', () => {
    render(<ProgressBar currentStep={3} totalSteps={6} />)
    
    expect(screen.getByText('50% complete')).toBeInTheDocument()
  })

  it('displays correct progress for first step', () => {
    render(<ProgressBar currentStep={1} totalSteps={6} />)
    
    expect(screen.getByText('Step 1 of 6')).toBeInTheDocument()
    expect(screen.getByText('17% complete')).toBeInTheDocument()
  })

  it('displays correct progress for last step', () => {
    render(<ProgressBar currentStep={6} totalSteps={6} />)
    
    expect(screen.getByText('Step 6 of 6')).toBeInTheDocument()
    expect(screen.getByText('100% complete')).toBeInTheDocument()
  })

  it('handles edge cases gracefully', () => {
    render(<ProgressBar currentStep={0} totalSteps={6} />)
    expect(screen.getByText('Step 0 of 6')).toBeInTheDocument()
    expect(screen.getByText('0% complete')).toBeInTheDocument()
  })

  it('rounds progress percentage to nearest integer', () => {
    render(<ProgressBar currentStep={1} totalSteps={3} />)
    // 1/3 = 0.333... should round to 33%
    expect(screen.getByText('33% complete')).toBeInTheDocument()
  })
})