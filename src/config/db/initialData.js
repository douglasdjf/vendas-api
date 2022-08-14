import Order from "../../modules/sales/model/Order.js";
import { v4 as uuidv4 } from "uuid";

export async function createInitialData() {
  try {
    let existingData = await Order.find();
    if (existingData && existingData.length > 0) {
      console.info("Remove dados existentes...");
      await Order.collection.drop();
    }
    await Order.create({
      produtos: [
        {
          produtoId: 1001,
          quantidade: 2,
        },
        {
          produtoId: 1002,
          quantidade: 1,
        },
        {
          produtoId: 1003,
          quantidade: 1,
        },
      ],
      user: {
        id: "a1sd1as5d165ads1s6",
        name: "User Test",
        email: "usertest@gmail.com",
      },
      status: "APPROVED",
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
      transactionid: uuidv4(),
      serviceid: uuidv4(),
    });
    await Order.create({
      produtos: [
        {
          produtoId: 1001,
          quantidade: 4,
        },
        {
          produtoId: 1003,
          quantidade: 2,
        },
      ],
      user: {
        id: "asd1as9d1asd1asd1as5d",
        name: "User Test 2",
        email: "usertest2@gmail.com",
      },
      status: "REJECTED",
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
      transactionid: uuidv4(),
      serviceid: uuidv4(),
    });
    let initialData = await Order.find();
    console.info(
      `Inicialização de dados gerado: ${JSON.stringify(initialData, undefined, 4)}`
    );
  } catch (error) {
    console.error(error);
  }
}
