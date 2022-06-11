export interface Schema {
    version: string;
    componentsMap: ComponentSource[];
    css?: string;
    utils?: UtilSource[];
}

export interface ComponentSource {
    componentName: string; // 优先使用 exportName 如果没有则使用 componentName
    package: string;
    version?: string;
    exportName?: string;
    main?: string; // 包导出文件路径
}

export interface ContainerComponent {
    componentName: 'Page' | 'Block' | 'Component';
    fileName: string;
    ref: string;
    props?: ComponentProps[];
    events?: ComponentEvent[];
    css?: string;
    dataSource?: {
        list: ComponentDataSource[];
        dataHandler: (T: Record<string, any>) => Record<string, any>;
    };
    children: (ContainerComponent | Component)[];
    condition?: boolean | string;
    static?: any;
}

export interface ComponentDataSource {
    id: string;
    isInit: boolean;
    isSync: boolean;
    type: 'fetch' | 'custom';
    willFetch?: (T: Record<string, any>) => Record<string, any>;
    requestHandler?: (T: Record<string, any>) => Record<string, any>;
    dataHandler?: (T: Record<string, any>) => Record<string, any>;
    errorHandler?: (T: Record<string, any>) => Record<string, any>;
    options: ComponentDataSourceOptions;
}

export interface ComponentDataSourceOptions {
    uri: string;
    params: Record<string, any>;
    method: 'GET' | 'POST';
    isCors: boolean;
    timeout: number;
    headers?: Record<string, string>;
}

export interface Component {
    id: string;
    componentName: string;
    props?: ComponentProps[];
    events?: ComponentEvent[];
    condition?: boolean | string;
    loop?: [];
    loopArgs?: [string, string]; // default [“item”, “index”]
    children?: Component[];
}

export interface ComponentProps {
    [key: string]: number | string | boolean | object | [] | CompositePropType;
}

export interface ComponentEvent {
    name: string;
    type: ExtensionType;
    value: string;
}

export interface CompositePropType {
    type: ExtensionType;
    value: string;
}

export enum ExtensionType {
    JSFunction = 'JSFunction',
    JSExpression = 'JSExpression',
    JSSlot = 'JSSlot',
}

export type UtilSource = NpmUtilSoucre | LocalUtilSource;

export interface NpmUtilSoucre {
    name: string;
    type: 'npm';
    content: {
        package: string;
        version?: string;
        exportName?: string;
        main?: string;
    };
}

export interface LocalUtilSource {
    name: string;
    type: 'function';
    content: {
        type: ExtensionType.JSFunction;
        value: string;
    };
}
