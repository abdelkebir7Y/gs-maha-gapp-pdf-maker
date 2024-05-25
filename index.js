
const generateHeader = ({
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
}) => {
  const docHeader = `
    <div class="header">
      <header>
        <div class="section">
          <img alt="" src="https://system.mahaintaj.com/logo.png" />
        </div>
        <div class="divider"></div>
        <div class="section large">
          <h1>${header[0].title}</h1>
        </div>
        <div class="divider"></div>
        <div class="section right">
          ${header[0].docMetaData
            .map((meta) => {
              return `<p>${meta}</p>`;
            })
            .join('<div class="divider horizontal"></div>')}
          <div class="divider horizontal"></div>
          <p id="page-number">Page: </p>
        </div>
      </header>
      <div class="meta-tables-container">
        <table class="meta left">
          ${header[1].leftMetaTable
            .map((meta) => {
              return `
                <tr>
                  <th>${meta[0]}</th>
                  <td>${meta[1]}</td>
                </tr>
              `;
            })
            .join(" ")}
        </table>
        <table class="meta">
          ${header[1].rightMetaTable
            .map((meta) => {
              return `
                <tr>
                  <th>${meta[0]}</th>
                  <td>${meta[1]}</td>
                </tr>
              `;
            })
            .join(" ")}
        </table>
      </div>
    </div>
  `;
  return docHeader;
};

const generateFooter = ({
  qrCode = "",
  table = {
    title: "",
    headers: [""],
    data: [""],
  },
}) => {
  const docFooter = `
    <footer>
      <div class="bottomSection">
        <div class="table-container" >
          <h2>${table.title} :</h2>
          <table>
            <thead>
              <tr>
                ${table.headers
                  .map((header) => {
                    return `<th>${header}</th>`;
                  })
                  .join(" ")}
              </tr>
            </thead>
            <tbody>
              <tr>
                ${table.data
                  .map((data) => {
                    return `<td>${data}</td>`;
                  })
                  .join(" ")}
              </tr>
            </tbody>
          </table>
        </div>
        <div class="qrCode">
          <img alt="" src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${qrCode}" />
        </div>
      </div>
    </footer>
  `;
  return docFooter;
};

const generateSection = ({
  title = "",
  table = {
    columns: [
      {
        key: "",
        title: "",
      },
    ],
    data: [{}],
  },
}) => {
  const docSection = `
  <article>
    <h2>${title} :</h2>
    <table>
      <thead>
        <tr>
          ${table.columns
            .map((column) => {
              return `<th>${column.title}</th>`;
            })
            .join(" ")}
        </tr>
      </thead>
      <tbody>
        ${table.data
          .map((row) => {
            return `
                <tr>
                  ${table.columns
                    .map((column) => {
                      return `<td>${row[column.key]}</td>`;
                    })
                    .join(" ")}
                </tr>
              `;
          })
          .join(" ")}
      </tbody>
    </table>
  </article>`;

  return docSection;
};

const pagesFormatter = () => {
  const container = document.querySelector("#container");
  const children = container.children;

  const getAbsoluteHeight = (element) => {
    const styles = window.getComputedStyle(element);
    const margin =
      parseFloat(styles["marginTop"]) + parseFloat(styles["marginBottom"]);

    console.log(element, element.offsetHeight, margin);

    return element.offsetHeight + margin;
  };

  const getElementMargin = (element) => {
    const styles = window.getComputedStyle(element);
    const margin =
      parseFloat(styles["marginTop"]) + parseFloat(styles["marginBottom"]);
    return margin;
  };

  const header = children[0];
  const headerHeight = getAbsoluteHeight(header);

  const footer = children[children.length - 1];
  const footerHeight = getAbsoluteHeight(footer);

  const pageHeight = 1152 - 57;
  let pageRestHeight;

  const cloneElement = (element) => {
    return element.cloneNode(true);
  };

  const createPage = () => {
    const page = document.createElement("div");
    page.className = "page";
    page.appendChild(cloneElement(header));
    pageRestHeight = pageHeight - headerHeight;
    container.appendChild(page);
    return page;
  };

  const isTableRow = (node) => {
    return node.nodeName.toLowerCase() === "tr";
  };

  const getRowSpanValue = (node) => {
    return node.getAttribute("rowspan");
  };

  const pages = [createPage()];

  const appendChild = (page, child) => {
    page.appendChild(cloneElement(child));
  };

  let extendedParents = [];

  const generatePages = (parents, children, minHeight) => {
    extendedParents = [...parents];
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const childHeight = getAbsoluteHeight(child);

      const isTrNode = isTableRow(child);
      const rowSpanValue = isTrNode
        ? getRowSpanValue(child.firstElementChild) ?? 1
        : 1;
      if (rowSpanValue * childHeight <= pageRestHeight) {
        pageRestHeight = pageRestHeight - childHeight;
        appendChild(extendedParents[extendedParents.length - 1], child);
      } else {
        if (
          pageRestHeight < minHeight ||
          (isTrNode &&
            rowSpanValue * childHeight > minHeight &&
            rowSpanValue * childHeight > pageRestHeight)
        ) {
          const newPage = createPage();
          pages.push(newPage);
          const newParents = [newPage];
          for (let j = 1; j < extendedParents.length; j++) {
            const parentClone = extendedParents[j].cloneNode(false);
            newParents[j - 1].appendChild(parentClone);
            newParents.push(parentClone);
          }
          extendedParents = newParents;
          generatePages(extendedParents, [child], minHeight);
        } else {
          const elementChildren = child.children;

          const childClone = child.cloneNode(false);

          pageRestHeight -= getElementMargin(child);

          extendedParents[extendedParents.length - 1].appendChild(childClone);
          generatePages(
            [...extendedParents, childClone],
            elementChildren,
            minHeight
          );
          extendedParents.pop();
        }
      }
    }
  };

  const childrenArray = Array.from(children).slice(1, children.length - 2);
  generatePages(pages, childrenArray, footerHeight);
  pages[pages.length - 1].appendChild(cloneElement(footer));

  pages.forEach((page, index) => {
    const pageNumber = index + 1;
    const pageNumberElement = page.querySelector("#page-number");
    pageNumberElement.textContent =
      "Page: " + pageNumber + " / " + pages.length;
  });

  container.innerHTML = "";

  pages.forEach((page) => {
    container.appendChild(page);
  });
};

const generateDocument = ({
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
  const container = document.querySelector("#container");

  const docHeader = generateHeader({ header });

  const docFooter = generateFooter(footer);

  const docBody = body
    .map((section) => {
      return generateSection(section);
    })
    .join(" ");

  container.innerHTML = docHeader + " " + docBody + " " + docFooter;
  pagesFormatter();
};

// generateDocument({
//   header: [
//     {
//       title: "Document Title",
//       docMetaData: ["Date: 12-12-2021", "Author: John Doe"],
//     },
//     {
//       rightMetaTable: [
//         ["Right Meta 1", "Meta Data 1"],
//         ["Right Meta 2", "Meta Data 2"],
//       ],
//       leftMetaTable: [
//         ["Left Meta 1", "Meta Data 1"],
//         ["Left Meta 2", "Meta Data 2"],
//       ],
//     },
//   ],
//   body: [
//     {
//       title: "Section 1",
//       table: {
//         headers: ["Header 1", "Header 2", "Header 3"],
//         data: [
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//           ["Data 1", "Data 2", "Data 3"],
//         ],
//       },
//     },
//     {
//       title: "Section 2",
//       table: {
//         headers: ["Header 1", "Header 2", "Header 3"],
//         data: [
//           ["Section 2 Data 1", "Data 2", "Data 3"],
//           ["Section 2 Data 1", "Data 2", "Data 3"],
//           ["Section 2 Data 1", "Data 2", "Data 3"],
//         ],
//       },
//     },
//   ],
//   footer: {
//     qrCode: "https://system.mahaintaj.com",
//     table: {
//       title: "Footer Table",
//       headers: ["Header 1", "Header 2", "Header 3"],
//       data: ["Data 1", "Data 2", "Data 3"],
//     },
//   },
// });


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
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>GS-MAHA-GAPP-PDF-MAKER</title> 
        <style>
          * {
  border: 0px;
  box-sizing: border-box;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  font-style: inherit;
  font-weight: inherit;
  line-height: inherit;
  list-style: none;
  margin: 0px;
  padding: 0px;
  text-decoration: none;
  vertical-align: top;
}

/* heading */

h1 {
  font: bold 100% sans-serif;
  letter-spacing: 0.1em;
  text-align: center;
  text-transform: uppercase;
}

h2 {
  font: bold 100% sans-serif;
  font-size: 0.7em;
  letter-spacing: 0.05em;
  text-align: left;
  text-transform: uppercase;
  margin-bottom: 10px;
  margin-top: 10px;
}

/* table */

table {
  font-size: 75%;
  width: 100%;
}
table {
  border-collapse: separate;
  border-spacing: 2px;
}
th,
td {
  border-width: 1px;
  padding: 0.5em;
  position: relative;
  text-align: left;
}
th,
td {
  border-radius: 0.25em;
  border-style: solid;
}
th {
  background: #eee;
  border-color: #bbb;
}
td {
  border-color: #ddd;
}

/* page */
* {
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
  -moz-print-color-adjust: exact;
  -ms-print-color-adjust: exact;
  -o-print-color-adjust: exact;
}

html {
  font: 16px/1 "Open Sans", sans-serif;
  overflow: auto;
  background: none;
  padding: 0px;
  margin: 0px;
}

body {
  box-sizing: border-box;
  width: 8.5in;
  box-shadow: none;
  margin: 0;
  padding: 0;
}

p {
  font-size: 0.8em;
  padding-left: 8px;
}

.page {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 305mm;
  overflow: hidden;
  padding: 7.5mm;
  box-shadow: none;
  margin: 0;
}

/* header */

header {
  margin: 0 0 2em;
  border: 1px solid #bbb;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-radius: 4px;
  height: 80px;
}
header .divider {
  height: 100%;
  width: 1px;
  background-color: #bbb;
}
header .divider.horizontal {
  width: 100%;
  height: 1px;
  background-color: #bbb;
}
header .section {
  width: 33.33%;
  padding: 8px;
}
header .section.right {
  height: 80%;
  padding: 0px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

header .section.large {
  width: 66.66%;
}

header:after {
  clear: both;
  content: "";
  display: table;
}

header h1 {
  color: #000;
}
header img {
  height: 50px;
}

/* table meta  */

.header .meta-tables-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
}

table.meta {
  width: 36%;
}

table.meta:after {
  clear: both;
  content: "";
  display: table;
}

table.meta th {
  width: 50%;
  text-align: left;
}
table.meta td {
  width: 50%;
}

/* article */

article,
table {
  margin: 0 0 1em;
}
article:after {
  clear: both;
  content: "";
  display: table;
}

/* table items */
table th {
  font-weight: 500;
  text-align: center;
}

#right {
  text-align: right;
}
#left {
  text-align: left;
}

/*footer */
footer {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

footer .bottomSection {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

footer .qrCode {
  border: 0.5px solid #999;
  margin: 0px;
  border-radius: 4px;
  width: 126px;
  height: 126px;
  padding: 8px;
  overflow: hidden;
  background-color: #fff;
}

footer .table-container {
  flex: 1;
  margin: 0px;
}
footer .table-container table {
  margin: 0px;
}

footer .table-container td {
  height: 75px;
}

footer .qrCode img {
  width: 100%;
  height: 100%;
}

@page {
  margin: 0px;
  padding: 0px;
}

        </style>
      </head>
      <body>
        <div id="container"></div>
      </body>
      <script>
        //script here
        const generateHeader = ${generateHeader.toString()}
        const generateFooter = ${generateFooter.toString()}
        const generateSection = ${generateSection.toString()}
        const pagesFormatter = ${pagesFormatter.toString()}
        const generateDocument = ${generateDocument.toString()}

        generateDocument({
          header: ${JSON.stringify(header)},
          body: ${JSON.stringify(body)},
          footer: ${JSON.stringify(footer)},
        });
      </script>
    </html>
  `;
};
