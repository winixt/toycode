import chalk from 'chalk';

const colors = [
    'red',
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan',
    'gray',
    'redBright',
    'greenBright',
    'yellowBright',
    'blueBright',
    'magentaBright',
    'cyanBright',
];

let index = 0;
const cache = {};

export default (pkg) => {
    if (!cache[pkg]) {
        const color = colors[index];
        const str = chalk[color].bold(pkg);
        cache[pkg] = str;
        if (index === colors.length - 1) {
            index = 0;
        } else {
            index += 1;
        }
    }
    return cache[pkg];
};
