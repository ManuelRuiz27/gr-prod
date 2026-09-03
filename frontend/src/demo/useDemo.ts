import { useContext } from 'react';
import { DemoContext } from './DemoContext';

export const useDemo = () => useContext(DemoContext);
