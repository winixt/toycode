export interface Schema {
    version: string;
    componentsMap: ComponentSource[];
}

export interface ComponentSource {
    componentName: string;
    package: string;
    version?: string;
    exportName?: string;
}
