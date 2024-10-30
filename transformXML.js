const fs = require("fs");
const { parseStringPromise, Builder } = require("xml2js");

async function transformXML(inputFile, outputFile) {
  try {
    // Leer y parsear el archivo XML
    const data = fs.readFileSync(inputFile, "utf8");
    const parsedData = await parseStringPromise(data, { explicitArray: false });

    // Extraer y transformar los datos según el nuevo formato
    const reviews = parsedData.reviews.review.map((review) => ({
      reviewer: {
        name: review["g:reviewer_name"],
        reviewer_id: review["g:reviewer_id"],
      },
      review_timestamp: new Date(review["g:review_timestamp"]).toISOString(),
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
          product_url: review["g:product_url"],
        },
      },
    }));

    // Construir la nueva estructura XML
    const output = {
      feed: {
        $: {
          "xmlns:vc": "http://www.w3.org/2007/XMLSchema-versioning",
          "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
          "xsi:noNamespaceSchemaLocation":
            "http://www.google.com/shopping/reviews/schema/product/2.3/product_reviews.xsd",
        },
        version: "2.3",
        aggregator: {
          name: "Sample Reviews Aggregator (if applicable)",
        },
        publisher: {
          name: "Kozie Clothes",
          favicon: "https://www.kozieclothes.com/favicon.ico",
        },
        reviews: {
          review: reviews,
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
