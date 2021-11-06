import Config from "config";

import { HttpError } from "./HttpError";

const passwordConfig = Object.freeze({
    minLength: Config.get("PASSWORD.MIN_LENGTH") || 8,
    atleaseOneLowercaseChar:
        Config.get("PASSWORD.ATLEAST_ONE_LOWERCASE_CHAR") || true,
    atleaseOneUppercaseChar:
        Config.get("PASSWORD.ATLEAST_ONE_UPPERCASE_CHAR") || true,
    atleaseOneDigit: Config.get("PASSWORD.ATLEAST_ONE_NUMBER") || true,
    atleaseOneSpecialChar:
        Config.get("PASSWORD.ATLEAST_ONE_SPECIAL_CHAR") || true,
});

export const verifyPasswordStrength = (password: string = "") => {
    if (
        passwordConfig.minLength &&
        password.length < passwordConfig.minLength
    ) {
        throw new HttpError(
            `Your password must be at least ${passwordConfig.minLength} characters`
        );
    }

    if (
        passwordConfig.atleaseOneLowercaseChar &&
        password.search(/[a-z]/i) < 0
    ) {
        throw new HttpError(
            "Your password must contain at least one lowercase character."
        );
    }

    if (passwordConfig.atleaseOneDigit && password.search(/[0-9]/) < 0) {
        throw new HttpError("Your password must contain at least one digit.");
    }
};
