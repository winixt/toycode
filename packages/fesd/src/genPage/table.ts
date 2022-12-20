import {
    SFCComponent,
    ImportType,
    ImportSource,
    ExtensionType,
    Component,
} from '@qlin/toycode-core';
import { Field, APISchema, TableSetupOption } from '../type';
import { Context } from '../context';
import { getPageField, getDataField, genFileNameByPath } from '../utils';
import { genImportedMappingCode, formatResData } from './shared';
import { ROW_DATA_PROP_NAME } from '../constants';
import { dateFnsDependency } from '../config';

function genTransform(ctx: Context, apiSchema: APISchema) {
    const importSources: ImportSource[] = [];
    const mappingCode = apiSchema.resData.fields
        .map((item) => {
            if (item.mappingId) {
                return `item.${item.alias} = getTargetLabel(${item.mappingId}, item.${item.name})`;
            }
            return null;
        })
        .filter(Boolean)
        .join(';\n');
    if (mappingCode) {
        importSources.push(
            {
                imported: 'getTargetLabel',
                type: ImportType.ImportSpecifier,
                source: ctx.getUtilsFilePathImp(),
            },
            ...genImportedMappingCode(ctx, apiSchema.resData.fields),
        );
    }
    const timeCode = apiSchema.resData.fields
        .map((item) => {
            if (item.name.endsWith('Time')) {
                return `item.${item.alias} = item.${item.name} ? format(item.${item.name}, 'yyyy-MM-dd HH:mm:ss') : ''`;
            }
            return null;
        })
        .filter(Boolean)
        .join(';\n');
    if (timeCode) {
        importSources.push({
            imported: 'format',
            type: ImportType.ImportSpecifier,
            source: 'date-fns',
        });
        ctx.dependence.addPackage(dateFnsDependency);
    }
    if (timeCode || mappingCode) {
        return {
            importSources: importSources,
            content: `transform(data) {
                return data.map((item) => {
                    ${mappingCode}
                    ${timeCode}
                    return item;
                })
            },`,
        };
    }
    return {
        importSources: [],
        content: '',
    };
}

// FEATURE 没想明白以后 formatParams 还有那些形式，以后遇到再对这块代码进行优化
function genFormatParams(ctx: Context, apiSchema: APISchema) {
    const targetField = apiSchema.params.find((item) => !!item.mapFields);
    if (targetField) {
        ctx.dependence.addPackage(dateFnsDependency);

        const format =
            targetField.component.props.type === 'daterangetime'
                ? 'yyyy-MM-dd HH:mm:ss'
                : 'yyyy-MM-dd';
        return {
            importSources: [
                {
                    imported: 'format',
                    type: ImportType.ImportSpecifier,
                    source: 'date-fns',
                },
            ],
            content: `
            formatParams(params) {
                if (params.${targetField.name}) {
                    const rawData = params.${targetField.name};
                    delete params.${targetField.name};
                    params.${targetField.mapFields[0]} = format(rawData[0], '${format}');
                    params.${targetField.mapFields[1]} = format(rawData[1], '${format}');
                }
    
                return params;
            },
            `,
        };
    }
    return {
        importSources: [],
        content: '',
    };
}

export function genTableSetupCode(
    ctx: Context,
    apiSchema: APISchema,
    options: TableSetupOption = {},
) {
    const importSources: ImportSource[] = [
        {
            imported: 'FTable',
            type: ImportType.ImportSpecifier,
            source: '@fesjs/fes-design',
        },
        {
            imported: 'FTableColumn',
            type: ImportType.ImportSpecifier,
            source: '@fesjs/fes-design',
        },
    ];

    const result: string[] = ['dataSource'];
    if (apiSchema.pagination) {
        result.push('pagination', 'changePage', 'changePageSize');
    }
    if (options.hasRefresh) {
        result.push('refresh');
    }

    const functionName = apiSchema.pagination ? 'useTable' : 'useSimpleTable';
    const dataField = getDataField(apiSchema);
    const pageField = getPageField(apiSchema);

    if (apiSchema.pagination) {
        importSources.push({
            imported: 'FPagination',
            type: ImportType.ImportSpecifier,
            source: '@fesjs/fes-design',
        });
    }

    importSources.push({
        imported: functionName,
        type: ImportType.ImportSpecifier,
        source: ctx.getUseTableImp(),
    });

    const transformCode = genTransform(ctx, apiSchema);
    const formatCode = genFormatParams(ctx, apiSchema);

    return {
        importSources: [
            ...importSources,
            ...transformCode.importSources,
            ...formatCode.importSources,
        ],
        content: `
        const { ${result.join(', ')} } = ${functionName}({
            api: '${apiSchema.url}',
            ${options.isInit === false ? 'isInit: false,' : ''}
            ${dataField ? `dataField: '${dataField}',` : ''}
            ${pageField ? `pageField: '${pageField}',` : ''}
            ${apiSchema.params.length ? `params: {...initSearchParams},` : ''}
            ${formatCode.content}
            ${transformCode.content}
        })
        `,
    };
}

function genPaginationComp() {
    const paginationComp: Component = {
        componentName: 'FPagination',
        props: {
            class: 'common-page-pagination',
            currentPage: {
                type: ExtensionType.JSExpression,
                value: 'pagination.currentPage',
            },
            totalCount: {
                type: ExtensionType.JSExpression,
                value: 'pagination.totalCount',
            },
            pageSize: {
                type: ExtensionType.JSExpression,
                value: 'pagination.pageSize',
            },
            showSizeChanger: true,
            showTotal: true,
        },
        events: {
            change: 'changePage',
            pageSizeChange: 'changePageSize',
        },
        directives: {
            'v-if': 'pagination.totalCount > 0',
        },
    };

    return paginationComp;
}

function genTableComponent(columns: Field[]) {
    const tableComp: Component = {
        componentName: 'FTable',
        props: {
            data: {
                type: ExtensionType.JSExpression,
                value: 'dataSource',
            },
        },
        children: [],
    };
    for (const item of columns) {
        if (item.checked) {
            tableComp.children.push({
                componentName: 'FTableColumn',
                props: {
                    prop: item.alias || item.name,
                    label: item.title,
                },
            });
        }
    }
    return tableComp;
}

export function genTableTemplate(apiSchema: APISchema) {
    const children: Component[] = [];
    children.push(genTableComponent(apiSchema.resData.fields));
    if (apiSchema.pagination) {
        children.push(genPaginationComp());
    }

    return children;
}

function genRefreshTableCode() {
    return {
        importSources: [
            {
                imported: 'watch',
                type: ImportType.ImportSpecifier,
                source: 'vue',
            },
            {
                imported: 'isEmpty',
                type: ImportType.ImportSpecifier,
                source: 'lodash-es',
            },
        ],
        content: `
        watch(() => props.${ROW_DATA_PROP_NAME}, () => {
            if (!isEmpty(props.${ROW_DATA_PROP_NAME})) {
                refresh(props.${ROW_DATA_PROP_NAME});
            }
        }, {
            immediate: true
        })
        `,
    };
}

export function genViewTableComponent(
    ctx: Context,
    apiSchema: APISchema,
    modalDir: string,
): SFCComponent {
    apiSchema.resData.fields = formatResData(apiSchema.resData.fields);

    return {
        componentName: 'SFCComponent',
        dir: modalDir,
        fileName: `${genFileNameByPath(apiSchema.url)}.vue`,
        children: genTableTemplate(apiSchema),
        setupCodes: [
            genTableSetupCode(ctx, apiSchema, {
                hasRefresh: true,
                isInit: false,
            }),
            genRefreshTableCode(),
        ],
        propsDefinition: [
            {
                name: ROW_DATA_PROP_NAME,
                propType: 'Object',
            },
        ],
    };
}
