import { HttpError } from "./HttpError";

export const findOneInDB = async ({
    model,
    query,
    ifNotFoundThrowError = true,
    raw = true,
}: {
    model: any;
    query: any;
    ifNotFoundThrowError?: boolean;
    raw?: boolean;
}) => {
    const doc = await model.findOne({ ...query, raw });
    if (ifNotFoundThrowError && !doc) {
        throw new HttpError(`${model.tableName} not found`, 404);
    }
    return doc;
};
