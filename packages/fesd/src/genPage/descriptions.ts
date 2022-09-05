import { ImportType } from '@qlin/toycode-core';
import { Field, CodeSnippet } from '../type';
import { ROW_DATA_PROP_NAME } from '../constants';

function genSetupCode() {
    return {
        importSources: [
            {
                imported: 'FDescriptions',
                type: ImportType.ImportSpecifier,
                source: '@fesjs/fes-design',
            },
            {
                imported: 'FDescriptionsItem',
                type: ImportType.ImportSpecifier,
                source: '@fesjs/fes-design',
            },
        ],
        content: '',
    };
}

function genDescriptionsItem(fields: Field[]) {
    return fields
        .filter((field) => field.checked)
        .map((item) => {
            return {
                componentName: 'FDescriptionsItem',
                props: {
                    label: item.title,
                },
                children: [
                    `{{${ROW_DATA_PROP_NAME}.${item.alias || item.name}}}`,
                ],
            };
        });
}

export function genDescriptionsSnippet(
    fields: Field[],
    parentId: string,
): CodeSnippet {
    return {
        setup: genSetupCode(),
        component: {
            parentId,
            componentName: 'FDescriptions',
            props: {
                column: 1,
            },
            children: genDescriptionsItem(fields),
        },
    };
}
