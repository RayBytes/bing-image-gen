declare module 'bingimageclient' {
  class BingImageClient {
    constructor(options: any)
    getImages(prompt: string): Array<string>
    downloadImages(urls: (RequestInfo | URL)[]): void
  }
}