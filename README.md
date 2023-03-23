# bing-image-gen

Generates images from microsoft's Image Creation website.

# Installation

Install with:
`npm install bingimageclient@0.2.0`

Use as:
`const { BingImageClient } = require('bingimageclient');`

# Authentication

To authenticate yourself, please firstly:
1. Go to https://www.bing.com/images/create
2. Go into inspect element (Right click -> Inspect Element)
3. Go to the Application tab on the top of th new tabe which has opened up (Expand it if you can't see it).
4. Go to the Cookies 
5. Search up 'KievRPSSecAuth' and input the value like you see it in [`demos/imagedownload.ts`](demos/imagedownload.ts)

And you are now authenticated!

# Usage

Look at [`demos/imagedownload.ts`](demos/imagedownload.ts) for example usage.

# Credits

- [@waylaidwanderer](https://github.com/waylaidwanderer) - Took inspiration from his repository 
- [@acheong0](https://github.com/acheong0) - Reversed bing's image endpoints
