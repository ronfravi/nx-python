import chalk from 'chalk';
import {spawnSyncMock} from '../../utils/mocks/cross-spawn.mock';
import * as poetryUtils from '../utils/poetry';
import fsMock from 'mock-fs';
import executor from './executor';
import {tmpdir} from 'os';
import {join} from 'path';
import {v4 as uuid} from 'uuid';
import {mkdirsSync, writeFileSync} from 'fs-extra';
import {RuffExecutorSchema} from "./schema";

describe('Ruff Executor', () => {
    let tmppath = null;
    let checkPoetryExecutableMock: jest.SpyInstance;
    let activateVenvMock: jest.SpyInstance;

    beforeEach(() => {
        tmppath = join(tmpdir(), 'nx-python', 'Ruff', uuid());
        checkPoetryExecutableMock = jest
            .spyOn(poetryUtils, 'checkPoetryExecutable')
            .mockResolvedValue(undefined);

        activateVenvMock = jest
            .spyOn(poetryUtils, 'activateVenv')
            .mockReturnValue(undefined);

        spawnSyncMock.mockReturnValue({status: 0});
    });

    beforeAll(() => {
        console.log(chalk`init chalk`);
    });

    afterEach(() => {
        fsMock.restore();
        jest.resetAllMocks();
    });

    it('should return success false when the poetry is not installed', async () => {
        checkPoetryExecutableMock.mockRejectedValue(new Error('poetry not found'));

        const options: RuffExecutorSchema = {
            outputFile: '',
            silent: false,
            fix: true,
        };

        const context = {
            cwd: '',
            root: '.',
            isVerbose: false,
            projectName: 'app',
            workspace: {
                npmScope: 'nxlv',
                version: 2,
                projects: {
                    app: {
                        root: 'apps/app',
                        targets: {},
                    },
                },
            },
        };

        const output = await executor(options, context);
        expect(checkPoetryExecutableMock).toHaveBeenCalled();
        expect(activateVenvMock).toHaveBeenCalledWith('.');
        expect(spawnSyncMock).not.toHaveBeenCalled();
        expect(output.success).toBe(false);
    });

    it('should execute Ruff linting', async () => {
        const outputFile = join(tmppath, 'reports/apps/app/pylint.txt');
        spawnSyncMock.mockImplementation(() => {
            writeFileSync(outputFile, '', {encoding: 'utf8'});
        });

        const output = await executor(
            {
                outputFile,
                silent: false,
                fix: true,
            },
            {
                cwd: '',
                root: '.',
                isVerbose: false,
                projectName: 'app',
                workspace: {
                    version: 2,
                    npmScope: 'nxlv',
                    projects: {
                        app: {
                            root: 'apps/app',
                            targets: {},
                        },
                    },
                },
            }
        );
        expect(checkPoetryExecutableMock).toHaveBeenCalled();
        expect(activateVenvMock).toHaveBeenCalledWith('.');
        expect(spawnSyncMock).toHaveBeenCalledTimes(1);
        expect(output.success).toBe(true);
    });

    it('should execute Ruff linting when the reports folder already exists', async () => {
        mkdirsSync(join(tmppath, 'reports/apps/app'));
        const outputFile = join(tmppath, 'reports/apps/app/pylint.txt');
        spawnSyncMock.mockImplementation(() => {
            writeFileSync(outputFile, '', {encoding: 'utf8'});
        });

        const output = await executor(
            {
                outputFile,
                silent: false,
                fix: true,
            },
            {
                cwd: '',
                root: '.',
                isVerbose: false,
                projectName: 'app',
                workspace: {
                    version: 2,
                    npmScope: 'nxlv',
                    projects: {
                        app: {
                            root: 'apps/app',
                            targets: {},
                        },
                    },
                },
            }
        );
        expect(checkPoetryExecutableMock).toHaveBeenCalled();
        expect(activateVenvMock).toHaveBeenCalledWith('.');
        expect(spawnSyncMock).toHaveBeenCalledTimes(1);
        expect(output.success).toBe(true);
    });

    it('should returns a error when run the Ruff CLI', async () => {
        spawnSyncMock.mockImplementation(() => {
            throw new Error('Some error');
        });

        const output = await executor(
            {
                outputFile: join(tmppath, 'reports/apps/app/pylint.txt'),
                silent: false,
                fix: true,
                config: "unknown.toml"
            },
            {
                cwd: '',
                root: '.',
                isVerbose: false,
                projectName: 'app',
                workspace: {
                    version: 2,
                    npmScope: 'nxlv',
                    projects: {
                        app: {
                            root: 'apps/app',
                            targets: {},
                        },
                    },
                },
            }
        );
        expect(checkPoetryExecutableMock).toHaveBeenCalled();
        expect(activateVenvMock).toHaveBeenCalledWith('.');
        expect(spawnSyncMock).toHaveBeenCalledTimes(1);
        expect(output.success).toBe(false);
    });

    it('should execute Ruff linting with ruff content more than 1 line', async () => {
        mkdirsSync(join(tmppath, 'reports/apps/app'));
        const outputFile = join(tmppath, 'reports/apps/app/pylint.txt');
        writeFileSync(outputFile, '', {encoding: 'utf8'});

        spawnSyncMock.mockImplementation(() => {
            writeFileSync(outputFile, 'test\n', {encoding: 'utf8'});
        });

        const output = await executor(
            {
                outputFile,
                silent: false,
                fix: false,
            },
            {
                cwd: '',
                root: '.',
                isVerbose: false,
                projectName: 'app',
                workspace: {
                    version: 2,
                    npmScope: 'nxlv',
                    projects: {
                        app: {
                            root: 'apps/app',
                            targets: {},
                        },
                    },
                },
            }
        );
        expect(checkPoetryExecutableMock).toHaveBeenCalled();
        expect(activateVenvMock).toHaveBeenCalledWith('.');
        expect(spawnSyncMock).toHaveBeenCalledTimes(1);
        expect(output.success).toBe(false);
    });
});
