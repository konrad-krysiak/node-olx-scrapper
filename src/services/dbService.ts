// Remember to set type: module in package.json or use .mjs extension
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dbEntity } from '../types/dbEntity.ts'

import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'


class DatabaseService {
    private __dirname = dirname(fileURLToPath(import.meta.url));
    private _file = join(this.__dirname, '../db/db.json');
    private _adapter = new JSONFile<dbEntity[]>(this._file);
    private _defaultData: dbEntity[] = [];
    private _dbInstance = new Low<dbEntity[]>(this._adapter, this._defaultData)

    async read() {
        await this._dbInstance.read();
        return this._dbInstance.data;
    }

    async write(entity: dbEntity) {
        await this._dbInstance.read();
        this._dbInstance.data.push(entity);
        await this._dbInstance.write();
    }

    async batchWrite(entities: dbEntity[]) {
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