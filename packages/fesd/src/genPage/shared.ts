// 跟具体库和平台无关的共享代码
import { isEmpty } from 'lodash';
import {
    SetupCode,
    Component,
    ImportType,
    ImportSource,
} from '@qlin/toycode-core';
import { Field, CodeSnippet, Option } from '../type';
import { Context } from '../context';

export function handleComponentOptions(
    options: Option[],
    componentName: string,
) {
    return options.map((option) => {
        return {
            componentName,
            props: {
                label: option.label,
                value: option.value,
            },
        };
    });
}

export function getDefaultValue(field: Field) {
    if (isEmpty(field.component.defaultValue)) {
        if (field.type === 'string') {
            return '""';
        }
        return 'null';
    }
    return field.component.defaultValue;
}

export function findComponent(components: Component[], id: string): Component {
    const result = components.find((component) => {
        return component.id === id;
    });
    if (result) return result;
    return findComponent(
        components.reduce((acc, cur) => {
            if (cur.children && cur.children.length) {
                return acc.concat(cur.children);
            }
            return acc;
        }, []),
        id,
    );
}

export function genLabelWidth(fields: Field[]): number {
    let charNum = 4;
    fields.forEach((field) => {
        if (field.title?.length > charNum) {
            charNum = field.title.length;
        }
    });
    const extraWidth = fields.find((field) => field.component.required) ? 8 : 0;
    return charNum * 16 + extraWidth;
}

export function mergeCodeSnippets(codeSnippets: CodeSnippet[]) {
    return codeSnippets.reduce(
        (acc, cur) => {
            acc.setupCodes.push(cur.setup);
            if (cur.component.parentId) {
                const targetComponent = findComponent(
                    acc.children,
                    cur.component.parentId,
                );
                targetComponent.children.push(cur.component);
            } else {
                acc.children.push(cur.component);
            }
            return acc;
        },
        {
            children: [],
            setupCodes: [],
        } as {
            children: Component[];
            setupCodes: SetupCode[];
        },
    );
}

function findSearchForm(components: Component[]): Component {
    for (const component of components) {
        if (component.componentName === 'FForm') {
            return component;
        }
    }
    return findSearchForm(
        components.reduce((acc, cur) => {
            if (cur.children) {
                acc = acc.concat(cur.children as Component[]);
            }
            return acc;
        }, [] as Component[]),
    );
}

export function insertActionInSearchForm(
    components: Component[],
    actionComponent: Component,
) {
    const searchForm = findSearchForm(components);
    const actionFormItem = searchForm.children[
        searchForm.children.length - 1
    ] as Component;
    if (!actionFormItem.props?.label) {
        actionFormItem.children.unshift(actionComponent);
    } else {
        searchForm.children.push({
            componentName: 'FFormItem',
            children: [actionComponent],
        });
    }
}

function findTable(components: Component[]): Component {
    for (const component of components) {
        if (component.componentName === 'FTable') {
            return component;
        }
    }
    return findTable(
        components.reduce((acc, cur) => {
            if (cur.children) {
                acc = acc.concat(cur.children as Component[]);
            }
            return acc;
        }, [] as Component[]),
    );
}

export function insertActionInTable(
    components: Component[],
    actionComponent: Component,
) {
    const tableComponent = findTable(components);
    const tableActionColumn = tableComponent.children.find((comp) => {
        return (comp as Component).props?.label === '操作';
    });
    if (tableActionColumn) {
        (tableActionColumn as Component).children.push(actionComponent);
    } else {
        tableComponent.children.push({
            componentName: 'FTableColumn',
            props: {
                align: 'center',
                label: '操作',
            },
            directives: {
                'v-slot': '{ row }',
            },
            children: [actionComponent],
        });
    }
}

export function genImportedMappingCode(ctx: Context, fields: Field[]) {
    const importSources: ImportSource[] = [];
    fields.forEach((item) => {
        if (item.mappingId) {
            importSources.push({
                imported: item.mappingId,
                type: ImportType.ImportSpecifier,
                source: ctx.getConstantsFilePathImp(),
            });
        }
    });

    return importSources;
}

export function formReqData(fields: Field[]) {
    return fields.filter((item) => item.checked);
}

export function formatResData(fields: Field[]) {
    return fields
        .map((item) => {
            if (item.mappingId) {
                return {
                    alias: `${item.name}Text`,
                    ...item,
                };
            }
            if (item.name.endsWith('Time')) {
                return {
                    alias: `${item.name}Text`,
                    ...item,
                };
            }

            return item;
        })
        .filter((item) => item.checked);
}
