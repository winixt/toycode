import {
    Schema,
    SFCComponent,
    Component,
    ExtensionType,
    ImportType,
    ImportSource,
    SetupCode,
} from '@qlin/toycode-core';
import { join } from 'path';
import { APISchema, Field, BlockMeta, BlockSchema } from '../type';
import { defaultPageCss } from '../config';
import {
    genSFCFileName,
    getJsCode,
    genDirAndFileName,
    isGenComponent,
    genOptionsName,
} from '../utils';
import { COMMON_DIR } from '../constants';
import { componentMap } from '../componentMap';
import { applySearchAction } from './searchAction';
import { genRelationModals } from './modal';
import { applyModal } from './useModal';
import { handleComponentOptions, formatResData } from './shared';
import { genTableSetupCode, genTableTemplate } from './table';
import { genFetchCode, genFormImportResources } from './form';
import { Context } from '../context';

// REFACTOR 抽离 search form 相关代码到独立的文件
function genSearchForm(params: Field[]) {
    const form: Component = {
        componentName: 'FForm',
        props: {
            layout: 'inline',
        },
        children: [],
    };
    for (const item of params) {
        const comp = componentMap(item.component.componentName);
        const formCompProps: Record<string, any> = {
            ...item.component.props,
            ...comp.props,
        };
        let children = null;
        if (item.mappingId) {
            if (item.component.appendAll) {
                formCompProps.options = {
                    type: ExtensionType.JSExpression,
                    value: `appendAll(${item.mappingId})`,
                };
            } else {
                formCompProps.options = {
                    type: ExtensionType.JSExpression,
                    value: item.mappingId,
                };
            }
        } else if (item.options?.length) {
            children = handleComponentOptions(item.options, comp.subName);
            if (item.component.appendAll) {
                children.unshift({
                    componentName: comp.subName,
                    props: {
                        label: '全部',
                        value: null,
                    },
                });
            }
        } else if (item.apiSchema) {
            if (item.component.appendAll) {
                formCompProps.options = {
                    type: ExtensionType.JSExpression,
                    value: `appendAll(${genOptionsName(item.name)})`,
                };
            } else {
                formCompProps.options = {
                    type: ExtensionType.JSExpression,
                    value: genOptionsName(item.name),
                };
            }
        }
        form.children.push({
            componentName: 'FFormItem',
            props: {
                label: item.title,
            },
            children: [
                {
                    componentName: comp.name,
                    props: formCompProps,
                    directives: {
                        'v-model': `searchParams.${item.name}`,
                    },
                    children,
                },
            ],
        });
    }
    return form;
}

function genTemplate(apiSchema: APISchema) {
    const children: Component[] = [];

    if (apiSchema.params?.length) {
        children.push(genSearchForm(apiSchema.params));
    }

    return [...children, ...genTableTemplate(apiSchema)];
}

function genBlockMeta(meta: BlockMeta) {
    if (!isGenComponent(meta)) {
        const importSources: ImportSource[] = [
            {
                imported: 'defineRouteMeta',
                type: ImportType.ImportSpecifier,
                source: '@fesjs/fes',
            },
        ];

        return {
            importSources,
            content: `
            defineRouteMeta({
                name: '${genSFCFileName(meta.name)}',
                ${meta.title ? `title: '${meta.title}'` : ''},
            });
            `,
        };
    }
}

function genSearchFormSetupCode(params: Field[]): SetupCode {
    const importSources: ImportSource[] = [
        ...genFormImportResources(params),
        ...genAppendAllCode(params),
    ];

    const fetchCode = genFetchCode(params);

    return {
        importSources: importSources.concat(fetchCode.importSources),
        content: `
        const searchParams = reactive({
            ...initSearchParams
        });
        ${fetchCode.content}
        `,
    };
}

function genAppendAllCode(fields: Field[]) {
    const importSources: ImportSource[] = [];
    if (fields.find((item) => item.component.appendAll)) {
        importSources.push({
            imported: 'appendAll',
            type: ImportType.ImportSpecifier,
            source: '@/common/utils',
        });
    }

    return importSources;
}

function genInitSearchParams(params: Field[]): SetupCode {
    let content = '';
    if (params.length) {
        const fields = params.map((item) => {
            return `${item.name}: null`;
        });
        content = `
        const initSearchParams = {
            ${fields.join(', ')}
        }
        `;
    }
    return {
        importSources: [],
        content,
    };
}

function genSetupCode(ctx: Context, pageConfig: BlockSchema) {
    const queryApiSchema = pageConfig.apiSchema;
    const setupCodes: SetupCode[] = [
        genInitSearchParams(queryApiSchema.params),
        genTableSetupCode(ctx, queryApiSchema, {
            hasRefresh: !!(
                queryApiSchema.params.length || pageConfig.relationModals.length
            ),
        }),
    ];

    if (queryApiSchema.params.length) {
        setupCodes.push(genSearchFormSetupCode(queryApiSchema.params));
    }

    setupCodes.push(genBlockMeta(pageConfig.meta));

    return setupCodes.filter(Boolean);
}

export function genBlockSchema(ctx: Context, pageConfig: BlockSchema): Schema {
    pageConfig.apiSchema.resData.fields = formatResData(
        pageConfig.apiSchema.resData.fields,
    );

    const initSFC: SFCComponent = {
        componentName: 'SFCComponent',
        ...genDirAndFileName(pageConfig),
        setupCodes: genSetupCode(ctx, pageConfig),
        children: [
            {
                componentName: 'div',
                props: {
                    class: 'common-page',
                },
                children: genTemplate(pageConfig.apiSchema),
            },
        ],
    };

    const sfc = [applySearchAction, applyModal].reduce((acc, action) => {
        return action(pageConfig, acc);
    }, initSFC);

    const jsCodes = getJsCode(join(__dirname, '../../template'), COMMON_DIR);

    return {
        componentsTree: [sfc, ...genRelationModals(ctx, pageConfig)],
        css: defaultPageCss,
        jsCodes,
        dependencies: ctx.dependence.getPackages(),
    };
}
