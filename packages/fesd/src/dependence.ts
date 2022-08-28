import { Package } from './type';

export class Dependence {
    packages: Package[];
    constructor(packages: Package[]) {
        this.packages = packages;
    }
    addPackage(pkg: Package) {
        this.packages.push(pkg);
    }
    getPackages() {
        return this.packages;
    }
}
