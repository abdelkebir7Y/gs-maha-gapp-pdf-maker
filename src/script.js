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
    headers: [""],
    data: [[""]],
  },
}) => {
  const docSection = `
  <article>
    <h2>${title} :</h2>
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
        ${table.data
          .map((data) => {
            return `
              <tr>
                ${data
                  .map((d) => {
                    return `<td>${d}</td>`;
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

  generatePages(pages, [children[1], children[2]], footerHeight);
  pages[pages.length - 1].appendChild(cloneElement(footer));

  console.log(pages.length, pages);

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

generateDocument({
  header: [
    {
      title: "Document Title",
      docMetaData: ["Date: 12-12-2021", "Author: John Doe"],
    },
    {
      rightMetaTable: [
        ["Right Meta 1", "Meta Data 1"],
        ["Right Meta 2", "Meta Data 2"],
      ],
      leftMetaTable: [
        ["Left Meta 1", "Meta Data 1"],
        ["Left Meta 2", "Meta Data 2"],
      ],
    },
  ],
  body: [
    {
      title: "Section 1",
      table: {
        headers: ["Header 1", "Header 2", "Header 3"],
        data: [
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
          ["Data 1", "Data 2", "Data 3"],
        ],
      },
    },
    {
      title: "Section 2",
      table: {
        headers: ["Header 1", "Header 2", "Header 3"],
        data: [
          ["Section 2 Data 1", "Data 2", "Data 3"],
          ["Section 2 Data 1", "Data 2", "Data 3"],
          ["Section 2 Data 1", "Data 2", "Data 3"],
        ],
      },
    },
  ],
  footer: {
    qrCode: "https://system.mahaintaj.com",
    table: {
      title: "Footer Table",
      headers: ["Header 1", "Header 2", "Header 3"],
      data: ["Data 1", "Data 2", "Data 3"],
    },
  },
});
