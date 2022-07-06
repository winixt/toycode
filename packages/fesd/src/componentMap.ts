const COMPONENT_MAP = {
    input: {
        name: 'Input',
        props: {},
    },
    select: {
        name: 'FSelect',
        subName: 'FOption',
        props: {},
    },
    textarea: {
        name: 'FInput',
        props: {
            type: 'textarea',
        },
    },
    inputNumber: {
        name: 'FInputNumber',
        props: {},
    },
    checkbox: {
        name: 'FCheckboxGroup',
        subName: 'FCheckbox',
        props: {},
    },
    radio: {
        name: 'FRadioGroup',
        subName: 'FRadio',
        props: {},
    },
    datePicker: {
        name: 'FDatePicker',
        props: {},
    },
    timePicker: {
        name: 'FTimePicker',
        props: {},
    },
} as const;

export function componentMap(component: string) {
    return COMPONENT_MAP[component as keyof typeof COMPONENT_MAP];
}
