import { randomBytes, createCipheriv } from "crypto";
import Config from "config";

export default {
    /**
     * enable/disable debug
     * @param enable
     */
    enableDebug: function (enable: string) {
        if (enable == "false") console.log = function () {};
    },

    /**
     * return current timestamp
     */
    currentTimestamp(): any {
        return Math.round(new Date().getTime() / 1000);
    },

    getTwoDigitsValue(value: number) {
        return ("0" + value).slice(-2);
    },

    convertUnixTimeToDate(unixTime: number) {
        return new Date(unixTime * 1000);
    },

    encryptString(data: string) {
        const iv = randomBytes(16);
        const cipher = createCipheriv(Config.get("CRYPTO.ALGORITHM"), Config.get("CRYPTO.SECRET_KEY"), iv);
        const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
        return iv.toString('hex') + '.' + encrypted.toString('hex');
    }
};
