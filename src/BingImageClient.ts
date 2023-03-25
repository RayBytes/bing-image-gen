import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { setTimeout } from "node:timers/promises";
import { createWriteStream } from "node:fs";

export interface IOptions {
  token: string;
  dir?: string;
  notify?: boolean;
}

const BASE_ENDPOINT = "https://www.bing.com/images/create";

export default class BingImageClient {
  private readonly headers: Headers;
  private readonly options: IOptions;
  public constructor(options: IOptions) {
    this.headers = new Headers({
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "max-age=0",
      "content-type": "application/x-www-form-urlencoded",
      "referrer": BASE_ENDPOINT,
      "origin": new URL(BASE_ENDPOINT).origin,
      "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.63",
      "cookie": options.token,
    });
    this.options = Object.assign({ dir: process.cwd(), notify: false }, options);
  }

  public async getImages(prompt: string) {
    const response = await fetch(`${BASE_ENDPOINT}?q=${prompt}&rt=4&FORM=GENCRE`, {
      headers: {
        ...this.headers,
        redirect: "manual",
      },
      method: "POST",
      credentials: "include",
    });

    let id = new URLSearchParams(response.url).get("id");
    await fetch(`https://www.bing.com/images/create?q=${prompt}&rt=4&FORM=GENCRE&id=${id}`);
    if (!id) {
      const response = await fetch(`https://www.bing.com/images/create?q=${prompt}&rt=3&FORM=GENCRE`, {
        headers: {
          ...this.headers,
          redirect: "manual",
        },
        method: "POST",
        credentials: "include",
      });

      id = new URLSearchParams(response.url).get("id");
      await fetch(`${BASE_ENDPOINT}?q=${prompt}&rt=3&FORM=GENCRE&id=${id}&nfy=1`, {
        headers: this.headers,
        method: "GET",
      });
      if (this.options.notify) {
        await fetch(`${BASE_ENDPOINT}/async/notify/CreationComplete?rid=${id}&nfy=1`, {
          headers: this.headers,
          method: "GET",
        });
      }

      if (!id) {
        throw new Error("Image ID was returned as null. You may have run out of boosts, or your cookie is invalid.");
      }
    }

    // Attempts to retrieve image
    while (true) {
      const getimages = await fetch(`${BASE_ENDPOINT}/async/results/${id}?q=${prompt}`, {
        headers: this.headers,
        method: "GET",
      });

      const resp_text = await getimages.text();

      if (resp_text == "") {
        await setTimeout(100);
      } else {
        const links = [...resp_text.matchAll(/src="([^"]+)"/g)];
        return [links[0][1], links[1][1], links[2][1], links[3][1]];
      }
    }
  }

  public async downloadImages(urls: (RequestInfo | URL)[]) {
    for (const url of urls) {
      const response = await fetch(url, {
        headers: this.headers,
        method: "GET",
      });
      const file = createWriteStream(`${this.options.dir}/${url}.jpeg`);
      // @ts-ignore
      // dont know why typescript is complaining about this
      const webStreamToNode = Readable.fromWeb(response.body);

      await pipeline(webStreamToNode, file);
    }
  }
}
