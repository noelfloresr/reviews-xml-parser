# XML Review Transformer

This Node.js project reads and transforms an XML file with product review data to a different XML format compatible with Google Merchant standards.

## Project Structure

- **transformXML.js**: Main script to parse, transform, and save the XML data.
- **input.xml**: Example input XML file with the original review format.
- **output.xml**: Transformed XML file in the desired Google Merchant-compatible format.

## Requirements

- Node.js (>= 12.x)
- [xml2js](https://www.npmjs.com/package/xml2js) library for parsing and building XML.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/xml-review-transformer.git
   ```

2. Install the dependencies:

   ```bash
   npm install xml2js
   ```

## Usage

Place the XML file you want to transform in the root directory as `input.xml` (or update the path in `transformXML.js` to point to your file).

Run the script:

```bash
node transformXML.js
```
