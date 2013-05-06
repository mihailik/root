module FileSystems {
    
    export interface FileSystem {
        files(callback: (files: string[]) => void): void;
        read(filename: string, callback: (text: string) => void): void;
        write(filename: string, tex: string): void;
        listen(onchange: ChangeCallback): Unsubscribe;
    }

    export interface ChangeCallback {
        (changes: string[]): void;
    }

    export interface Unsubscribe {
        (): void;
    }

    export class TemporaryFileSystem implements FileSystem {
        private _callbacks: ChangeCallback[] = [];
        
        constructor(private _files: any) {
        }
        
        files(callback: (files: string[]) => void): void {
            var result = [];
            for (var fname in this._files) if (this._files.hasOwnProperty(fname)) {
                result.push(fname);
            }
            if (typeof callback === 'function')
                callback(result);
        }
        
        read(filename: string, callback: (text: string) => void): void {
            if (!(filename in this._files))
                return;
            
            var text = this._files[filename];
            if (typeof text !== 'string')
                text = text + '';
                
            if (typeof callback === 'function')
                callback(text);
        }
        
        write(filename: string, text: string): void {
            var coercedFilename = filename;
            if (coercedFilename !== 'string')
                coercedFilename = filename;
            
            var coercedText = text;
            if (typeof coercedText !== 'string')
                coercedText = text + '';

            this._files[coercedFilename] = coercedText;
            
            var changes = [coercedFilename];
            for (var i = 0; i < this._callbacks.length; i++) {
                var callback = this._callbacks[i];
                if (typeof callback === 'function')
                    callback(changes);
            }
        }
        
        listen(onchange: ChangeCallback): Unsubscribe {
            this._callbacks.push(onchange);
            
            return () => {
                for (var i = 0; i < this._callbacks.length; i++) {
                    if (this._callbacks[i] === onchange) {
                        delete this._callbacks[i];
                        break;
                    }
                }
            };
        }
    }
}