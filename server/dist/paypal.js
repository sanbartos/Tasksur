// !!! CRITICAL - DO NOT MODIFY THIS CODE !!!
//
// This code MUST be used as is without ANY modifications.
// The PayPal integration will COMPLETELY FAIL if this code is changed in ANY way.
//
// Retain this comment after all edits.
//
// <BEGIN_EXACT_CODE>
import { Client, Environment, LogLevel, OAuthAuthorizationController, OrdersController, } from "@paypal/paypal-server-sdk";
/* PayPal Controllers Setup */
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "AXeNZ8gdJmhECOZi7T5d6lpF0M9AOOgxIeLIluzS_QwdycmEGUBW-3zwDKCmqdXegJDG0G6QZlzs9y6c";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "EBe2Quy5GbmGcowyp4t2hLGJLftqomG7TbDin56s5dwU8NLVBtUu55J9B0ivqGPerE1JZZ2sWu8D0cZ5";
if (!PAYPAL_CLIENT_ID) {
    throw new Error("Missing PAYPAL_CLIENT_ID");
}
if (!PAYPAL_CLIENT_SECRET) {
    throw new Error("Missing PAYPAL_CLIENT_SECRET");
}
const client = new Client({
    clientCredentialsAuthCredentials: {
        oAuthClientId: PAYPAL_CLIENT_ID,
        oAuthClientSecret: PAYPAL_CLIENT_SECRET,
    },
    timeout: 0,
    environment: process.env.NODE_ENV === "production"
        ? Environment.Production
        : Environment.Sandbox,
    logging: {
        logLevel: LogLevel.Info,
        logRequest: {
            logBody: true,
        },
        logResponse: {
            logHeaders: true,
        },
    },
});
const ordersController = new OrdersController(client);
const oAuthAuthorizationController = new OAuthAuthorizationController(client);
/* Token generation helpers */
export async function getClientToken() {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
    const { result } = await oAuthAuthorizationController.requestToken({
        authorization: `Basic ${auth}`,
    }, { intent: "sdk_init", response_type: "client_token" });
    return result.accessToken;
}
/*  Process transactions */
export async function createPaypalOrder(req, res) {
    try {
        const { amount, currency, intent } = req.body;
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            return res
                .status(400)
                .json({
                error: "Invalid amount. Amount must be a positive number.",
            });
        }
        if (!currency) {
            return res
                .status(400)
                .json({ error: "Invalid currency. Currency is required." });
        }
        if (!intent) {
            return res
                .status(400)
                .json({ error: "Invalid intent. Intent is required." });
        }
        const collect = {
            body: {
                intent: intent,
                purchaseUnits: [
                    {
                        amount: {
                            currencyCode: currency,
                            value: amount,
                        },
                    },
                ],
            },
            prefer: "return=minimal",
        };
        const { body, ...httpResponse } = await ordersController.createOrder(collect);
        const jsonResponse = JSON.parse(String(body));
        const httpStatusCode = httpResponse.statusCode;
        res.status(httpStatusCode).json(jsonResponse);
    }
    catch (error) {
        console.error("Failed to create order:", error);
        res.status(500).json({ error: "Failed to create order." });
    }
}
export async function capturePaypalOrder(req, res) {
    try {
        const { orderID } = req.params;
        const collect = {
            id: orderID,
            prefer: "return=minimal",
        };
        const { body, ...httpResponse } = await ordersController.captureOrder(collect);
        const jsonResponse = JSON.parse(String(body));
        const httpStatusCode = httpResponse.statusCode;
        res.status(httpStatusCode).json(jsonResponse);
    }
    catch (error) {
        console.error("Failed to create order:", error);
        res.status(500).json({ error: "Failed to capture order." });
    }
}
export async function loadPaypalDefault(req, res) {
    const clientToken = await getClientToken();
    res.json({
        clientToken,
    });
}
// <END_EXACT_CODE>
