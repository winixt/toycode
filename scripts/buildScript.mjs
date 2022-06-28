import { execa } from 'execa';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fse from 'fs-extra';
import parser from 'yargs-parser';
import randomColor from './randomColor.mjs';

const { removeSync } = fse;

const argvs = parser(process.argv.slice(2));

const pkgs = ['core', 'fesd'];

const rootDir = process.cwd();
const __dirname = dirname(fileURLToPath(import.meta.url));

const bin = (name) => resolve(__dirname, `../node_modules/.bin/${name}`);

function clearBuildDir() {
    pkgs.forEach((pkg) => {
        removeSync(join(rootDir, `packages/${pkg}/lib`));
        removeSync(join(rootDir, `packages/${pkg}/es`));
    });
}

async function main() {
    clearBuildDir();
    for (const pkg of pkgs) {
        await execa(
            bin('tsc'),
            [
                '--project',
                [`packages/${pkg}`],
                '--outDir',
                [`packages/${pkg}/lib`],
            ],
            {
                stdio: 'inherit',
            },
        );
    }

    if (argvs.watch) {
        for (const pkg of pkgs) {
            execa(bin('tsc'), [
                '--project',
                [`packages/${pkg}`],
                '--watch',
            ]).stdout.on('readable', function () {
                // 现在有一些数据要读取。
                let data;
                while ((data = this.read())) {
                    const str = data.toString('utf-8').split(' - ');
                    if (str[1]) {
                        console.log(`${randomColor(pkg)}: ${str[1]}`);
                    }
                }
            });
        }
    }
}

main();
