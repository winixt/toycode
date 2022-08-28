import { defaultDependencies } from './config';
import { Dependence } from './dependence';

export interface Context {
    dependence: Dependence;
}

export function createContext() {
    return {
        dependence: new Dependence(defaultDependencies),
    };
}
