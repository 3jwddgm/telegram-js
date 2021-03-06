/**
 * Main Telegram class
 * An instance of Telegram can be used to instantiate new clients that
 * will perform the API calls
 * @class Telegram
 */
class Telegram {
    /**
     * @param {MTProto} MTProto An object with the MTProto implementation
     * @param {TL} TL An object with the Telegram's TypeLanguage implementation
     */
    constructor(MTProto, TL) {
        if (!MTProto || !TL) {
            throw new Error('You must invoke new Telegram(MTProto, TypeLanguage)');
        }

        this.MTProto = MTProto;
        this.TL = TL;
    }

    /**
     * Imports a schema structure into the library. The default Telegram API schema
     * can be downloaded here: https://core.telegram.org/schema
     *
     * The prefixes are added in front of all types and methods declared on schema,
     * so after loading the schema you will access them like this:
     *
     * @example
     *     // let's assume that your schema has a "foo.TypeFoo" type and a
     *     // "foo.callFoo" method
     *     Telegram.useSchema(schema, 'types', 'methods');
     *
     *     let types = Telegram.schema.type;
     *     let methods = Telegram.schema.service;
     *
     *     let TypeFoo = types.foo.TypeFoo;
     *     let callFoo = methods.foo.callFoo;
     *
     *
     * @param {Object} schema An object with all the types and methods.
     * @param {String} typePrefix       A prefix to all the schema types
     * @param {String} servicePrefix    A prefix to all the schema methods
     */
    useSchema(schema, typePrefix = 'Telegram.type', servicePrefix = 'Telegram.service') {
        let buildTypes = this.TL.TypeBuilder.buildTypes;

        var type = {_id: typePrefix};
        buildTypes(schema.constructors, null, type, false);

        var service = { _id: servicePrefix};
        buildTypes(schema.methods, null, service, true);

        /**
         * @property {Object} schema
         */
        this.schema = { type, service };
    }

    /**
     * Create a new client to interact with the API
     * @return {TelegramClient} An instance of Telegram.Client
     */
    createClient() {
        return new TelegramClient(this.schema, this.MTProto, this.TL);
    }

    /**
     * @param {Object} key The key config to add on MtProto layer
     * @example
     *   Telegram.addPublicKey({
     *     fingerprint: '0x123123...',
     *     modulus: '...',
     *     exponent: '010001'
     *   })
     */
    addPublicKey(key) {
        let { fingerprint, modulus, exponent } = key;

        this.MTProto.security.PublicKey.addKey({
            fingerprint,
            modulus,
            exponent
        });
    }

    /**
     * Create a new {@link AuthKey} instance from a key id and a key payload.
     * These two parameters are returned from a Telegram server during the key
     * exchange.
     * @param {String} authKeyId
     * @param {String} authKeyBody
     * @return {AuthKey}
     */
    createAuthKey(authKeyId, authKeyBody) {
        let AuthKey = this.MTProto.auth.AuthKey;
        return new AuthKey(authKeyId, authKeyBody);
    }

    /**
     * Decrypt an AuthKey buffer. This buffer is usually generated from an authKey
     *
     * @example
     * var keyBuffer = authKey.encrypt('password');
     * var key = tg.decryptKey(keyBuffer, 'password');
     *
     * @param {Buffer} keyBuffer
     * @param {String} keyPassword
     * @return {AuthKey}
     */
    decryptKey(keyBuffer, keyPassword) {
        return this.MTProto.auth.AuthKey.decryptAuthKey(keyBuffer, keyPassword);
    }

    /**
     * Utility method: converts a string to a Buffer object
     * @param {String} string
     * @param {Number} length
     * @return {Buffer}
     */
    string2Buffer(string, length) {
        return this.MTProto.utility.string2Buffer(string, length);
    }

    /**
     * Utility method: converts a buffer into a string in hexadecimal format
     * @param {String} buffer
     * @param {Number} length
     * @return {String}
     */
    buffer2String(buffer, length) {
        return this.MTProto.utility.buffer2String(buffer, length);
    }

    /**
     * Creates a random string of chars.
     * You can use it to generate an AuthKey encryption password
     * @param {Number} [size=128]
     */
    createRandomPassword(size = 128) {
        let util = this.MTProto.utility;
        let buffer = util.createRandomBuffer(size);

        return util.buffer2String(buffer);
    }
}

export { Telegram };

/**
 * @external {AuthKey} https://github.com/enricostara/telegram-mt-node/blob/master/lib/auth/auth-key.js
 */

/**
 * @external {Buffer} https://nodejs.org/api/buffer.html
 */