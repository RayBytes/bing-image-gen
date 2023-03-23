import BingImageClient from '../src/BingImageClient'

async function main() {
    const client = new BingImageClient({
        // Use KievRPSSecAuth cookie, it works best from what I've seen.
        token: 'KievRPSSecAuth=YOURTOKENGOESHERE',
        // Here is the directory to go through. '.' means local directory. (Don't end the directory url with /)
        dir: '.',
        // Make microsoft send you a lovely email
        notify: false
    });
    const result = await client.getImages('cat');
    await client.downloadImages(result)
}

main()
