import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GraduateContractScreen } from '../pages/graduate/GraduateContractScreen';
describe('GraduateContractScreen', () => {
 it('is a continuous document with terms and direct acceptance', () => { render(<GraduateContractScreen />); expect(screen.getByRole('heading',{name:/Contrato CT-2027-0042/})).toBeInTheDocument(); expect(screen.getByRole('heading',{name:/Términos y condiciones/i})).toBeInTheDocument(); expect(document.querySelector('[class*="overflow-y"]')).toBeNull(); const button=screen.getByRole('button',{name:'Aceptar contrato'}); expect(button).toBeDisabled(); fireEvent.click(screen.getByRole('checkbox',{name:/He leído/i})); fireEvent.click(button); expect(screen.getByText(/Contrato aceptado/)).toBeInTheDocument(); });
});
