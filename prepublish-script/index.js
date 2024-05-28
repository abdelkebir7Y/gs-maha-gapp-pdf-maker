import fs from "fs";
import path from "path";

import {
  generateHeader,
  generateFooter,
  generateSection,
  pagesFormatter,
  generateDocument,
} from "../src/script.js";

const style = fs.readFileSync(path.resolve("./src/style.css"), "utf8");

fs.writeFileSync(
  path.resolve("./index.js"),
  `

export default main =  ({
  header = [
    {
      title: "",
      docMetaData: [""],
    },
    {
      rightMetaTable: [["", ""]],
      leftMetaTable: [["", ""]],
    },
  ],
  body = [
    {
      title: "",
      table: {
        headers: [""],
        data: [[""]],
      },
    },
  ],
  footer = {
    qrCode: "",
    table: {
      title: "",
      headers: [""],
      data: [""],
    },
  },
}) => {


  return \`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>GS-MAHA-GAPP-PDF-MAKER</title> 
        <style>
          ${style}
        </style>
      </head>
      <body>
        <div id="container"></div>
      </body>
      <script>
        //script here
        const generateHeader = ${generateHeader
          .toString()
          .replaceAll("`", ' `+ "`" + `')}
        const generateFooter = ${generateFooter
          .toString()
          .replaceAll("`", ' `+ "`" + `')}
        const generateSection = ${generateSection
          .toString()
          .replaceAll("`", ' `+ "`" + `')}
        const pagesFormatter = ${pagesFormatter
          .toString()
          .replaceAll("`", ' `+ "`" + `')}
        const generateDocument = ${generateDocument
          .toString()
          .replaceAll("`", ' `+ "`" + `')}

        generateDocument({
          header: \${JSON.stringify(header)},
          body: \${JSON.stringify(body)},
          footer: \${JSON.stringify(footer)},
        });
      </script>
    </html>
  \`;
};
`
);
