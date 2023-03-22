import fs from 'fs';

function sleep(ms : number) {
    return new Promise(val => setTimeout(val, ms));
  }

export default class BingImageClient {
    options: any;
    constructor(options: any) {
        this.setOptions(options);
    }

    setOptions(options: JSON) {
        if (this.options) {
            this.options = {
                ...this.options,
                ...options,
            };
        } else {
            this.options = {
                ...options,
            };
        }
    }

    async getImages(
        prompt : string,
    ) {
        const response = await fetch(`https://www.bing.com/images/create?q=${prompt}&rt=4&FORM=GENCRE`, {
            headers: {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "max-age=0",
                "content-type": "application/x-www-form-urlencoded",
                "referrer": "https://www.bing.com/images/create/",
                "origin": "https://www.bing.com",
                redirect: "manual",
                "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.63",
                cookie: this.options.token,
            },
            "method": "POST",
            credentials: 'include'
          })


        const resp = await response.url
        const id = resp.split('id=')[1]
        if (!id) {
            throw new Error('Image ID was returned as null. You may have run out of boosts, or your cookie is invalid.')
        }

        await fetch(response.url)

        // Attempts to retrieve image
        while (true) {

            const getimages = await fetch(`https://www.bing.com/images/create/async/results/${id}?q=${prompt}`, {
            headers: {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "max-age=0",
                "content-type": "application/x-www-form-urlencoded",
                "referrer": "https://www.bing.com/images/create/",
                "origin": "https://www.bing.com",
                "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.63",
                cookie: this.options.token,
            },
            method: "GET",
            });
            
            const resp_text = await getimages.text()
            
            if (resp_text == '') {
                await sleep(100)
            } else {
                const links = [...resp_text.matchAll(/src="([^"]+)"/g)]
                return [ links![0][1], links[1][1], links[2][1], links[3][1] ]
            }
        }
    }


    async downloadImages(
        urls: (RequestInfo | URL)[]
    ) {
        for (const link in urls) {
            await fetch(urls[link], {
            headers: {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "max-age=0",
                "content-type": "application/x-www-form-urlencoded",
                "referrer": "https://www.bing.com/images/create/",
                "origin": "https://www.bing.com",
                "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.63",
                cookie: this.options.token,
            },
            method: "GET",
            })
            .then(async response => {
                const arrayBuffer = (await response.arrayBuffer());
                const buffer = Buffer.from(arrayBuffer);
    
                fs.writeFileSync(`${this.options.dir}/${link}.jpeg`, buffer);
            })
        }
    }
    

}





