import { Rule, RuleTypeEnum } from '../type';

export const rulesHandler: {
    [key in RuleTypeEnum]: (rule: Rule, type: string) => string;
} = {
    required(rule: Rule, type: string) {
        return `{ type: '${type}', required: true, message: '${
            rule.message || '不能为空'
        }' }`;
    },
    integer(rule: Rule) {
        return `{ type: 'integer', message: '${
            rule.message || '必须为整数'
        }' }`;
    },
    positiveInteger(rule: Rule, type: string) {
        return `
        {
            type: '${type}',
            validator(rule, value, callback) {
                const num = Number(value);
                const isInteger = (num | 0) === num;
                return isInteger && isInteger >= 0;
            },
            message: '${rule.message || '请输入正整数'}',
        }
        `;
    },
    numberRange(rule: Rule) {
        return `
        {
            type: 'number',
            validator(rule, value) {
                const num = Number(value);
                if (Number.isNaN(num)) {
                    return new Error('请输入数字');
                }
                ${
                    rule.max != null
                        ? `
                if (num > ${rule.max}) {
                    return new Error('输入数字需不大于${rule.max}')
                }\n`
                        : ''
                }
                ${
                    rule.min != null
                        ? `
                if (num < ${rule.min}) {
                    return new Error('输入数字需不小于${rule.min}')
                }\n`
                        : ''
                }
                return true;
            }
        }`;
    },
    strLength(rule: Rule, type: string) {
        return `
        {
            type: '${type}',
            validator(rule, value) {
                const len = value.length;
                ${
                    rule.max != null
                        ? `
                if (num > ${rule.max}) {
                    return new Error('字符长度不大于${rule.max}')
                }\n`
                        : ''
                }
                ${
                    rule.min != null
                        ? `
                if (num < ${rule.min}) {
                    return new Error('字符长度不小于${rule.min}')
                }\n`
                        : ''
                }
                return true;
            }
        }
        `;
    },
    email(rule: Rule) {
        return `{ type: 'email', message: '${
            rule.message || '请输入正确的email地址'
        }' }`;
    },
    regexp(rule: Rule, type: string) {
        const regParts = rule.pattern.match(/^\/(.*?)\/([gim]*)$/);
        return `
        {
            type: '${type}',
            validator(rule, value, callback) {
                ${
                    regParts
                        ? `
                const reg = new RegExp(${regParts[1]}, ${regParts[2]});
                `
                        : `
                const reg = new RegExp(${rule.pattern});
                `
                }
                return reg.test(value) ? true : (new Error('${
                    rule.message || '格式不正确'
                }'));
            }
        }`;
    },
    custom(rule: Rule, type: string) {
        return `
        {
            type: '${type}',
            validator: ${rule.$$__code_function}
        }`;
    },
};
