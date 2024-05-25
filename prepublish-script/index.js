const fs = require("fs");
const path = require("path");

const script = fs.readFileSync(
  path.resolve(__dirname, "../src/script.js"),
  "utf8"
);

const html = fs.readFileSync(
  path.resolve(__dirname, "../src/index.html"),
  "utf8"
);
const style = fs.readFileSync(
  path.resolve(__dirname, "../src/style.css"),
  "utf8"
);

fs.writeFileSync(
  path.resolve(__dirname, "../index.js"),
  `
${script}

module.exports = ({
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
        ${style}
      </head>
      <body>
        <div id="container"></div>
      </body>
      <script>
        //script here
        const generateHeader = \${generateHeader.toString()}
        const generateFooter = \${generateFooter.toString()}
        const generateSection = \${generateSection.toString()}
        const pagesFormatter = \${pagesFormatter.toString()}
        const generateDocument = \${generateDocument.toString()}

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
