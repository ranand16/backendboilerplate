import Config from "config";

import logger from "./utils/Logger";
import { AuthInfoI } from "./utils/Auth";
import { Changelog } from "../models";

type OPS_TYPE = "CREATE" | "UPDATE";

class DBChangeLogTrackerClass {
    private tables: string[] = Config.get("DBCHANGELOG_TABLES");
    private excludedCols: string[] = Config.get("DBCHANGELOG_EXCLUDED_TABLES");

    async handleRecord(
        instance: any,
        opsType: OPS_TYPE,
        authInfo: AuthInfoI
    ) {
        try {
            const tableName = instance?.constructor?.getTableName?.();
            let changedCols: string[] = instance.changed() || [];

            changedCols = changedCols.filter(
                (el: string) => !this.excludedCols.includes(el)
            );

            if (!this.tables.includes(tableName) || !changedCols.length)
                return false;

            console.info(`DBChangeLog tableName::${tableName}`);

            await this.handleDBInsert(
                tableName,
                opsType,
                authInfo,
                instance,
                changedCols
            );
        } catch (error) {
            logger.error(
                `ERROR::DBChangeLog::handleRecord:: ${JSON.stringify(error)}`
            );
        }
    }

    private async handleDBInsert(
        tableName: string,
        opsType: OPS_TYPE,
        authInfo: AuthInfoI,
        instance: any,
        changedCols: string[]
    ) {
        const rows: any[] = [];
        try {
            const transitionType = opsType;
            const transitionBy = authInfo.user_id || 0;
            const transitionByEmail = authInfo.email || "";
            const ipaddress = authInfo._ipAddress || "";
            const useragent = authInfo._userAgent || "";

            const tableId = instance.id || 0;
            const jsonData = instance.toJSON();

            for (let i = 0; i < changedCols.length; i++) {
                const fieldName = changedCols[i];
                const newValue = jsonData[fieldName] || "";

                let oldValue = "";
                if (opsType == "UPDATE") {
                    oldValue = instance.previous(fieldName) || "";
                }

                const row = {
                    transitionType,
                    transitionBy,
                    transitionByEmail,
                    tableId,
                    tableName,
                    fieldName,
                    oldValue,
                    newValue,
                    ipaddress,
                    useragent,
                };
                rows.push(row);
            }
            if (rows.length) await this.dbInsert(rows);
        } catch (error) {
            logger.error(
                `ERROR::DBChangeLog::handleCreate:: ${JSON.stringify(error)}::Rows Data ${JSON.stringify(rows)}`
            );
        }
    }

    private async dbInsert(rows: any[]) {
        return Changelog.bulkCreate(rows, {hooks:false, validate: true, individualHooks: false });
    }
}

export const DBChangeLogTracker = new DBChangeLogTrackerClass();
