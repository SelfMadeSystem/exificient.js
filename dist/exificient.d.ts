/*! exificient.js v0.0.7-SNAPSHOT | (c) 2018 Siemens AG | The MIT License (MIT) */
export declare const MAX_EXI_FLOAT_DIGITS = 6;
/*******************************************************************************
 *
 * S H A R E D - P A R T
 *
 ******************************************************************************/
declare enum EventType {
    startDocument = 0,
    endDocument = 1,
    startElement = 2,
    startElementNS = 3,
    startElementGeneric = 4,
    endElement = 5,
    endElementGeneric = 6,
    characters = 7,
    charactersGeneric = 8,
    attribute = 9,
    attributeGeneric = 10
}
declare enum GrammarType {
    document = 0,
    fragment = 1,
    docContent = 2,
    docEnd = 3,
    fragmentContent = 4,
    firstStartTagContent = 5,
    startTagContent = 6,
    elementContent = 7,
    builtInStartTagContent = 8,
    builtInElementContent = 9
}
declare enum DatetimeType {
    /** gYear represents a gregorian calendar year */
    gYear = 0,
    /**
     * gYearMonth represents a specific gregorian month in a specific gregorian
     * year
     */
    gYearMonth = 1,
    /**
     * A date is an object with year, month, and day properties just like those
     * of dateTime objects, plus an optional timezone-valued timezone property
     */
    date = 2,
    /**
     * dateTime values may be viewed as objects with integer-valued year, month,
     * day, hour and minute properties, a decimal-valued second property, and a
     * boolean timezoned property.
     */
    dateTime = 3,
    /** gMonth is a gregorian month that recurs every year */
    gMonth = 4,
    /**
     * gMonthDay is a gregorian date that recurs, specifically a day of the year
     * such as the third of May
     */
    gMonthDay = 5,
    /**
     * gDay is a gregorian day that recurs, specifically a day of the month such
     * as the 5th of the month
     */
    gDay = 6,
    /** time represents an instant of time that recurs every day */
    time = 7
}
export declare enum SimpleDatatypeType {
    STRING = 0,
    FLOAT = 1,
    UNSIGNED_INTEGER = 2,
    INTEGER = 3,
    BOOLEAN = 4,
    DATETIME = 5,
    LIST = 6,
    ENUMERATION = 7
}
declare class StringTableEntry {
    namespaceID: number;
    localNameID: number;
    value: string;
    globalValueID: number;
    localValueID: number;
    constructor(namespaceID: number, localNameID: number, value: string, globalValueID: number, localValueID: number);
}
declare class StringTable {
    strings: StringTableEntry[];
    constructor();
    getNumberOfGlobalStrings(): number;
    getNumberOfLocalStrings(namespaceID: number, localNameID: number): number;
    getLocalValue(namespaceID: number, localNameID: number, localValueID: number): StringTableEntry;
    getGlobalValue(globalValueID: number): StringTableEntry;
    addValue(namespaceID: number, localNameID: number, value: string): void;
    getStringTableEntry(value: string): StringTableEntry;
}
declare class QNameContext {
    uriID: number;
    localNameID: number;
    localName: string;
    globalElementGrammarID: number;
}
declare class NamespaceContext {
    uri: string;
    uriID: number;
    qnameContext: QNameContext[];
}
declare class QNames {
    namespaceContext: NamespaceContext[];
}
declare class Production {
    event: EventType;
    nextGrammarID: number;
    startElementNamespaceID: number;
    startElementLocalNameID: number;
    attributeDatatypeID: number;
    attributeNamespaceID: number;
    attributeLocalNameID: number;
    charactersDatatypeID: number;
    startElementGrammarID: number;
    constructor(event: EventType, nextGrammarID: number);
}
declare class Grammar {
    grammarID: number;
    type: GrammarType;
    production: Production[];
    elementContent: Grammar;
    constructor(grammarID: number, type: GrammarType, production: Production[]);
    isTypeCastable(): boolean;
    isNillable(): boolean;
}
declare class Grs {
    documentGrammarID: number;
    fragmentGrammarID: number;
    grammar: Grammar[];
}
declare class SimpleDatatype {
    simpleDatatypeID: number;
    type: SimpleDatatypeType;
    listType: SimpleDatatypeType;
    datetimeType: DatetimeType;
    enumValues: Array<string>;
    constructor(type: SimpleDatatypeType);
}
declare class Grammars {
    qnames: QNames;
    simpleDatatypes: SimpleDatatype[];
    grs: Grs;
    numberOfQNames: number[];
    isSchemaLess: boolean;
    static fromJson(json: any): Grammars;
}
declare abstract class AbtractEXICoder {
    grammars: Grammars;
    isStrict: boolean;
    isByteAligned: boolean;
    stringTable: StringTable;
    sharedStrings: string[];
    runtimeGlobalElements: any;
    runtimeGrammars: Grammar[];
    static DEFAULT_SIMPLE_DATATYPE: SimpleDatatype;
    constructor(grammars: Grammars, options: any);
    getGrammar(grammarID: number): Grammar;
    getNumberOfQNames(grammars: Grammars): number;
    setSharedStrings(sharedStrings: string[]): void;
    init(): void;
    getUri(namespace: string): NamespaceContext;
    protected getCodeLength(characteristics: number): number;
    getCodeLengthForGrammar(grammar: Grammar): number;
    get2ndCodeLengthForGrammar(grammar: Grammar): 1 | 2;
    get2ndEventCode(grammar: Grammar, event: EventType): number;
    get2ndEvent(grammar: Grammar, ec2: number): EventType;
    getQNameContext(namespaceContext: NamespaceContext, localName: string): QNameContext;
    getGlobalStartElement(qnameContext: QNameContext): Grammar;
    learnStartElement(grammar: Grammar, seGrammarID: number, seQname: QNameContext): void;
    learnAttribute(grammar: Grammar, atQname: QNameContext): void;
    learnCharacters(grammar: Grammar): void;
    learnEndElement(grammar: Grammar): void;
}
/*******************************************************************************
 *
 * D E C O D E R - P A R T
 *
 ******************************************************************************/
export declare class BitInputStream {
    readonly ERROR_EOF = -3;
    /** array buffer */
    uint8Array: Uint8Array;
    /** Current byte buffer */
    buffer: number;
    /** Remaining bit capacity in current byte buffer */
    capacity: number;
    /** byte array next position in array */
    pos: number;
    /** error flag */
    errn: number;
    constructor(arrayBuffer: Uint8Array);
    /**
     * If buffer is empty, read byte from underlying byte array
     */
    readBuffer(): void;
    /**
     * Decodes and returns an n-bit unsigned integer.
     */
    decodeNBitUnsignedInteger(nbits: number, byteAligned: boolean): number;
    /**
     * Decode an arbitrary precision non negative integer using a sequence of
     * octets. The most significant bit of the last octet is set to zero to
     * indicate sequence termination. Only seven bits per octet are used to
     * store the integer's value.
     */
    decodeUnsignedInteger(): number;
    /**
     * Decode an arbitrary precision integer using a sign bit followed by a
     * sequence of octets. The most significant bit of the last octet is set to
     * zero to indicate sequence termination. Only seven bits per octet are used
     * to store the integer's value.
     */
    decodeInteger(byteAligned: any): number;
    /**
     * Decode the characters of a string whose length (#code-points) has already
     * been read.
     *
     * @return The character sequence as a string.
     */
    decodeStringOnly(length: number): string;
    /**
     * Decode a string as a length-prefixed sequence of UCS codepoints, each of
     * which is encoded as an integer.
     *
     *  @return The character sequence as a string.
     */
    decodeString(): string;
}
export declare class EXIDecoder extends AbtractEXICoder {
    private bitStream;
    private eventHandler;
    constructor(grammars: Grammars, options: any);
    registerEventHandler(handler: EventHandler): void;
    decodeHeader(): number;
    decodeDatatypeValue(datatype: SimpleDatatype, namespaceID: number, localNameID: number, isCharactersEvent: boolean): void;
    decodeDatatypeValueString(namespaceID: number, localNameID: number, isCharactersEvent: boolean): void;
    decodeDatatypeValueUnsignedInteger(namespaceID: number, localNameID: number, isCharactersEvent: boolean): void;
    decodeDatatypeValueInteger(namespaceID: number, localNameID: number, isCharactersEvent: boolean): void;
    decodeDatatypeValueFloat(namespaceID: number, localNameID: number, isCharactersEvent: boolean): void;
    decodeDatatypeValueBoolean(namespaceID: number, localNameID: number, isCharactersEvent: boolean): void;
    decodeDatatypeValueEnumeration(enumValues: Array<string>, namespaceID: number, localNameID: number, isCharactersEvent: boolean): void;
    decodeDatatypeValueDateTime(datetimeType: DatetimeType, namespaceID: number, localNameID: number, isCharactersEvent: boolean): void;
    decodeElementContext(grammar: Grammar, elementNamespaceID: number, elementLocalNameID: number): void;
    decodeQName(): QNameContext;
    decodeUri(): NamespaceContext;
    decodeLocalName(namespaceContext: NamespaceContext): QNameContext;
    decode(uint8Array: Uint8Array): number;
}
declare abstract class EventHandler {
    abstract startDocument(): any;
    abstract endDocument(): any;
    abstract startElement(namespace: string, localName: string): any;
    abstract endElement(namespace: string, localName: string): any;
    abstract characters(chars: string): any;
    abstract attribute(namespace: string, localName: string, value: string): any;
}
/*******************************************************************************
 *
 * E N C O D E R - P A R T
 *
 ******************************************************************************/
export declare class BitOutputStream {
    /** array buffer */
    uint8Array: Uint8Array<ArrayBuffer>;
    /** Current byte buffer */
    buffer: number;
    /** Remaining bit capacity in current byte buffer */
    capacity: number;
    /** Fully-written bytes */
    len: number;
    /** error flag */
    errn: number;
    checkBuffer(): void;
    getUint8Array(): Uint8Array;
    getUint8ArrayLength(): number;
    /**
     * If there are some unwritten bits, pad them if necessary and write them
     * out.
     */
    align(): void;
    /**
     * Encode n-bit unsigned integer. The n least significant bits of parameter
     * b starting with the most significant, i.e. from left to right.
     */
    encodeNBitUnsignedInteger(b: number, n: number, byteAligned: boolean): void;
    /**
     * Returns the least number of 7 bit-blocks that is needed to represent the
     * int <param>n</param>. Returns 1 if <param>n</param> is 0.
     *
     * @param n
     *            integer value
     *
     */
    numberOf7BitBlocksToRepresent(n: number): number;
    shiftRight(n: number, bits: number): number;
    /**
     * Encode an arbitrary precision non negative integer using a sequence of
     * octets. The most significant bit of the last octet is set to zero to
     * indicate sequence termination. Only seven bits per octet are used to
     * store the integer's value.
     */
    encodeUnsignedInteger(n: number, byteAligned: boolean): void;
    /**
     * Encode an arbitrary precision integer using a sign bit followed by a
     * sequence of octets. The most significant bit of the last octet is set to
     * zero to indicate sequence termination. Only seven bits per octet are used
     * to store the integer's value.
     */
    encodeInteger(n: number, byteAligned: boolean): void;
    /**
     * Encode a string as a sequence of codepoints, each of which is encoded as
     * an unsigned integer.
     */
    encodeStringOnly(str: string, byteAligned: boolean): void;
}
declare class ElementContextEntry {
    namespaceID: number;
    localNameID: number;
    grammar: Grammar;
    constructor(namespaceID: number, localNameID: number, grammar: any);
}
declare class EXIFloat {
    exponent: number;
    mantissa: number;
}
declare class DateTimeValue {
    year: number;
    monthDay: number;
    error: number;
}
export declare class EXIEncoder extends AbtractEXICoder {
    bitStream: BitOutputStream;
    elementContext: ElementContextEntry[];
    constructor(grammars: Grammars, options: any);
    encodeXmlDocument(xmlDoc: XMLDocument): void;
    encodeHeader(): number;
    processXMLElement(el: Element): void;
    getUint8Array(): Uint8Array;
    getUint8ArrayLength(): number;
    startDocument(): void;
    endDocument(): void;
    startElement(namespace: string, localName: string): void;
    encodeQName(namespace: string, localName: string): QNameContext;
    encodeUri(namespace: string): NamespaceContext;
    encodeLocalName(namespaceContext: NamespaceContext, localName: string): QNameContext;
    endElement(): void;
    attribute(namespace: string, localName: string, value: string): void;
    characters(chars: string): void;
    decimalPlaces(num: number): number;
    isInteger(value: any): boolean;
    getEXIFloat(value: number): EXIFloat;
    parseYear(sb: string, dateTimeValue: DateTimeValue): number;
    checkCharacter(sb: string, pos: number, c: string, dateTimeValue: DateTimeValue): number;
    parseMonthDay(sb: string, pos: number, dateTimeValue: DateTimeValue): number;
    encodeDatatypeValue(value: string, datatype: SimpleDatatype, namespaceID: any, localNameID: any): void;
    encodeDatatypeValueString(value: string, namespaceID: number, localNameID: number): void;
    encodeDatatypeValueUnsignedInteger(value: string, namespaceID: number, localNameID: number): void;
    encodeDatatypeValueInteger(value: string, namespaceID: number, localNameID: number): void;
    encodeDatatypeValueFloat(value: string, namespaceID: number, localNameID: number): void;
    encodeDatatypeValueBoolean(value: string, namespaceID: number, localNameID: number): void;
    encodeDatatypeValueEnumeration(value: string, enumValues: Array<string>, namespaceID: number, localNameID: number): void;
    encodeDatatypeValueDateTime(value: string, datetimeType: DatetimeType, namespaceID: number, localNameID: number): void;
}
export declare class EXI4JSONDecoder extends EXIDecoder {
    constructor();
}
export declare class EXI4JSONEncoder extends EXIEncoder {
    constructor();
    encodeJsonText(textJSON: string): void;
    encodeJsonObject(jsonObj: Object): void;
    processJSONArray(jsonArray: Array<any>): void;
    processJSONObject(jsonObj: Object): void;
    static escapeKey(key: string): string;
    static escapeNCNamePlus(name: string): string;
    static isNCNameChar(c: number): boolean;
    static isLetter(c: number): boolean;
    static _isAsciiBaseChar(c: number): boolean;
    static _isNonAsciiBaseChar(c: number): boolean;
    static isIdeographic(c: number): boolean;
    static isCombiningChar(c: number): boolean;
    static isDigit(c: number): boolean;
    static _isAsciiDigit(c: number): boolean;
    static _isNonAsciiDigit(c: number): boolean;
    static isExtender(c: number): boolean;
    static _charInRange(c: number, start: number, end: number): boolean;
}
export declare class JSONEventHandler extends EventHandler {
    json: Object;
    jsonStack: Array<any>;
    chars: string;
    constructor();
    getJSON(): Object;
    startDocument(): void;
    endDocument(): void;
    startElement(namespace: string, localName: string): void;
    endElement(namespace: string, localName: string): void;
    unescapeKey: (key: any) => any;
    attribute(namespace: string, localName: string, value: string): void;
    characters(chars: string): void;
}
export declare class EXI4JSON {
    encoder: EXI4JSONEncoder;
    decoder: EXI4JSONDecoder;
    exify(jsonObj: Object): Uint8Array<ArrayBuffer>;
    parse(uint8Array: Uint8Array): Object;
}
export declare function exify(jsonObj: Object): Uint8Array;
export declare function parse(uint8Array: Uint8Array): Object;
export {};
