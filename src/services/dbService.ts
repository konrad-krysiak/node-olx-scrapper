// Remember to set type: module in package.json or use .mjs extension
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { olxDbEntity } from '../types/olxDbEntity.ts'

import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'

/**
 * Since current version only supports olx scrapping we are leaving
 * olxDbEntity as-is for now without making this service generic.
 */

class DatabaseService {
    private __dirname = dirname(fileURLToPath(import.meta.url));
    private _file = join(this.__dirname, '../db/db.json');
    private _adapter = new JSONFile<olxDbEntity[]>(this._file);
    private _defaultData: olxDbEntity[] = [];
    private _dbInstance = new Low<olxDbEntity[]>(this._adapter, this._defaultData)

    async read() {
        await this._dbInstance.read();
        return this._dbInstance.data;
    }

    async write(entity: olxDbEntity) {
        await this._dbInstance.read();
        this._dbInstance.data.push(entity);
        await this._dbInstance.write();
    }

    async batchWrite(entities: olxDbEntity[]) {
        if(!entities.length) {
            return;
        }
        await this._dbInstance.read();
        entities.forEach((obj) => {
            this._dbInstance.data.push(obj);
        })
        await this._dbInstance.write();
    }
}

export default DatabaseService;