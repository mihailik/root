/// <reference path='codemirror.d.ts' />

declare module CM {
    interface Static {
        showHint(
            cm: CM.Editor,
            getHint: (cm?: CM.Editor, options?) => {
                list: {
                    className?: string;
                    displayText?: string;
                    text?: string;
                    render?: (elt: HTMLElement, data: any, completion: any) => void;
                }[];
            },
            options?: {
                closeCharacters?: string;
                async?: boolean;
                completeSingle?: boolean;
                customKeys?: any;
            });
    }
}