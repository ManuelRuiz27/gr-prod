import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GraduateContractScreen } from '../pages/graduate/GraduateContractScreen';
describe('GraduateContractScreen', () => {
 it('is a continuous document with terms and direct acceptance', () => { render(<GraduateContractScreen />); expect(screen.getByRole('heading',{name:/Contrato CT-2027-0042/})).toBeInTheDocument(); expect(screen.getByRole('heading',{name:/Términos y condiciones/i})).toBeInTheDocument(); expect(document.querySelector('[class*="overflow-y"]')).toBeNull(); const button=screen.getByRole('button',{name:'Aceptar contrato'}); expect(button).toBeDisabled(); fireEvent.click(screen.getByRole('checkbox',{name:/He leído/i})); fireEvent.click(button); expect(screen.getByText(/Contrato aceptado/)).toBeInTheDocument(); });

 it('unknown explicit contractId does not render Andrea or any foreign folio', () => {
   render(<GraduateContractScreen contractId="nonexistent-contract-xyz" />);
   expect(screen.queryByText(/Andrea/i)).not.toBeInTheDocument();
   expect(screen.queryByText(/CT-2027-0042/)).not.toBeInTheDocument();
   expect(screen.queryByText(/CT-2027/)).not.toBeInTheDocument();
   expect(screen.queryByRole('heading', { name: /Contrato CT-/ })).not.toBeInTheDocument();
 });

 it('unknown explicit contractId shows Contrato no disponible', () => {
   render(<GraduateContractScreen contractId="nonexistent-contract-xyz" />);
   expect(screen.getByText('Contrato no disponible')).toBeInTheDocument();
   expect(screen.getByText('No encontramos el contrato solicitado.')).toBeInTheDocument();
 });
});
