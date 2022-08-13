// 跟具体库和平台无关的共享代码
import { isEmpty } from 'lodash';
import { SetupCode, Component } from '@qlin/toycode-core';
import { Field, CodeSnippet, Option } from '../type';

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
    return charNum * 16;
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
