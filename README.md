# exificient.js

JavaScript Implementation of [EXI](https://www.w3.org/TR/exi/) and [EXI for JSON](https://www.w3.org/TR/exi-for-json/)

Ever so slightly modified version of [EXIficient/exificient.js](
https://github.com/EXIficient/exificient.js) because the original repository
hasn't been updated in a while and there are no type definitions available
despite the fact that the code is written in TypeScript.

## How to get

### NPM

<https://www.npmjs.com/package/@selfmadesystem/exificient.js>

```sh
npm install @selfmadesystem/exificient.js
```

### unpkg, CDN (content delivery network)

```sh
https://unpkg.com/@selfmadesystem/exificient.js@0.0.6/dist/exificient.js
```

## Demo

An online demonstration can be found here: <http://exificient.github.io/javascript/demo/>.

## How to use

### HowTo for EXIforJSON

```javascript
// encode JSON object
var uint8Array = EXI4JSON.exify(jsonObjIn);

// decode EXIforJSON
var jsonObjOut = EXI4JSON.parse(uint8Array);
```

### HowTo for EXI

```javascript
// Note: the necessary grammars can be generated from XML schema using
// the project https://github.com/EXIficient/exificient-grammars
// class com.siemens.ct.exi.grammars.persistency.Grammars2JSON 

// encode XML
var exiEncoder = new EXIEncoder(grammars);
exiEncoder.encodeXmlText(textXML);
var uint8ArrayLength = exiEncoder.getUint8ArrayLength();
var uint8Array = exiEncoder.getUint8Array();

// decode EXI to XML again
var exiDecoder = new EXIDecoder(grammars);
var xmlHandler = new XMLEventHandler(); // register XML handler
exiDecoder.registerEventHandler(xmlHandler);
exiDecoder.decode(arrayBuffer); // EXI input data
xmlHandler.getXML(); // get XML
```
