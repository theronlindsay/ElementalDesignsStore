//This manages connections to square, keep it here for auditing
//IN PROGRESS
// Docs: https://github.com/square/square-nodejs-sdk/blob/master/reference.md

import { SquareClient, SquareEnvironment, SquareError } from "square";

const client = new SquareClient({ token: "process.env.SQUARE_ACCESS_TOKEN", environment: SquareEnvironment.Sandbox, });


await client.payments.create({
    sourceId: "ccof:GaJGNaZa8x4OgDJn4GB",
    idempotencyKey: "7b0f3ec5-086a-4871-8f13-3c81b3875218",
    amountMoney: {
        amount: BigInt(1000),
        currency: "USD",
    },
    appFeeMoney: {
        amount: BigInt(10),
        currency: "USD",
    },
    autocomplete: true,
    customerId: "W92WH6P11H4Z77CTET0RNTGFW8",
    locationId: "L88917AVBK2S5",
    referenceId: "123456",
    note: "Brief description",
});