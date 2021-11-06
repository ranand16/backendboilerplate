import { Sequelize, Op as SQL_OP, QueryTypes } from "sequelize";
import Config from "config";

import { Functions, DBChangeLogTracker, logger } from "../library";

export { SQL_OP, QueryTypes }
/**
 * Module augmentation to add new property to support
 */
declare module "sequelize" {
    interface CreateOptions {
        authInfo?: any;
        hooks?:boolean;
    }

    interface UpdateOptions {
        authInfo?: any;
    }

    interface SaveOptions{
        authInfo?: any;
        hooks?:boolean;
    }
    interface BulkCreateOptions{
        authInfo?: any;
    }

    interface IncludeOptions{
        authInfo?: any;
    }

    interface UpsertOptions{
        authInfo?: any;
    }
}



export const database = new Sequelize(
    Config.get("DB.NAME"),
    Config.get("DB.USER"),
    Config.get("DB.PASS"),
    {
        host: Config.get("DB.HOST"),
        port: 3306,
        dialect: "mysql",
        dialectOptions: { connectTimeout:  15000  },
        // Note: Changelog,LoginHistory - For this table we have to disabled hooks
        hooks: {
            beforeCreate(model: any, options: any) {
                // console.log("Hook:BeforeCreate", model, model.created_by, model.timecreated, options.authInfo);

                if(!options.authInfo){
                    // console.log("Hook:BeforeCreate - authInfo not set", model);
                    logger.error(
                        `ERROR - Hook:BeforeCreate - authInfo not set:: ${model?._modelOptions?.tableName}.`
                    );
                }

                //Set current time
                if (!model.timecreated) model.timecreated = Functions.currentTimestamp();

                if(model?.created_by === false) model.created_by = 0;
                // else 
                if(!model.created_by) {
                    const loggedInUserId = options.authInfo?.user_id;
                    if (loggedInUserId) model.created_by = loggedInUserId;
                }
            },
            /* @todo not working in case of update.... PJ */
            beforeUpdate(model: any, options: any) {
                // console.log("Hook:beforeUpdate", model.lastupdated_by, model.lasttimeupdated, options.authInfo);
                
                if(!options.authInfo){
                    // console.log("Hook:beforeUpdate - authInfo not set", model);
                    logger.error(
                        `ERROR - Hook:beforeUpdate - authInfo not set:: ${model?._modelOptions?.tableName}.`
                    );
                }

                //Set current time
                model.lasttimeupdated = Functions.currentTimestamp();
                if(model?.lastupdated_by === false) model.lastupdated_by = 0;

                if(!model.lastupdated_by) {
                    const loggedInUserId = options.authInfo?.user_id;;
                    if (loggedInUserId) model.lastupdated_by = loggedInUserId;
                }
            },
            // call only in case of update, bulkcreate, destroy
            // https://sequelize.org/master/manual/hooks.html#available-hooks
            // beforeBulkCreate(model: any, options: any){
            //     console.log("Hook:beforeBulkCreate", model, options.authInfo);

            //     for (const m of model) {
            //       console.log("-----ppppp-----",m)
            //     }
            // },
            afterCreate(instance: any,options: any) {
                // console.log("Hook:afterCreate", instance.timecreated, options);
                if(!options.authInfo){
                    // console.log("Hook:afterCreate - authInfo not set", instance);
                    logger.error(
                        `ERROR - Hook:afterCreate - authInfo not set:: ${instance?._modelOptions?.instance}.`
                    );
                }

                // async op
                DBChangeLogTracker.handleRecord(
                    instance,
                    "CREATE",
                    options.authInfo
                );
            },
            afterUpdate(instance: any,options:any ) {
                // console.log("afterUpdate", instance,options);
                if(!options.authInfo){
                    // console.log("Hook:afterUpdate - authInfo not set", instance);
                    logger.error(
                        `ERROR - Hook:afterUpdate - authInfo not set:: ${instance?._modelOptions?.instance}.`
                    );
                }

                // async op
                DBChangeLogTracker.handleRecord(
                    instance,
                    "UPDATE",
                    options.authInfo
                );
            },
        },
    }
);
