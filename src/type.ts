export interface Schema {
    config: SchemaConfig;
    css?: CSS;
    utils?: DefineFunction[];
    uses?: DefineFunction[];
    services?: DefineFunction[];
    constants?: DefineConstants[];
    dependencies?: DependentResource[];
}

export interface DefineConstants {
    exportName: string;
    content: string;
}

export interface DefineFunction {
    exportName: string;
    content: string;
    importResources?: ImportResource[];
}

export interface ImportResource {
    importName: string;
    pakage: string;
    isDefaultImport?: boolean;
    aliasName?: string;
}

export interface ContainerComponent {
    componentName: 'Page' | 'Block' | 'Component';
    dir: string;
    fileName: string;
    ref?: string;
    css?: CSS;

    condition?: boolean | string;
}

export interface DependentResource {
    package: string;
    version: string;
}

interface SchemaConfig {
    common: {
        useDir: string;
        serviceDir: string;
        constantsPath: string;
        utilsDir: string;
    };
    componentsDir: string;
    pageDir: string;
}

interface CSS {
    lang: 'css' | 'less' | 'scss';
    content: string;
    dir?: string;
    fileName?: string;
    scoped?: boolean;
    injectSFC?: boolean;
}
