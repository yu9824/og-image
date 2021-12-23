export type FileType = 'png' | 'jpeg';
export type Pattern = 'none' | 'cross' | 'polka';

export interface ParsedRequest {
    fileType: FileType;
    text: string;
    pattern: Pattern;
    md: boolean;
    fontSize: string;
    width: string;
    textColor: string;
    textStrongColor: string;
    overlay?: string;
}
