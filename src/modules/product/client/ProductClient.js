import axios from "axios";

import { PRODUCT_API_URL } from "../../../config/constants/secrets.js";

class ProductClient {
  async checkProducStock(productsData, token, transactionid) {
    try {
      const headers = {
        Authorization: token,
        transactionid,
      };
      console.info(
        `Enviando requisição para Product API com dados: ${JSON.stringify(
          productsData
        )} e transactionID ${transactionid}`
      );
      let response = false;
      await axios
        .post(
          `${PRODUCT_API_URL}/check-estoque`,
          { produtos: productsData.produtos },
          { headers }
        )
        .then((res) => {
          console.info(
            `Sucesso resposta do Product-API. TransactionID: ${transactionid}`
          );
          response = true;
        })
        .catch((err) => {
          console.error(
            `Error resposta do Product-API. TransactionID: ${transactionid}`
          );
          response = false;
        });
      return response;
    } catch (err) {
      console.error(
        `Error resposta do Product-API. TransactionID: ${transactionid}`
      );
      return false;
    }
  }
}
export default new ProductClient();
