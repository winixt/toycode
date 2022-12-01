type ContainerComponent = SFCComponent;
export interface Schema {
    componentsTree: ContainerComponent[];
    css?: CSS;
    jsCodes?: JSCode[];
    dependencies?: DependentResource[];
}

export interface Config {
    projectDir?: string;
    path?: {
        constants?: string;
        utils?: string;
        useDir?: string;
        useTable?: string;
        useFetch?: string;
        useModal?: string;
        useModel?: string;
        pagesDir?: string;
        componentsDir?: string;
    };
}

export interface JSCode {
    content: string;
    dir?: string;
    fileName: string;
}

export enum ImportType {
    ImportDefaultSpecifier = 'ImportDefaultSpecifier',
    ImportSpecifier = 'ImportSpecifier',
}

export interface ImportSource {
    imported?: string;
    source: string;
    type: ImportType;
    local?: string;
}

export interface SetupCode {
    importSources?: ImportSource[];
    content: string;
}

export interface SFCComponent {
    componentName: 'SFCComponent';
    dir?: string;
    fileName: string;
    children: Component[];
    setupCodes: SetupCode[];
    css?: CSS;
    propsDefinition?: ComponentPropDefinition[];
    emitsDefinition?: string[] | Record<string, string>[];
}

export enum ExtensionType {
    JSDeclaration = 'JSDeclaration',
    JSFunction = 'JSFunction',
    JSExpression = 'JSExpression',
    JSSlot = 'JSSlot',
}

export interface Component {
    componentName: string;
    props?: ComponentProps;
    events?: ComponentEvents;
    directives?: ComponentDirectives;
    id?: string;
    parentId?: string;
    loop?: [];
    loopArgs?: [string, string]; // default [“item”, “index”]
    condition?: boolean | ExtensionType.JSExpression;
    children?: (Component | string)[];
    slots?: ComponentSlot[];
}

export interface ComponentSlot {
    name: string;
    scoped?: string;
    component: Component;
}

export interface CustomPropType {
    type: ExtensionType.JSExpression;
    value: string | object;
}

type PropValue = string | number | [] | object | boolean | CustomPropType;

export interface ComponentProps {
    id?: PropValue;
    class?: PropValue;
    style?: PropValue;
    ref?: PropValue;
    [key: string]: PropValue;
}

export interface ComponentEvents {
    [key: string]: string;
}

export interface ComponentDirectives {
    [key: string]: string;
}

export type PropType =
    | 'Boolean'
    | 'String'
    | 'Array'
    | 'Object'
    | 'Function'
    | 'Number';

export interface ComponentPropDefinition {
    name: string;
    propType: PropType;
    description?: string;
    defaultValue?: any;
}

export interface DependentResource {
    package: string;
    version: string;
}

export interface CSS {
    lang: 'css' | 'less';
    content: string;
    dir?: string;
    fileName?: string;
    scoped?: boolean;
}

export interface PreChangeFile {
    file: string;
    content: string;
}
