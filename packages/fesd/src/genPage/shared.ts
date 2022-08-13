// 跟具体库和平台无关的共享代码
import { isEmpty } from 'lodash';
import { SetupCode, Component } from '@qlin/toycode-core';
import { Field, CodeSnippet } from '../type';

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
