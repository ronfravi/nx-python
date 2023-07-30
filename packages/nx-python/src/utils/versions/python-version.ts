export function pythonToInformalVersion(pythonVersion: string): string {
    if (!pythonVersion) {
        return ""
    }
    const [major, minor, patch] = pythonVersion.split('.').map(Number);
    const customFormat = `py${major}${minor}`;
    return customFormat;
}

export function minimalPythonVersionFromRange(pythonVersion: string): string {
    const cleanedVersion = pythonVersion.replace(' ', '').replace(/[>=<]/g, '');
    const supported = cleanedVersion.split(",")
    const version = supported.find((item) => item !== null) || null;
    return version
}
