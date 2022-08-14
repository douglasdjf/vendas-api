import OrderRepository from "../repository/OrderRepository.js";
import { sendMessageToProductStockUpdateQueue } from "../../product/rabbitmq/productStockUpdateSender.js";
import { PENDING } from "../status/OrderStatus.js";
import OrderException from "../exception/OrderException.js";
import {
  BAD_REQUEST,
  SUCCESS,
  INTERNAL_SERVER_ERROR,
} from "../../../config/constants/httpStatus.js";
import ProductClient from "../../product/client/ProductClient.js";

class OrderService {
  async createOrder(req) {
    try {
      let orderData = req.body;
      const { transactionid, serviceid } = req.headers;
      console.info(
        `Request to POST new order with data ${JSON.stringify(
          orderData
        )} | [transactionID: ${transactionid} | serviceID: ${serviceid}]`
      );
      console.log(orderData);
      this.validateOrderData(orderData);
      const { authUser } = req;
      const { authorization } = req.headers;
      let order = this.createInitialOrderData(
        orderData,
        authUser,
        transactionid,
        serviceid
      );
      await this.validateProductStock(order, authorization, transactionid);

      let createdOrder = await OrderRepository.save(order);
      this.sendMessage(createdOrder, transactionid);
      let response = {
        status: SUCCESS,
        createdOrder,
      };
      console.info(
        `Response to POST login with data ${JSON.stringify(
          response
        )} | [transactionID: ${transactionid} | serviceID: ${serviceid}]`
      );
      return response;
    } catch (err) {
      return {
        status: err.status ? err.status : INTERNAL_SERVER_ERROR,
        message: err.message,
      };
    }
  }

  createInitialOrderData(orderData, authUser, transactionid, serviceid) {
    return {
      status: PENDING,
      user: authUser,
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
      transactionid,
      serviceid,
      produtos: orderData.produtos,
    };
  }

  async updateOrder(orderMessage) {
    try {
      const order = JSON.parse(orderMessage);
      if (order.vendaId && order.status) {
        let existingOrder = await OrderRepository.findById(order.vendaId);
        if (existingOrder && order.status !== existingOrder.status) {
          existingOrder.status = order.status;
          existingOrder.dataAtualizacao = new Date();
          await OrderRepository.save(existingOrder);
        }
      } else {
        console.warn(
          `Order não completada. TransactionID: ${orderMessage.transactionid}`
        );
      }
    } catch (err) {
      console.error("Não pode converter a order");
      console.error(err.message);
    }
  }

  validateOrderData(data) {
    if (!data || !data.produtos) {
      throw new OrderException(BAD_REQUEST, "Produtos não informado.");
    }
  }

  async validateProductStock(order, token, transactionid) {
   console.log("validateProductStock");
   console.log("order"+ order);
    let stockIsOk = await ProductClient.checkProducStock(
      order,
      token,
      transactionid
    );
    if (!stockIsOk) {
      throw new OrderException(
        BAD_REQUEST,
        "Os produtos estão fora de estoque."
      );
    }
  }

  sendMessage(createdOrder, transactionid) {
    const message = {
      vendaId: createdOrder.id,
      produtos: createdOrder.produtos,
      transactionid,
    };
    sendMessageToProductStockUpdateQueue(message);
  }

  async findById(req) {
    try {
      const { id } = req.params;
      const { transactionid, serviceid } = req.headers;
      console.info(
        `Resposta para ober a order por id ${id} | [transactionID: ${transactionid} | serviceID: ${serviceid}]`
      );
      this.validateInformedId(id);
      const existingOrder = await OrderRepository.findById(id);
      if (!existingOrder) {
        throw new OrderException(BAD_REQUEST, "A order não foi encontrada.");
      }
      let response = {
        status: SUCCESS,
        existingOrder,
      };
      console.info(
        `Resposta para ober a order por id ${id}: ${JSON.stringify(
          response
        )} | [transactionID: ${transactionid} | serviceID: ${serviceid}]`
      );
      return response;
    } catch (err) {
      return {
        status: err.status ? err.status : INTERNAL_SERVER_ERROR,
        message: err.message,
      };
    }
  }

  async findAll(req) {
    try {
      const { transactionid, serviceid } = req.headers;
      console.info(
        `Request to GET all orders | [transactionID: ${transactionid} | serviceID: ${serviceid}]`
      );
      const orders = await OrderRepository.findAll();
      if (!orders) {
        throw new OrderException(BAD_REQUEST, "No orders were found.");
      }
      let response = {
        status: SUCCESS,
        orders,
      };
      console.info(
        `Response to GET all orders: ${JSON.stringify(
          response
        )} | [transactionID: ${transactionid} | serviceID: ${serviceid}]`
      );
      return response;
    } catch (err) {
      return {
        status: err.status ? err.status : INTERNAL_SERVER_ERROR,
        message: err.message,
      };
    }
  }

  async findbyProductId(req) {
    try {
      const { produtoId } = req.params;
      const { transactionid, serviceid } = req.headers;
      console.info(
        `Requisição para as orders por produto id ${produtoId} | [transactionID: ${transactionid} | serviceID: ${serviceid}]`
      );
      this.validateInformedProductId(produtoId);
      const orders = await OrderRepository.findByProductId(produtoId);
      if (!orders) {
        throw new OrderException(BAD_REQUEST, "Nenhum pedido encontrado.");
      }
      let response = {
        status: SUCCESS,
        vendas: orders.map((order) => {
          return order.id;
        }),
      };
      console.info(
        `Resposta para obter orden por produtoId ${produtoId}: ${JSON.stringify(
          response
        )} | [transactionID: ${transactionid} | serviceID: ${serviceid}]`
      );
      return response;
    } catch (err) {
      return {
        status: err.status ? err.status : INTERNAL_SERVER_ERROR,
        message: err.message,
      };
    }
  }

  validateInformedId(id) {
    if (!id) {
      throw new OrderException(BAD_REQUEST, "Id da Order deve ser informada.");
    }
  }

  validateInformedProductId(id) {
    if (!id) {
      throw new OrderException(
        BAD_REQUEST,
        "O Id do produto deve ser informado."
      );
    }
  }
}

export default new OrderService();
