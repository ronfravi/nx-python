import {
  pythonToInformalVersion,
  minimalPythonVersionFromRange,
} from './python-version';

describe('nx-python version ruff transform', () => {
  it('should have format py37, py38, py39, py310, py311, py312', async () => {
    expect(pythonToInformalVersion('3.7.0')).toBe('py37');
    expect(pythonToInformalVersion('3.7.3')).toBe('py37');
    expect(pythonToInformalVersion('3.9')).toBe('py39');
    expect(pythonToInformalVersion('3.9.0')).toBe('py39');
    expect(pythonToInformalVersion('3.9.4')).toBe('py39');
    expect(pythonToInformalVersion('3.10')).toBe('py310');
    expect(pythonToInformalVersion('3.10.0')).toBe('py310');
    expect(pythonToInformalVersion('3.11')).toBe('py311');
    expect(pythonToInformalVersion('3.12')).toBe('py312');
    expect(pythonToInformalVersion('3.12.0.1')).toBe('py312');
  });
  it('should return empty for null parameter or empty', () => {
    expect(pythonToInformalVersion(null)).toBe('');
    expect(pythonToInformalVersion('')).toBe('');
  });
});

describe('nx-python version ruff transform find minimal version from range', () => {
  it('should have py39 becahse >=3.9 is the minimal support', async () => {
    expect(minimalPythonVersionFromRange('>=3.9,<3.11')).toBe('3.9');
    expect(minimalPythonVersionFromRange('>3.9,<3.11.0')).toBe('3.9');
    expect(minimalPythonVersionFromRange('3.9,<3.11')).toBe('3.9');
    expect(minimalPythonVersionFromRange('3.9')).toBe('3.9');
  });
  it('should have py310 becahse >=3.10 is the minimal support', async () => {
    expect(minimalPythonVersionFromRange('>=3.10,<3.11')).toBe('3.10');
    expect(minimalPythonVersionFromRange('>3.10,<3.11.0')).toBe('3.10');
    expect(minimalPythonVersionFromRange('3.10,<3.11')).toBe('3.10');
    expect(minimalPythonVersionFromRange('3.10')).toBe('3.10');
  });
  it('should return empty when null or empy is passed as parameter', async () => {
    expect(minimalPythonVersionFromRange('')).toBe(null);
  });
});
