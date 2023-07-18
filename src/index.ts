/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npx wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npx wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// These initial Types are based on bindings that don't exist in the project yet,
// you can follow the links to learn how to implement them.

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket
}

export const worker = {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		/**
		 * Example someHost at URL is set up to respond with HTML
		 * Replace URL with the host you wish to send requests to
		 */
		//const someHost = "https://examples.cloudflareworkers.com/demos";
		const url =
			"https://aggregator.healofy.com/_ah/api/apis/v1/getLocalNotificationsData?installId=355b5fd4-d9b8-4dfa-a91d-1793654e2bf7&userId=8b50c3c5-b01c-4eb5-bb89-58aee98043e6&syncTime=0";

		/**
		 * gatherResponse awaits and returns a response body as a string.
		 * Use await gatherResponse(..) in an async function to get the response body
		 * @param {Response} response
		 */
		async function gatherResponse(response: any) {
			const { headers } = response;
			const contentType = headers.get("content-type") || "";
			if (contentType.includes("application/json")) {
				return JSON.stringify(await response.json());
			} else if (contentType.includes("application/text")) {
				return response.text();
			} else if (contentType.includes("text/html")) {
				return response.text();
			} else {
				return response.text();
			}
		}

		let init = {
			body: "",
			method: "GET",
			headers: {
				"content-type": "application/json;charset=UTF-8",
			},
		};

		let response = await fetch(url, init);
		let results = await gatherResponse(response);
		// create Date object for current location
		var d = new Date();

		// convert to msec
		// subtract local time zone offset
		// get UTC time in msec
		var utc = d.getTime() + d.getTimezoneOffset() * 60000;

		// create new Date object for different city
		// using supplied offset
		var nd = new Date(utc + 3600000 * 5.5);

		nd.setHours(0, 0, 0, 0);

		let finalDate = nd.getTime();
		let resStr = "";
		for (const dt of results.payload.notificationData) {
			//results.payload.notificationData[0].notificationDay
			if (dt.notificationDay === finalDate.toString()) {
				resStr = dt.data.title + " \n" + dt.data.messages[0];
			}
		}

		init = {
			body: JSON.stringify({
				messaging_product: "whatsapp",
				to: "+919042967143",
				type: "template",
				template: {
					name: "hello_world",
					language: {
						code: "en_US",
					},
				},
			}),
			method: "POST",
			headers: {
				"content-type": "application/json;charset=UTF-8",
			},
		};
		response = await fetch(
			"https://graph.facebook.com/v17.0/100307249813095/messages",
			init
		);
		results = await gatherResponse(response);
		return new Response(results, init);

		return new Response(results, init);
	},
};
