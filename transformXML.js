const fs = require("fs");
const { parseStringPromise, Builder } = require("xml2js");
const products = require("./products.json");

let reviewId = 1;

function getFirstSentence(paragraph) {
  const match = paragraph.match(/(.*?[\.\?\!])\s/);
  return match ? match[1] : paragraph; // If no match, return full paragraph as it's only one sentence.
}

function getProductUrl(product_id) {
  const product = products.find((p) => p.product_id === product_id);
  return product ? product.confirmed_url : null;
}

const getProductSku = (product_id) => {
  const product = products.find((p) => p.product_id === product_id);
  return product ? product.sku : null;
};
async function transformXML(inputFile, outputFile) {
  try {
    const data = fs.readFileSync(inputFile, "utf8");
    const parsedData = await parseStringPromise(data, { explicitArray: false });

    // Build the new reviews

    const reviews = parsedData.reviews.review.map((review) => {
      isValidProductUrl = getProductUrl(review["g:product_id"]);

      if (isValidProductUrl) {
        return {
          review_id: reviewId++,
          reviewer: {
            name: review["g:reviewer_name"],
            reviewer_id: review["g:reviewer_id"],
          },
          review_timestamp: new Date(review["g:review_timestamp"]).toISOString(),
          title: getFirstSentence(review["g:review_content"]),
          content: review["g:review_content"],
          review_url: {
            $: { type: "singleton" }, // Definir "type" como atributo
            _: review["g:product_url"], // Definir el contenido de la etiqueta
          },
          ratings: {
            overall: {
              $: { min: "1", max: "5" }, // Definir "min" y "max" como atributos
              _: review["g:review_rating"], // Definir el valor de la etiqueta
            },
          },
          products: {
            product: {
              product_ids: {
                skus: {
                  sku: getProductSku(review["g:product_id"]),
                },
              },
              product_url: getProductUrl(review["g:product_id"]),
            },
          },
        };
      }

      return null;
    });

    const finalReviews = reviews.filter((review) => review !== null);

    // Build the new XML output
    const output = {
      feed: {
        $: {
          "xmlns:vc": "http://www.w3.org/2007/XMLSchema-versioning",
          "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
          "xsi:noNamespaceSchemaLocation":
            "http://www.google.com/shopping/reviews/schema/product/2.3/product_reviews.xsd",
        },
        version: "2.3",
        // aggregator: {
        //   name: "Sample Reviews Aggregator (if applicable)",
        // },
        publisher: {
          name: "Kozie Clothes",
          favicon: "https://www.kozieclothes.com/favicon.ico",
        },
        reviews: {
          review: finalReviews,
        },
      },
    };

    // Convertir el objeto de salida a XML
    const builder = new Builder();
    const xml = builder.buildObject(output);

    // Guardar el XML resultante
    fs.writeFileSync(outputFile, xml);
    console.log("El archivo ha sido transformado y guardado correctamente.");
  } catch (error) {
    console.error("Error al procesar el archivo XML:", error);
  }
}

// Ejecutar la función de transformación
transformXML("input.xml", "output.xml");
